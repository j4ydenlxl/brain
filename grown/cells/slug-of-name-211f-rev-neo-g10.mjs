// slug-of-name-211f-rev-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"slug-of-name-211f-rev-neo-g10","class":"slug-of-name-211f-rev","generation":10,"lane":"neo","grownFrom":["which name has the slug lucy-the-lobster","lady-edwina-of-essex is the slug of which name","which name has the slug woody-the-woodchuck","which name has the slug snowy-the-prairie-dog","sand-mountain-sam is the slug of which name","name the name whose slug is malverne-mel","name the name whose slug is shubenacadie-sam","name the name whose slug is mount-joy-minnie","name the name whose slug is balzac-billy","which name has the slug chilly-charlie","two-rivers-tunnel is the slug of which name","name the name whose slug is patty-pagoda","harleysville-hank is the slug of which name","pisgah-penny is the slug of which name","name the name whose slug is buckeye-chuck","beardsley-bart is the slug of which name","mount-gretna-grady is the slug of which name","which name has the slug polk-county-paula","name the name whose slug is wiarton-willie","name the name whose slug is boise-bill"],"version":1});

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
knowLoad([{"id":"fr-tidytuesday-groundhogs-bfd00a","columns":["name","slug","shortname","city"],"n":75,"cols":[{"s":"Punxsutawney Phil|Wiarton Willie|Concord Charlie|Buckeye Chuck|Shubenacadie Sam|Woodstock Willie|Bowman Bill|Lawrenceville Lucy|Oil Springs Ollie|Beardsley Bart|General Beauregard Lee|Benny the Bass|Buffalo Bert|Boise Bill|Unadilla Billie|Balzac Billy|Bee Cave Bob|Concord Casimir|Chilly Charlie|Queen City Charlie|Chesapeake Chuck|Chuck Wood|Staten Island Chuck|Chuckles the Groundhog|Dunkirk Dave|Dover Doug|Stumptown Fil|Fenwick Flossie|Fred la Marmotte|French Creek Freddie|Flatiron Freddy|Gertie the Groundhog|Gordy the Groundhog|Mount Gretna Grady|Grover and Sue|Holtsville Hal|Harleysville Hank|Heaven’s Wildlife Harvey|Cluxatawney Henrietta|Hope the Groundhog|Smith Lake Jake|Jimmy the Groundhog|Lady Edwina of Essex|Lander Lil|Lucy the Lobster|Malverne Mel|Manitoba Merv|Middlemiss Mike|Mount Joy Minnie|Ms. G|Okanagan Okie|Octoraro Orphie|MT Parker|Patty Pagoda|Polk County Paula|Pisgah Penny|Potomac Phil|Poppy the Groundhog|Poor Richard|Sand Mountain Sam|Schnogadahl Sammi|Scramble the Duck|Snohomish Slew|Snerd|Snowy the Prairie Dog|Stonewall Jackson|Stormy Marmot|Tinicum Tim|Two Rivers Tunnel|Uni the Groundhog|Van Island Violet|Sir Walter Wally|Wildwood Willie|Woody the Woodchuck|Yonah the Groundhog","sep":"|"},{"s":"punxsutawney-phil|wiarton-willie|concord-charlie|buckeye-chuck|shubenacadie-sam|woodstock-willie|bowman-bill|lawrenceville-lucy|oil-springs-ollie|beardsley-bart|general-beauregard-lee|benny-the-bass|buffalo-bert|boise-bill|unadilla-billie|balzac-billy|bee-cave-bob|concord-casimir|chilly-charlie|queen-city-charlie|chesapeake-chuck|chuck-wood|staten-island-chuck|chuckles-the-groundhog|dunkirk-dave|dover-doug|stumptown-fil|fenwick-flossie|fred-la-marmotte|french-creek-freddie|flatiron-freddy|gertie-the-groundhog|gordy-the-groundhog|mount-gretna-grady|grover-and-sue|holtsville-hal|harleysville-hank|heavens-wildlife-harvey|cluxatawney-henrietta|hope-the-groundhog|smith-lake-jake|jimmy-the-groundhog|lady-edwina-of-essex|lander-lil|lucy-the-lobster|malverne-mel|manitoba-merv|middlemiss-mike|mount-joy-minnie|ms-g|okanagan-okie|octoraro-orphie|mt-parker|patty-pagoda|polk-county-paula|pisgah-penny|potomac-phil|poppy-the-groundhog|poor-richard|sand-mountain-sam|schnogadahl-sammi|scramble-the-duck|snohomish-slew|snerd|snowy-the-prairie-dog|stonewall-jackson|stormy-marmot|tinicum-tim|two-rivers-tunnel|uni-the-groundhog|van-island-violet|sir-walter-wally|wildwood-willie|woody-the-woodchuck|yonah-the-groundhog","sep":"|"},{"f":"0Phil|0Willie|0Charlie|2uck|0Sam|0Willie|0Bill|0Lucy|0Ollie|0Bart|1eau|2nny|2rt|1ill|4ie|4y|1ob|0Casimir|1harlie|7|2uck|5|5|5les|0Dave|1oug|0Filbert|1lossie|1red|4die|5y|0Gertie|1ordy|1rady|2over and Sue|0Hal|2nk|2rvey|1enrietta|1ope|0Jake|1immy|0Lady Edwina|1il|1ucy|0Malverne Mel|1erv|1ike|2nnie|1s. G|0Okie|1rphie|0Parker|2tty|2ula|1enny|1hil|1oppy|0Richard|0Sam|3mi|1cramble|1lew|1nerd|2owy|1tonewall|3rmy|0Tim|1unnel|0Uni|0Violet|0Wally|1illie|1oody|0Yonah","sep":"|"},{"s":"Punxsutawney|Wiarton|Athens|Marion|Shubenacadie|Woodstock|Stephens City|Lawrenceville|Oil Springs|Bridgeport|Jackson|Buckeye Lake|Buffalo|Boise|Unadilla|Balzac|Bee Cave|Concord|Woodstock|Cumberland|Newport News|Quincy|New York City|Manchester|Dunkirk|Dover Township|Portland|Pelham|Val-d’Espoir|Upshur County|Boulder|Hanna City|Milwaukee|Mount Gretna|Pine Grove|Holtsville|Harleysville|Oil Springs|Katonah|Hope|Smith Lake|Sun Prairie|West Orange|Lander|Barrington|Malverne|Stonewall|Melbourne|Mount Joy|Lincoln|Vernon|Quarryville|Lancaster|Reading|Des Moines|Brevard|Washington DC|Millersville|York|Albertville|Kresgeville|Eastford|Snohomish|Garner|Pend Oreille County|Wantage|Aurora|Philadelphia|Cape Breton|Myerstown|Nanaimo|Raleigh|Toledo|Howell|Cleveland","sep":"|"}]}]);
const COLONY = [
{"id":"n-7f479a21","guard":[["hasAny",["appears in","contains","element","has","includes","item number","name","nth","position"]],["not",["has","me"]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-b6a4dc60","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-314aabca","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-4844e97f","guard":[["hasAny",["element","item number","name","nth","position"]],["not",["has","me"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-18f0de14","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["not",["has","me"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-2fd2c4e9","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]],["not",["has","me"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-35d4cba2","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-48268add","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-ac26d404","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-b32b7592","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-d354f0cc","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]],["not",["has","me"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-fb3d15dd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]],["not",["has","me"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-5a0d46e1","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug lucy-the-lobster":"The name whose slug is lucy-the-lobster is Lucy the Lobster.","lady-edwina-of-essex is the slug of which name":"The name whose slug is lady-edwina-of-essex is Lady Edwina of Essex.","which name has the slug woody-the-woodchuck":"The name whose slug is woody-the-woodchuck is Woody the Woodchuck.","which name has the slug snowy-the-prairie-dog":"The name whose slug is snowy-the-prairie-dog is Snowy the Prairie Dog.","sand-mountain-sam is the slug of which name":"The name whose slug is sand-mountain-sam is Sand Mountain Sam.","name the name whose slug is malverne-mel":"The name whose slug is malverne-mel is Malverne Mel.","name the name whose slug is shubenacadie-sam":"The name whose slug is shubenacadie-sam is Shubenacadie Sam.","name the name whose slug is mount-joy-minnie":"The name whose slug is mount-joy-minnie is Mount Joy Minnie.","name the name whose slug is balzac-billy":"The name whose slug is balzac-billy is Balzac Billy.","which name has the slug chilly-charlie":"The name whose slug is chilly-charlie is Chilly Charlie.","two-rivers-tunnel is the slug of which name":"The name whose slug is two-rivers-tunnel is Two Rivers Tunnel.","name the name whose slug is patty-pagoda":"The name whose slug is patty-pagoda is Patty Pagoda.","harleysville-hank is the slug of which name":"The name whose slug is harleysville-hank is Harleysville Hank.","pisgah-penny is the slug of which name":"The name whose slug is pisgah-penny is Pisgah Penny.","name the name whose slug is buckeye-chuck":"The name whose slug is buckeye-chuck is Buckeye Chuck.","beardsley-bart is the slug of which name":"The name whose slug is beardsley-bart is Beardsley Bart.","mount-gretna-grady is the slug of which name":"The name whose slug is mount-gretna-grady is Mount Gretna Grady.","which name has the slug polk-county-paula":"The name whose slug is polk-county-paula is Polk County Paula.","name the name whose slug is wiarton-willie":"The name whose slug is wiarton-willie is Wiarton Willie.","name the name whose slug is boise-bill":"The name whose slug is boise-bill is Boise Bill.","name the name whose slug is dover-doug":"The name whose slug is dover-doug is Dover Doug.","which name has the slug cluxatawney-henrietta":"The name whose slug is cluxatawney-henrietta is Cluxatawney Henrietta.","which name has the slug dunkirk-dave":"The name whose slug is dunkirk-dave is Dunkirk Dave.","name the name whose slug is heavens-wildlife-harvey":"The name whose slug is heavens-wildlife-harvey is Heaven’s Wildlife Harvey.","staten-island-chuck is the slug of which name":"The name whose slug is staten-island-chuck is Staten Island Chuck.","which name has the slug poppy-the-groundhog":"The name whose slug is poppy-the-groundhog is Poppy the Groundhog.","poor-richard is the slug of which name":"The name whose slug is poor-richard is Poor Richard.","name the name whose slug is smith-lake-jake":"The name whose slug is smith-lake-jake is Smith Lake Jake.","which name has the slug middlemiss-mike":"The name whose slug is middlemiss-mike is Middlemiss Mike.","which name has the slug schnogadahl-sammi":"The name whose slug is schnogadahl-sammi is Schnogadahl Sammi.","chesapeake-chuck is the slug of which name":"The name whose slug is chesapeake-chuck is Chesapeake Chuck.","benny-the-bass is the slug of which name":"The name whose slug is benny-the-bass is Benny the Bass.","which name has the slug chuck-wood":"The name whose slug is chuck-wood is Chuck Wood.","general-beauregard-lee is the slug of which name":"The name whose slug is general-beauregard-lee is General Beauregard Lee.","which name has the slug stumptown-fil":"The name whose slug is stumptown-fil is Stumptown Fil.","name the name whose slug is fenwick-flossie":"The name whose slug is fenwick-flossie is Fenwick Flossie.","name the name whose slug is hope-the-groundhog":"The name whose slug is hope-the-groundhog is Hope the Groundhog.","buffalo-bert is the slug of which name":"The name whose slug is buffalo-bert is Buffalo Bert.","fred-la-marmotte is the slug of which name":"The name whose slug is fred-la-marmotte is Fred la Marmotte.","name the name whose slug is bowman-bill":"The name whose slug is bowman-bill is Bowman Bill.","french-creek-freddie is the slug of which name":"The name whose slug is french-creek-freddie is French Creek Freddie.","tinicum-tim is the slug of which name":"The name whose slug is tinicum-tim is Tinicum Tim.","which name has the slug stonewall-jackson":"The name whose slug is stonewall-jackson is Stonewall Jackson.","name the name whose slug is mt-parker":"The name whose slug is mt-parker is MT Parker.","which name has the slug octoraro-orphie":"The name whose slug is octoraro-orphie is Octoraro Orphie.","which name has the slug van-island-violet":"The name whose slug is van-island-violet is Van Island Violet.","grover-and-sue is the slug of which name":"The name whose slug is grover-and-sue is Grover and Sue.","name the name whose slug is ms-g":"The name whose slug is ms-g is Ms. G.","sir-walter-wally is the slug of which name":"The name whose slug is sir-walter-wally is Sir Walter Wally.","which name has the slug wildwood-willie":"The name whose slug is wildwood-willie is Wildwood Willie.","oil-springs-ollie is the slug of which name":"The name whose slug is oil-springs-ollie is Oil Springs Ollie.","name the name whose slug is gordy-the-groundhog":"The name whose slug is gordy-the-groundhog is Gordy the Groundhog.","which name has the slug scramble-the-duck":"The name whose slug is scramble-the-duck is Scramble the Duck.","which name has the slug lander-lil":"The name whose slug is lander-lil is Lander Lil.","name the name whose slug is chuckles-the-groundhog":"The name whose slug is chuckles-the-groundhog is Chuckles the Groundhog.","which name has the slug woodstock-willie":"The name whose slug is woodstock-willie is Woodstock Willie.","which name has the slug yonah-the-groundhog":"The name whose slug is yonah-the-groundhog is Yonah the Groundhog.","queen-city-charlie is the slug of which name":"The name whose slug is queen-city-charlie is Queen City Charlie.","name the name whose slug is potomac-phil":"The name whose slug is potomac-phil is Potomac Phil.","name the name whose slug is uni-the-groundhog":"The name whose slug is uni-the-groundhog is Uni the Groundhog."}}},
{"id":"n-3e73b941","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-4881058e","guard":[["hasAny",["appears in","contains","element","has","includes","item number","name","nth","position"]],["not",["has","me"]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.lastWord"]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-36d26069","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-92370e4f","guard":[["hasAny",["element","item number","name","nth","position"]],["not",["has","me"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-1fd06de6","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-26b752a3","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-2eb8ccbf","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["not",["has","me"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-3d3ed855","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-5165bd76","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-a709c050","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]],["not",["has","me"]]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-d50a9a3d","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]],["not",["has","me"]]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-ef4ebd3c","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]],["not",["has","me"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-7697e17e","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]]],"mem":null},
{"id":"n-8f7f1bf1","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","invert case","item number","name","nth","position","swap case","title case","toggle case"]],["not",["has","me"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]]],"mem":null},
{"id":"n-224a9713","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chillycharlie","chucklesthegroundhog","chuckwood","cluxatawneyhenrietta","delete","doverdoug","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","hopethegroundhog","item number","ladyedwinaofessex","landerlil","lucythelobster","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","octoraroorphie","oilspringsollie","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","potomacphil","queencitycharlie","remove","sandmountainsam","schnogadahlsammi","scrambletheduck","shubenacadiesam","sirwalterwally","smithlakejake","snowytheprairiedog","statenislandchuck","stonewalljackson","strip out","stumptownfil","tinicumtim","tworiverstunnel","unithegroundhog","vanislandviolet","wiartonwillie","wildwoodwillie","without","woodstockwillie","yonahthegroundhog"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"chuck"}]],"mem":null},
{"id":"n-5c75eecf","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","malvernemel","mountgretnagrady","mountjoyminnie","mtparker","normalise","normalize","nth","oilspringsollie","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","simplify the text","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie"]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":1}]],"mem":null},
{"id":"n-dad30200","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie","woodythewoodchuck"]]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"chuck"}]],"mem":null},
{"id":"n-e690adc7","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","msg","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":1}]],"mem":null},
{"id":"n-729dd505","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","msg","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-a792764d","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","msg","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-ca0b8661","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","mtparker","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-d8a71164","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","mtparker","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-dfa2795a","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","heavenswildlifeharvey","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","msg","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-ec3bef6c","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","malvernemel","mountgretnagrady","mountjoyminnie","mtparker","normalise","normalize","nth","oilspringsollie","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","simplify the text","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-03829f53","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","msg","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-51773f00","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","mtparker","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-54e05c08","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","mtparker","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-ca36488d","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","msg","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-14513ba7","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","malvernemel","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","oilspringsollie","pattypagoda","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","separate by","shubenacadiesam","sirwalterwally","smithlakejake","split","split by","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-1a6d72ca","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","malvernemel","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","oilspringsollie","pattypagoda","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","separate by","shubenacadiesam","sirwalterwally","smithlakejake","split","split by","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-5d5edae9","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-7f4c8b6c","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","ladyedwinaofessex","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","pisgahpenny","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7ffb7a26","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","malvernemel","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","oilspringsollie","pattypagoda","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","separate by","shubenacadiesam","sirwalterwally","smithlakejake","split","split by","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-81d4242c","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-e9576fa6","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","delete","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","malvernemel","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","oilspringsollie","pattypagoda","poorrichard","position","potomacphil","queencitycharlie","remove","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","strip out","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-f0dbb417","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","ladyedwinaofessex","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","pisgahpenny","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-fa59673a","guard":[["not",["hasAny",["balzac","beardsley","beauregard","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","ladyedwinaofessex","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","pisgahpenny","poor","rivers","sand","schnogadahl","scramble","slew","stumptown","sue","violet","willie"]]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-e7a6f293","guard":[["not",["hasAny",["balzac","beardsley","bert","bill","casimir","cave","charlie","chuck","cluxatawney","dover","dunkirk","edwina","freddie","freddy","groundhog","harleysville","holtsville","jake","lander","lawrenceville","manitoba","marmot","marmotte","middlemiss","mount","ms","okanagan","ollie","pagoda","parker","paula","phil","poor","rivers","sand","schnogadahl","scramble","slew","sue","violet","willie"]]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-eb78cd0a","guard":[["hasAny",["element","item number","join","joined with","name","nth","position","separated by"]],["not",["has","me"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-3d9d76bd","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-41943c4c","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-5dbb821b","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","mtparker","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-fb35171a","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","tinicumtim","tworiverstunnel","unithegroundhog","wiartonwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-8e4c5853","guard":[["hasAny",["balzacbilly","beardsleybart","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","doverdoug","element","fenwickflossie","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","has","item number","ladyedwinaofessex","malvernemel","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","oilspringsollie","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","separate by","shubenacadiesam","sirwalterwally","smithlakejake","split","split by","statenislandchuck","tinicumtim","tworiverstunnel","wiartonwillie"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-1c6b2362","guard":[["hasAny",["balzacbilly","beardsleybart","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","delete","doverdoug","element","fenwickflossie","frenchcreekfreddie","generalbeauregardlee","harleysvillehank","has","item number","ladyedwinaofessex","malvernemel","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","oilspringsollie","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","remove","sandmountainsam","shubenacadiesam","sirwalterwally","smithlakejake","statenislandchuck","strip out","tinicumtim","tworiverstunnel","wiartonwillie","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-240faecb","guard":[["hasAny",["balzacbilly","beardsleybart","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","doverdoug","element","fenwickflossie","frenchcreekfreddie","generalbeauregardlee","harleysvillehank","has","item number","ladyedwinaofessex","malvernemel","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","oilspringsollie","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","separate by","shubenacadiesam","sirwalterwally","smithlakejake","split","split by","statenislandchuck","tinicumtim","tworiverstunnel","wiartonwillie"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4e59d71f","guard":[["hasAny",["balzacbilly","beardsleybart","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","doverdoug","element","fenwickflossie","frenchcreekfreddie","generalbeauregardlee","harleysvillehank","has","item number","ladyedwinaofessex","malvernemel","mountgretnagrady","mountjoyminnie","msg","mtparker","nth","oilspringsollie","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","separate by","shubenacadiesam","sirwalterwally","smithlakejake","split","split by","statenislandchuck","tinicumtim","tworiverstunnel","wiartonwillie"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-55689750","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","buckeyechuck","buffalobert","chesapeakechuck","chillycharlie","chucklesthegroundhog","cluxatawneyhenrietta","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","lucythelobster","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","nth","octoraroorphie","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","potomacphil","queencitycharlie","sandmountainsam","schnogadahlsammi","scrambletheduck","shubenacadiesam","sirwalterwally","smithlakejake","snowytheprairiedog","statenislandchuck","stonewalljackson","stumptownfil","tworiverstunnel","unithegroundhog","vanislandviolet","wiartonwillie","wildwoodwillie","woodstockwillie","woodythewoodchuck","yonahthegroundhog","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-6530468d","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","buckeyechuck","buffalobert","chesapeakechuck","chillycharlie","chucklesthegroundhog","cluxatawneyhenrietta","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","lucythelobster","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","nth","octoraroorphie","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","potomacphil","queencitycharlie","sandmountainsam","schnogadahlsammi","scrambletheduck","shubenacadiesam","sirwalterwally","smithlakejake","snowytheprairiedog","statenislandchuck","stonewalljackson","stumptownfil","tworiverstunnel","unithegroundhog","vanislandviolet","wiartonwillie","wildwoodwillie","woodstockwillie","woodythewoodchuck","yonahthegroundhog","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-78ea9427","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","buckeyechuck","buffalobert","chesapeakechuck","chillycharlie","chucklesthegroundhog","cluxatawneyhenrietta","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","lucythelobster","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","nth","octoraroorphie","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","potomacphil","queencitycharlie","sandmountainsam","schnogadahlsammi","scrambletheduck","shubenacadiesam","sirwalterwally","smithlakejake","snowytheprairiedog","statenislandchuck","stonewalljackson","stumptownfil","tworiverstunnel","unithegroundhog","vanislandviolet","wiartonwillie","wildwoodwillie","woodstockwillie","woodythewoodchuck","yonahthegroundhog","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-888162cf","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","buckeyechuck","buffalobert","chesapeakechuck","chillycharlie","chucklesthegroundhog","cluxatawneyhenrietta","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","harleysvillehank","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","lucythelobster","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","nth","octoraroorphie","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","potomacphil","queencitycharlie","sandmountainsam","schnogadahlsammi","scrambletheduck","shubenacadiesam","sirwalterwally","smithlakejake","snowytheprairiedog","statenislandchuck","stonewalljackson","stumptownfil","tworiverstunnel","unithegroundhog","vanislandviolet","wiartonwillie","wildwoodwillie","woodstockwillie","woodythewoodchuck","yonahthegroundhog","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-b331af9e","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","buckeyechuck","buffalobert","chesapeakechuck","chillycharlie","chucklesthegroundhog","cluxatawneyhenrietta","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","gordythegroundhog","groverandsue","harleysvillehank","hopethegroundhog","item number","ladyedwinaofessex","leading zeros","lucythelobster","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","nth","octoraroorphie","oilspringsollie","pad","pad with","padded to","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","potomacphil","queencitycharlie","sandmountainsam","schnogadahlsammi","scrambletheduck","shubenacadiesam","sirwalterwally","smithlakejake","snowytheprairiedog","statenislandchuck","stonewalljackson","tworiverstunnel","unithegroundhog","vanislandviolet","wiartonwillie","wildwoodwillie","woodstockwillie","woodythewoodchuck","yonahthegroundhog","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-ab033e01","guard":[["hasAny",["balzacbilly","beardsleybart","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chillycharlie","chuckwood","cluxatawneyhenrietta","doverdoug","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","harleysvillehank","item number","landerlil","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","mtparker","normalise","normalize","nth","octoraroorphie","oilspringsollie","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","schnogadahlsammi","shubenacadiesam","simplify the text","sirwalterwally","smithlakejake","statenislandchuck","stonewalljackson","stumptownfil","tinicumtim","tworiverstunnel","vanislandviolet","wiartonwillie","wildwoodwillie","woodstockwillie"]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":2}]],"mem":null},
{"id":"n-727ee3ca","guard":[["hasAny",["balzacbilly","beardsleybart","boisebill","bowmanbill","buckeyechuck","buffalobert","chesapeakechuck","chillycharlie","chuckwood","cluxatawneyhenrietta","doverdoug","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","harleysvillehank","item number","landerlil","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","mtparker","normalise","normalize","nth","octoraroorphie","oilspringsollie","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","position","potomacphil","queencitycharlie","sandmountainsam","schnogadahlsammi","shubenacadiesam","simplify the text","sirwalterwally","smithlakejake","statenislandchuck","stonewalljackson","stumptownfil","tinicumtim","tworiverstunnel","vanislandviolet","wiartonwillie","wildwoodwillie","woodstockwillie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}],{"lit":2}]],"mem":null},
{"id":"n-7fcb9a58","guard":[["hasAny",["beardsleybart","bennythebass","bowmanbill","buckeyechuck","chesapeakechuck","chillycharlie","chucklesthegroundhog","chuckwood","cluxatawneyhenrietta","delete","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","item number","ladyedwinaofessex","lucythelobster","middlemissmike","msg","mtparker","nth","octoraroorphie","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","potomacphil","queencitycharlie","remove","sandmountainsam","schnogadahlsammi","scrambletheduck","sirwalterwally","snowytheprairiedog","statenislandchuck","stonewalljackson","strip out","stumptownfil","tinicumtim","tworiverstunnel","unithegroundhog","vanislandviolet","wildwoodwillie","without","woodythewoodchuck","yonahthegroundhog"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"city"}]]],"mem":null},
{"id":"n-d33edf75","guard":[["hasAny",["beardsleybart","bennythebass","bowmanbill","buckeyechuck","chesapeakechuck","chillycharlie","chucklesthegroundhog","chuckwood","cluxatawneyhenrietta","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","gordythegroundhog","groverandsue","item number","ladyedwinaofessex","lucythelobster","middlemissmike","msg","mtparker","nth","octoraroorphie","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","potomacphil","queencitycharlie","sandmountainsam","schnogadahlsammi","scrambletheduck","separate by","sirwalterwally","snowytheprairiedog","split","split by","statenislandchuck","stonewalljackson","stumptownfil","tinicumtim","tworiverstunnel","unithegroundhog","vanislandviolet","wildwoodwillie","woodythewoodchuck","yonahthegroundhog"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"city"}]]],"mem":null},
{"id":"n-70b8f3e5","guard":[["hasAny",["appears in","contains","element","has","includes","item number","name","nth","position"]],["not",["has","me"]]],"pyramid":["render.yesNo",["compare.contains",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}],["sense.lastWord"]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-8875fa78","guard":[["hasAny",["element","item number","name","nth","position"]],["has","slug"],["words<=",7]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]],"mem":null},
{"id":"n-323f63d5","guard":[["hasAny",["element","item number","lower case","lowercase","name","nth","position","small letters"]],["has","slug"],["words<=",7]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-3d47722b","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","name","nth","position","title case"]],["has","slug"],["words<=",7]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-a14ede31","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","name","nth","position","upper case","uppercase"]],["has","slug"],["words<=",7]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-b50c7015","guard":[["hasAny",["element","invert case","item number","name","nth","position","swap case","toggle case"]],["has","slug"],["words<=",7]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-8fc55cd4","guard":[["hasAny",["element","item number","join","joined with","name","nth","position","separated by"]],["not",["has","me"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-0897db3e","guard":[["hasAny",["balzacbilly","beardsleybart","bennythebass","buffalobert","chucklesthegroundhog","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","gordythegroundhog","groverandsue","harleysvillehank","has","hopethegroundhog","item number","ladyedwinaofessex","malvernemel","mountgretnagrady","mountjoyminnie","mtparker","normalise","normalize","nth","oilspringsollie","pattypagoda","pisgahpenny","poorrichard","position","simplify the text","sirwalterwally","smithlakejake","tinicumtim","tworiverstunnel","unithegroundhog"]],["has","slug"]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-155477fe","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","dashes","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","hyphens","item number","kebab case","kebabcase","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-023789c3","guard":[["hasAny",["appears in","contains","element","has","includes","item number","name","nth","position"]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["sense.after",{"lit":"is"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-3a2a7dbe","guard":[["hasAny",["appears in","contains","element","has","includes","item number","name","nth","position"]],["has","which"]],"pyramid":["render.yesNo",["compare.contains",["sense.before",{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-2216fb6f","guard":[["hasAny",["join","joined with","name","separated by"]],["has","which"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["sense.before",{"lit":"name"}]]],"mem":null},
{"id":"n-84588295","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose slug is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-9eaba1dd","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-0c031b58","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-2a0d6d6b","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-bd4b2ca3","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-02c07be8","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","capitalise","capitalize","capitalize each word","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","title case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-24921954","guard":[["hasAny",["all caps","balzacbilly","boisebill","bowmanbill","buckeyechuck","capital letters","capitals","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","upper case","uppercase","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-516cd73e","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","invert case","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","swap case","toggle case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-69649844","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","first n","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","take","top","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-8f78c5f7","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","lower case","lowercase","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","small letters","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-d41e6db7","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","first n","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","take","top","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-fd0d2a79","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-cf214742","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","capitalise","capitalize","capitalize each word","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","title case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-d3aaf1b1","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","heavenswildlifeharvey","hopethegroundhog","invert case","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","swap case","toggle case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-ef16eb8d","guard":[["has","name"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"name"}]]],"mem":{"table":{"has the slug lucy-the-lobster":"The name whose slug is lucy-the-lobster is Lucy the Lobster.","has the slug woody-the-woodchuck":"The name whose slug is woody-the-woodchuck is Woody the Woodchuck.","has the slug snowy-the-prairie-dog":"The name whose slug is snowy-the-prairie-dog is Snowy the Prairie Dog.","the name whose slug is malverne-mel":"The name whose slug is malverne-mel is Malverne Mel.","the name whose slug is shubenacadie-sam":"The name whose slug is shubenacadie-sam is Shubenacadie Sam.","the name whose slug is mount-joy-minnie":"The name whose slug is mount-joy-minnie is Mount Joy Minnie.","the name whose slug is balzac-billy":"The name whose slug is balzac-billy is Balzac Billy.","has the slug chilly-charlie":"The name whose slug is chilly-charlie is Chilly Charlie.","the name whose slug is patty-pagoda":"The name whose slug is patty-pagoda is Patty Pagoda.","the name whose slug is buckeye-chuck":"The name whose slug is buckeye-chuck is Buckeye Chuck.","has the slug polk-county-paula":"The name whose slug is polk-county-paula is Polk County Paula.","the name whose slug is wiarton-willie":"The name whose slug is wiarton-willie is Wiarton Willie.","the name whose slug is boise-bill":"The name whose slug is boise-bill is Boise Bill.","the name whose slug is dover-doug":"The name whose slug is dover-doug is Dover Doug.","has the slug cluxatawney-henrietta":"The name whose slug is cluxatawney-henrietta is Cluxatawney Henrietta.","has the slug dunkirk-dave":"The name whose slug is dunkirk-dave is Dunkirk Dave.","the name whose slug is heavens-wildlife-harvey":"The name whose slug is heavens-wildlife-harvey is Heaven’s Wildlife Harvey.","has the slug poppy-the-groundhog":"The name whose slug is poppy-the-groundhog is Poppy the Groundhog.","the name whose slug is smith-lake-jake":"The name whose slug is smith-lake-jake is Smith Lake Jake.","has the slug middlemiss-mike":"The name whose slug is middlemiss-mike is Middlemiss Mike.","has the slug schnogadahl-sammi":"The name whose slug is schnogadahl-sammi is Schnogadahl Sammi.","has the slug chuck-wood":"The name whose slug is chuck-wood is Chuck Wood.","has the slug stumptown-fil":"The name whose slug is stumptown-fil is Stumptown Fil.","the name whose slug is fenwick-flossie":"The name whose slug is fenwick-flossie is Fenwick Flossie.","the name whose slug is hope-the-groundhog":"The name whose slug is hope-the-groundhog is Hope the Groundhog.","the name whose slug is bowman-bill":"The name whose slug is bowman-bill is Bowman Bill.","has the slug stonewall-jackson":"The name whose slug is stonewall-jackson is Stonewall Jackson.","the name whose slug is mt-parker":"The name whose slug is mt-parker is MT Parker.","has the slug octoraro-orphie":"The name whose slug is octoraro-orphie is Octoraro Orphie.","has the slug van-island-violet":"The name whose slug is van-island-violet is Van Island Violet.","the name whose slug is ms-g":"The name whose slug is ms-g is Ms. G.","has the slug wildwood-willie":"The name whose slug is wildwood-willie is Wildwood Willie.","the name whose slug is gordy-the-groundhog":"The name whose slug is gordy-the-groundhog is Gordy the Groundhog.","has the slug scramble-the-duck":"The name whose slug is scramble-the-duck is Scramble the Duck.","has the slug lander-lil":"The name whose slug is lander-lil is Lander Lil.","the name whose slug is chuckles-the-groundhog":"The name whose slug is chuckles-the-groundhog is Chuckles the Groundhog.","has the slug woodstock-willie":"The name whose slug is woodstock-willie is Woodstock Willie.","has the slug yonah-the-groundhog":"The name whose slug is yonah-the-groundhog is Yonah the Groundhog.","the name whose slug is potomac-phil":"The name whose slug is potomac-phil is Potomac Phil.","the name whose slug is uni-the-groundhog":"The name whose slug is uni-the-groundhog is Uni the Groundhog."}}},
{"id":"n-175d8b76","guard":[["hasAny",["join","joined with","name","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-cab93162","guard":[["hasAny",["join","joined with","name","separated by"]],["not",["has","me"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["sense.after",{"lit":"name"}]]],"mem":null},
{"id":"n-082db466","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["render.and",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}]]],"mem":null},
{"id":"n-36179320","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}]]],"mem":null},
{"id":"n-d693dbda","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-e9ffe935","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","hopethegroundhog","item number","lower case","lowercase","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","small letters","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-aaeffa69","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"slug"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-1c65bfad","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","separate by","shubenacadiesam","smithlakejake","split","split by","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-969cf54c","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","has","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","separate by","shubenacadiesam","smithlakejake","split","split by","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-0cb0470e","guard":[["hasAny",["beardsleybart","bennythebass","chucklesthegroundhog","cluxatawneyhenrietta","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","gordythegroundhog","groverandsue","item number","ladyedwinaofessex","middlemissmike","msg","mtparker","nth","octoraroorphie","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","schnogadahlsammi","scrambletheduck","separate by","sirwalterwally","snowytheprairiedog","split","split by","stonewalljackson","tinicumtim","tworiverstunnel","unithegroundhog","vanislandviolet","woodythewoodchuck","yonahthegroundhog"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"city"}]]],"mem":null},
{"id":"n-bec2ae29","guard":[["hasAny",["beardsleybart","bennythebass","chucklesthegroundhog","cluxatawneyhenrietta","delete","doverdoug","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","gordythegroundhog","groverandsue","item number","ladyedwinaofessex","middlemissmike","msg","mtparker","nth","octoraroorphie","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","poppythegroundhog","position","remove","schnogadahlsammi","scrambletheduck","sirwalterwally","snowytheprairiedog","stonewalljackson","strip out","tinicumtim","tworiverstunnel","unithegroundhog","vanislandviolet","without","woodythewoodchuck","yonahthegroundhog"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"city"}]]],"mem":null},
{"id":"n-f7368aff","guard":[["hasAny",["balzacbilly","beardsleybart","buffalobert","cluxatawneyhenrietta","doverdoug","dunkirkdave","element","fenwickflossie","fredlamarmotte","frenchcreekfreddie","harleysvillehank","item number","landerlil","malvernemel","middlemissmike","mountgretnagrady","mountjoyminnie","mtparker","normalise","normalize","nth","octoraroorphie","oilspringsollie","pattypagoda","pisgahpenny","polkcountypaula","poorrichard","position","schnogadahlsammi","simplify the text","sirwalterwally","smithlakejake","stonewalljackson","tinicumtim","tworiverstunnel","vanislandviolet"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}],{"lit":2}]],"mem":null},
{"id":"n-e73b31a7","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","change to","chillycharlie","cluxatawneyhenrietta","doverdoug","dunkirkdave","element","fenwickflossie","item number","landerlil","middlemissmike","mountjoyminnie","mtparker","nth","octoraroorphie","polkcountypaula","position","potomacphil","replace","schnogadahlsammi","shubenacadiesam","smithlakejake","substitute","swap","vanislandviolet","wiartonwillie","wildwoodwillie","woodstockwillie"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.lastWord"]]],"mem":null},
{"id":"n-0a30618e","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","dashes","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","hyphens","item number","kebab case","kebabcase","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-ff8fa09e","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","dashes","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","hyphens","item number","kebab case","kebabcase","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-b96b89ee","guard":[["hasAny",["join","joined with","name","separated by"]],["has","is"]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-32672236","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["render.and",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}]]],"mem":null},
{"id":"n-a78e103a","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}]]],"mem":null},
{"id":"n-ca60451c","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-6dc44c2a","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose slug is ",{"slot":1}," is ",{"slot":2},"."]},["sense.lastWord"],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-913c580b","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","lower case","lowercase","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","small letters","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-2b57ba56","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose slug is ",{"slot":1}," is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-30ec964e","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The name whose ",{"slot":0}," is ",{"slot":1}," is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-edda4c51","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","shortest","shortest one","shortest word","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["aggregate.shortest",["sense.content"]],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-093d8f2c","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-ebaa70a4","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.words"],{"lit":4}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-ef80041a","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-03b01658","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.words"],{"lit":5}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-242de9f3","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","lower case","lowercase","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","small letters","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-2cdc4804","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","invert case","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","swap case","tinicumtim","toggle case","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-50a484f0","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-59e5603b","guard":[["hasAny",["all caps","beardsleybart","bennythebass","buffalobert","capital letters","capitals","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel","upper case","uppercase"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-8a5aed01","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","class name","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pascal case","pascalcase","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-9146b64f","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-d00e0505","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","invert case","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","swap case","tinicumtim","toggle case","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-ef32716e","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-f1a8c202","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","capitalise","capitalize","capitalize each word","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","title case","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-feb54831","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-0f4a6bfa","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-1db5a86a","guard":[["hasAny",["class name","element","has","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-41f4cdf7","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","invert case","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","swap case","toggle case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-45c8ccdf","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","invert case","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","swap case","toggle case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-5984b84f","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","invert case","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","swap case","tinicumtim","toggle case","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-65abb426","guard":[["hasAny",["element","has","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.swapCase",["sense.wordAt",{"lit":2}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-733f149a","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-74312689","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-7adec542","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","lower case","lowercase","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","small letters","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-c71c452e","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","each word","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","split into words","statenislandchuck","tinicumtim","tworiverstunnel","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-ca58d7f1","guard":[["hasAny",["all caps","balzacbilly","boisebill","bowmanbill","buckeyechuck","capital letters","capitals","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","upper case","uppercase","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-cee997e7","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","capitalise","capitalize","capitalize each word","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","title case","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-daa73b21","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","capitalise","capitalize","capitalize each word","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","title case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-e3cf1fc7","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","each word","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","split into words","statenislandchuck","tinicumtim","tworiverstunnel","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-f668f02c","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","class name","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pascal case","pascalcase","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","upper camel case","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.pascal",["sense.wordAt",{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-f6ef36aa","guard":[["hasAny",["element","has","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.words"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-055d7255","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-5ebfce16","guard":[["hasAny",["each word","element","has","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":2}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-accc333d","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","each word","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","split into words","unithegroundhog","wiartonwillie","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":1}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-b7f3df1c","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","each word","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","split into words","unithegroundhog","wiartonwillie","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":1}]]],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-d379389a","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","capitalise","capitalize","capitalize each word","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","title case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-d64dd0a8","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","invert case","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","swap case","toggle case","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-52175a0c","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","sirwalterwally","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"slug"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-01476c22","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","delete","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","remove","sandmountainsam","sirwalterwally","statenislandchuck","strip out","tinicumtim","tworiverstunnel","without"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-627dfda3","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","join","joined with","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","separated by","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-536dda04","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","separate by","sirwalterwally","split","split by","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.and",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-55238a7c","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","separate by","sirwalterwally","split","split by","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-25b3d96f","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","separate by","sirwalterwally","split","split by","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-6925d60f","guard":[["hasAny",["beardsleybart","bennythebass","buffalobert","chesapeakechuck","element","fredlamarmotte","frenchcreekfreddie","generalbeauregardlee","groverandsue","harleysvillehank","item number","ladyedwinaofessex","mountgretnagrady","nth","oilspringsollie","pisgahpenny","poorrichard","position","queencitycharlie","sandmountainsam","separate by","sirwalterwally","split","split by","statenislandchuck","tinicumtim","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-0b97f28a","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","separate by","shubenacadiesam","smithlakejake","split","split by","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-7b17c46a","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","separate by","shubenacadiesam","smithlakejake","split","split by","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-39005782","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}]]],"mem":null},
{"id":"n-99cef928","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["render.and",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}]]],"mem":null},
{"id":"n-99d7956c","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]],"mem":null},
{"id":"n-ead13059","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","hopethegroundhog","item number","lower case","lowercase","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","small letters","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-2d2cd204","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","shubenacadiesam","smithlakejake","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"slug"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-88c25067","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","separate by","shubenacadiesam","smithlakejake","split","split by","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-b6ce1d9b","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buckeyechuck","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","potomacphil","separate by","shubenacadiesam","smithlakejake","split","split by","unithegroundhog","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-c62051c7","guard":[["hasAny",["appears in","contains","element","has","includes","item number","name","nth","position"]],["not",["has","me"]]],"pyramid":["render.yesNo",["compare.contains",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],["sense.wordAt",{"lit":1}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-8e9f2f58","guard":[["hasAny",["balzacbilly","boisebill","bowmanbill","buffalobert","characters from","chuckwood","doverdoug","dunkirkdave","element","item number","landerlil","letters from to","malvernemel","msg","mtparker","nth","pattypagoda","pisgahpenny","poorrichard","position","potomacphil","slice of the text","substring","tinicumtim"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-1f41d638","guard":[["hasAny",["element","item number","join","joined with","name","nth","position","separated by"]],["not",["has","me"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-ff620e4a","guard":[["hasAny",["balzacbilly","buckeyechuck","chesapeakechuck","chuckwood","cluxatawneyhenrietta","element","fenwickflossie","fredlamarmotte","item number","landerlil","malvernemel","middlemissmike","mtparker","normalise","normalize","nth","octoraroorphie","poorrichard","position","simplify the text","wiartonwillie","wildwoodwillie"]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":3}]],"mem":null},
{"id":"n-e99f83fc","guard":[["hasAny",["balzacbilly","buckeyechuck","chesapeakechuck","chuckwood","cluxatawneyhenrietta","element","fenwickflossie","fredlamarmotte","item number","landerlil","malvernemel","middlemissmike","mtparker","normalise","normalize","nth","octoraroorphie","poorrichard","position","simplify the text","wiartonwillie","wildwoodwillie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}],{"lit":3}]],"mem":null},
{"id":"n-489cb8aa","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","change to","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","position","replace","shubenacadiesam","smithlakejake","substitute","swap","wiartonwillie","woodstockwillie"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-5f3202d1","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","change to","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","position","replace","shubenacadiesam","smithlakejake","substitute","swap","wiartonwillie","woodstockwillie"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}]]],"mem":null},
{"id":"n-95e16516","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","change to","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","position","replace","shubenacadiesam","smithlakejake","substitute","swap","wiartonwillie","woodstockwillie"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-dc4e1866","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","change to","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","position","replace","shubenacadiesam","smithlakejake","substitute","swap","wiartonwillie","woodstockwillie"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-6e45d216","guard":[["hasAny",["balzacbilly","buffalobert","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","leading zeros","malvernemel","mountgretnagrady","mountjoyminnie","nth","oilspringsollie","pad","pad with","padded to","position","shubenacadiesam","smithlakejake","stonewalljackson","wiartonwillie","woodstockwillie","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-7c63af76","guard":[["hasAny",["element","item number","join","joined with","name","nth","position","separated by"]],["not",["has","me"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-1ed53d67","guard":[["hasAny",["balzacbilly","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","smithlakejake","unithegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]],"mem":null},
{"id":"n-91c2a544","guard":[["hasAny",["balzacbilly","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","lower case","lowercase","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","small letters","smithlakejake","unithegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-c8c24b1e","guard":[["hasAny",["balzacbilly","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","invert case","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","smithlakejake","swap case","toggle case","unithegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-d020ec0f","guard":[["hasAny",["balzacbilly","capitalise","capitalize","capitalize each word","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","smithlakejake","title case","unithegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-893dbb42","guard":[["hasAny",["balzacbilly","chucklesthegroundhog","doverdoug","element","fenwickflossie","gordythegroundhog","heavenswildlifeharvey","hopethegroundhog","item number","malvernemel","mountjoyminnie","msg","mtparker","nth","pattypagoda","position","smithlakejake","unithegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is ",{"slot":3},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"slug"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-234834d9","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","smithlakejake","wiartonwillie"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]],"mem":null},
{"id":"n-3d3650ee","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","smithlakejake","wiartonwillie"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]],"mem":null},
{"id":"n-0367d9d6","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","lower case","lowercase","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","small letters","smithlakejake","wiartonwillie"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-0f1be618","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","dunkirkdave","element","harleysvillehank","hopethegroundhog","invert case","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","smithlakejake","swap case","toggle case","wiartonwillie"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-39e6118b","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","lower case","lowercase","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","small letters","smithlakejake","wiartonwillie"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-41628b36","guard":[["hasAny",["all caps","balzacbilly","boisebill","buffalobert","capital letters","capitals","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","smithlakejake","upper case","uppercase","wiartonwillie"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-4f08d1a7","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","capitalise","capitalize","capitalize each word","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","smithlakejake","title case","wiartonwillie"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-c9545d4b","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","dunkirkdave","element","harleysvillehank","hopethegroundhog","invert case","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","smithlakejake","swap case","toggle case","wiartonwillie"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-cddb89d3","guard":[["hasAny",["all caps","balzacbilly","boisebill","buffalobert","capital letters","capitals","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","smithlakejake","upper case","uppercase","wiartonwillie"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-dcd1234b","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","capitalise","capitalize","capitalize each word","dunkirkdave","element","harleysvillehank","hopethegroundhog","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","nth","position","shubenacadiesam","smithlakejake","title case","wiartonwillie"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-21376ae4","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","dunkirkdave","element","harleysvillehank","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","normalise","normalize","nth","position","shubenacadiesam","simplify the text","smithlakejake","wiartonwillie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}],{"lit":2}]],"mem":null},
{"id":"n-fe8c5211","guard":[["hasAny",["balzacbilly","boisebill","buffalobert","dunkirkdave","element","harleysvillehank","item number","landerlil","malvernemel","mountgretnagrady","mountjoyminnie","normalise","normalize","nth","position","shubenacadiesam","simplify the text","smithlakejake","wiartonwillie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}],{"lit":2}]],"mem":null},
{"id":"n-bc83369c","guard":[["hasAny",["balzacbilly","cluxatawneyhenrietta","element","fenwickflossie","fredlamarmotte","item number","landerlil","malvernemel","middlemissmike","mtparker","normalise","normalize","nth","octoraroorphie","poorrichard","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}],{"lit":3}]],"mem":null},
{"id":"n-15e307ae","guard":[["hasAny",["balzacbilly","buffalobert","dunkirkdave","element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","pisgahpenny","poorrichard","position","potomacphil","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-b30f320a","guard":[["hasAny",["boisebill","characters from","chuckwood","doverdoug","element","item number","landerlil","letters from to","msg","mtparker","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-dbfa401f","guard":[["hasAny",["balzacbilly","dunkirkdave","element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","pattypagoda","position","potomacphil","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-80bee431","guard":[["hasAny",["boisebill","doverdoug","element","groverandsue","item number","landerlil","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-ffaf3998","guard":[["hasAny",["boisebill","chuckwood","doverdoug","element","item number","landerlil","leading zeros","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-80c7a2ee","guard":[["hasAny",["balzacbilly","element","item number","landerlil","malvernemel","normalise","normalize","nth","position","simplify the text","wiartonwillie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}],{"lit":3}]],"mem":null},
{"id":"n-a4640624","guard":[["hasAny",["balzacbilly","element","item number","landerlil","malvernemel","normalise","normalize","nth","position","simplify the text","wiartonwillie"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}],{"lit":3}]],"mem":null},
{"id":"n-5ca86072","guard":[["hasAny",["element","groverandsue","item number","malvernemel","msg","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]],"mem":null},
{"id":"n-7050d3af","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","groverandsue","item number","malvernemel","msg","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-95d99054","guard":[["hasAny",["all caps","capital letters","capitals","element","groverandsue","item number","malvernemel","msg","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-c14b9b30","guard":[["hasAny",["element","groverandsue","item number","lower case","lowercase","malvernemel","msg","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-e0fe2e52","guard":[["hasAny",["groverandsue","join","joined with","malvernemel","msg","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-fc4134ee","guard":[["hasAny",["element","groverandsue","invert case","item number","malvernemel","msg","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-95f5a06f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","groverandsue","invert case","item number","malvernemel","msg","nth","position","swap case","title case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]]],"mem":null},
{"id":"n-14746a21","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":4},["sense.lastWord"]]],"mem":null},
{"id":"n-5f2cc0d4","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":4},["sense.text"]]],"mem":null},
{"id":"n-a361985f","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":5},["sense.lastWord"]]],"mem":null},
{"id":"n-e1523c0a","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":5},["sense.text"]]],"mem":null},
{"id":"n-07b4c6bc","guard":[["hasAny",["element","groverandsue","item number","malvernemel","msg","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}]],"mem":null},
{"id":"n-e22c8ef3","guard":[["hasAny",["element","groverandsue","item number","join","joined with","malvernemel","msg","nth","position","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-ec6b0e88","guard":[["hasAny",["element","groverandsue","item number","malvernemel","msg","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]],"mem":null},
{"id":"n-59f4a2d4","guard":[["hasAny",["element","groverandsue","invert case","item number","malvernemel","msg","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-5d39ff85","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","groverandsue","item number","malvernemel","msg","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-77561aca","guard":[["hasAny",["element","groverandsue","item number","lower case","lowercase","malvernemel","msg","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-87eb7541","guard":[["hasAny",["all caps","capital letters","capitals","element","groverandsue","item number","malvernemel","msg","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-910e9390","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","groverandsue","item number","malvernemel","msg","nth","position","title case"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-be18ac9a","guard":[["hasAny",["all caps","capital letters","capitals","element","groverandsue","item number","malvernemel","msg","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-d8918610","guard":[["hasAny",["element","groverandsue","item number","lower case","lowercase","malvernemel","msg","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-d9bcf454","guard":[["hasAny",["element","groverandsue","invert case","item number","malvernemel","msg","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-09a66e7d","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-197df08d","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-2eba3e91","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-8009e4f9","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-a1b69f6e","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-ab70b37c","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-6d4eb934","guard":[["hasAny",["element","groverandsue","item number","join","joined with","malvernemel","msg","nth","position","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-06f26ff6","guard":[["hasAny",["change to","element","groverandsue","item number","malvernemel","msg","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-f5077c4d","guard":[["hasAny",["join","joined with","malvernemel","msg","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],["sense.after",{"lit":"name"}]]],"mem":null},
{"id":"n-80270cc6","guard":[["hasAny",["element","groverandsue","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":1}]],"mem":null},
{"id":"n-0edbe42d","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":10},["sense.text"]]],"mem":null},
{"id":"n-2a5cd950","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordCount"],["sense.lastWord"]]],"mem":null},
{"id":"n-5718fc4b","guard":[["hasAny",["element","item number","malvernemel","msg","nth","position","separate by","split","split by"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-69b6ecbd","guard":[["hasAny",["characters from","element","item number","letters from to","malvernemel","msg","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":1},{"lit":12}]],"mem":null},
{"id":"n-73e07f0d","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":12},["sense.lastWord"]]],"mem":null},
{"id":"n-76e299c3","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":12},["sense.text"]]],"mem":null},
{"id":"n-802eeff9","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":10},["sense.lastWord"]]],"mem":null},
{"id":"n-a201cbd4","guard":[["hasAny",["delete","element","item number","malvernemel","msg","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b3103549","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordCount"],["sense.text"]]],"mem":null},
{"id":"n-bd581cee","guard":[["hasAny",["element","item number","malvernemel","msg","nth","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0949ab9a","guard":[["hasAny",["element","groverandsue","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}],{"lit":1}]],"mem":null},
{"id":"n-30be95d4","guard":[["hasAny",["element","groverandsue","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}],{"lit":1}]],"mem":null},
{"id":"n-246f6760","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-805ec6c6","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-ab832455","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-ac1ab967","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-bd79d13a","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-e93bb7bb","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-f6f869ce","guard":[["hasAny",["element","groverandsue","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}]]],"mem":null},
{"id":"n-08d92229","guard":[["hasAny",["element","groverandsue","item number","msg","nth","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"city"}]]],"mem":null},
{"id":"n-2a8e5c1a","guard":[["hasAny",["delete","element","groverandsue","item number","msg","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"city"}]]],"mem":null},
{"id":"n-a91b21ce","guard":[["hasAny",["delete","element","groverandsue","item number","msg","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"city"}]]],"mem":null},
{"id":"n-bff84d8f","guard":[["hasAny",["delete","element","groverandsue","item number","msg","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"city"}]]],"mem":null},
{"id":"n-c5b9b310","guard":[["hasAny",["element","groverandsue","item number","msg","nth","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"city"}]]],"mem":null},
{"id":"n-f57d4a74","guard":[["hasAny",["element","groverandsue","item number","msg","nth","position","separate by","split","split by"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"city"}]]],"mem":null},
{"id":"n-029f260c","guard":[["hasAny",["change to","element","hopethegroundhog","item number","nth","position","replace","stonewalljackson","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-035669ea","guard":[["hasAny",["change to","element","hopethegroundhog","item number","nth","position","replace","stonewalljackson","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-4ed568d9","guard":[["hasAny",["change to","element","hopethegroundhog","item number","nth","position","replace","stonewalljackson","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-6cc6190f","guard":[["hasAny",["change to","element","hopethegroundhog","item number","nth","position","replace","stonewalljackson","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-682374d7","guard":[["hasAny",["join","joined with","msg","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["sense.unit"]]],"mem":null},
{"id":"n-2c0a87b3","guard":[["hasAny",["element","item number","msg","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-48a80f5e","guard":[["hasAny",["groverandsue","join","joined with","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],["sense.after",{"lit":"of"}]]],"mem":null},
{"id":"n-80228e58","guard":[["hasAny",["element","item number","msg","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-bf5db93d","guard":[["hasAny",["groverandsue","join","joined with","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],["sense.before",{"lit":"name"}]]],"mem":null},
{"id":"n-0a87913f","guard":[["hasAny",["element","invert case","item number","msg","no vowels","nth","position","remove vowels","swap case","toggle case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]]],"mem":null},
{"id":"n-0d529362","guard":[["hasAny",["element","invert case","item number","msg","no vowels","nth","position","remove vowels","swap case","toggle case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]]],"mem":null},
{"id":"n-144fe2d7","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","msg","no vowels","nth","position","remove vowels","title case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.title",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]]],"mem":null},
{"id":"n-32468dc8","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","msg","no vowels","nth","position","remove vowels","upper case","uppercase","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]]],"mem":null},
{"id":"n-3357ba76","guard":[["hasAny",["element","item number","lower case","lowercase","msg","no vowels","nth","position","remove vowels","small letters","without vowels"]]],"pyramid":["render.str",["transform.lower",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]]],"mem":null},
{"id":"n-4ebfc2a0","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","msg","no vowels","nth","position","remove vowels","title case","without vowels"]]],"pyramid":["render.str",["transform.title",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]]],"mem":null},
{"id":"n-59c1ed5c","guard":[["hasAny",["element","item number","lower case","lowercase","msg","no vowels","nth","position","remove vowels","small letters","without vowels"]]],"pyramid":["render.str",["transform.lower",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]]],"mem":null},
{"id":"n-b70180be","guard":[["hasAny",["element","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":2}]],"mem":null},
{"id":"n-d6d483e0","guard":[["hasAny",["element","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":3}]],"mem":null},
{"id":"n-e73cbb9b","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","msg","no vowels","nth","position","remove vowels","upper case","uppercase","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.upper",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]]],"mem":null},
{"id":"n-fb668176","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","item number","msg","no vowels","nth","position","remove vowels","title case","without vowels"]]],"pyramid":["render.str",["transform.title",["transform.noVowels",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]]],"mem":null},
{"id":"n-0d6579f0","guard":[["hasAny",["characters from","element","item number","letters from to","msg","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-26474847","guard":[["hasAny",["characters from","element","item number","letters from to","msg","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-53a13596","guard":[["hasAny",["characters from","element","item number","letters from to","msg","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":1},{"lit":5}]],"mem":null},
{"id":"n-59f47210","guard":[["hasAny",["element","item number","leading zeros","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-5fa62d6f","guard":[["hasAny",["element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-80c47563","guard":[["hasAny",["characters from","element","item number","letters from to","msg","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":1},["sense.wordCount"]]],"mem":null},
{"id":"n-ca33feef","guard":[["hasAny",["characters from","element","item number","letters from to","msg","nth","position","slice of the text","substring"]]],"pyramid":["render.str",["transform.substr",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":1},{"lit":10}]],"mem":null},
{"id":"n-f3f977f0","guard":[["hasAny",["element","item number","leading zeros","msg","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["sense.lastWord"],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-0314cc89","guard":[["hasAny",["chesapeakechuck","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Chesapeake Chuck."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-05c82b13","guard":[["hasAny",["element","item number","ladyedwinaofessex","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Lady Edwina of Essex."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-20722ba6","guard":[["hasAny",["element","item number","join","joined with","malvernemel","nth","position","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-2f1e4119","guard":[["hasAny",["element","item number","nth","position","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Two Rivers Tunnel."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-35e1561d","guard":[["hasAny",["element","harleysvillehank","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Harleysville Hank."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-37c53278","guard":[["hasAny",["element","item number","nth","position","statenislandchuck"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Staten Island Chuck."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-3deb900b","guard":[["hasAny",["element","groverandsue","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Grover and Sue."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-3dff3f79","guard":[["hasAny",["element","item number","mountgretnagrady","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Mount Gretna Grady."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-530a4cfd","guard":[["hasAny",["element","item number","malvernemel","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]],"mem":null},
{"id":"n-586c3a5e","guard":[["hasAny",["element","item number","nth","oilspringsollie","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Oil Springs Ollie."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-5ebe143c","guard":[["hasAny",["element","item number","nth","position","queencitycharlie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Queen City Charlie."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-628eeeb5","guard":[["hasAny",["element","item number","nth","position","sirwalterwally"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Sir Walter Wally."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-64dcc7dd","guard":[["hasAny",["element","has","item number","join","joined with","nth","position","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":2}]]],"mem":null},
{"id":"n-7161d583","guard":[["hasAny",["element","item number","nth","position","sandmountainsam"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Sand Mountain Sam."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-82d2248f","guard":[["hasAny",["element","item number","nth","position","tinicumtim"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Tinicum Tim."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-85b11647","guard":[["hasAny",["buffalobert","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Buffalo Bert."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-87ea4f3a","guard":[["hasAny",["element","generalbeauregardlee","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is General Beauregard Lee."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-8e0f84ef","guard":[["hasAny",["element","fredlamarmotte","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Fred la Marmotte."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-a3ba57a9","guard":[["hasAny",["beardsleybart","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Beardsley Bart."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-ba3ed728","guard":[["hasAny",["bennythebass","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Benny the Bass."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-c337de98","guard":[["hasAny",["element","item number","nth","pisgahpenny","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Pisgah Penny."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-ce95d405","guard":[["hasAny",["element","item number","malvernemel","nth","position"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]],"mem":null},
{"id":"n-d4bead8b","guard":[["hasAny",["element","item number","nth","poorrichard","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Poor Richard."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-f9e082b9","guard":[["hasAny",["element","frenchcreekfreddie","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is French Creek Freddie."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-00a9a695","guard":[["hasAny",["element","item number","mtparker","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is MT Parker."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-00c928dc","guard":[["hasAny",["element","item number","nth","position","unithegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Uni the Groundhog."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-1208415a","guard":[["hasAny",["element","item number","msg","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]]],"mem":null},
{"id":"n-13e96f83","guard":[["hasAny",["element","invert case","item number","malvernemel","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-16b25bf3","guard":[["hasAny",["element","item number","nth","position","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Wiarton Willie."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-1cd9b604","guard":[["hasAny",["element","item number","msg","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-1e8edeff","guard":[["hasAny",["element","invert case","item number","malvernemel","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-26246ba2","guard":[["hasAny",["boisebill","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Boise Bill."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-28938845","guard":[["hasAny",["element","gordythegroundhog","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Gordy the Groundhog."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-38fb8e75","guard":[["hasAny",["element","hopethegroundhog","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Hope the Groundhog."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-3cf5d710","guard":[["hasAny",["bowmanbill","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Bowman Bill."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-42feabc0","guard":[["hasAny",["element","item number","nth","pattypagoda","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Patty Pagoda."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-458cdd33","guard":[["hasAny",["chucklesthegroundhog","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Chuckles the Groundhog."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-4ee8304b","guard":[["hasAny",["element","item number","malvernemel","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Malverne Mel."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-4fbbb3a6","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","malvernemel","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-5408eb07","guard":[["hasAny",["element","fenwickflossie","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Fenwick Flossie."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-7851bf45","guard":[["hasAny",["element","heavenswildlifeharvey","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Heaven’s Wildlife Harvey."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-888a9dec","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","malvernemel","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-8d06d287","guard":[["hasAny",["element","item number","nth","position","smithlakejake"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Smith Lake Jake."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-96022cd3","guard":[["hasAny",["element","item number","msg","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"},{"lit":"name"}]]],"mem":null},
{"id":"n-9cf0741b","guard":[["hasAny",["balzacbilly","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Balzac Billy."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-bf31276a","guard":[["hasAny",["element","item number","lower case","lowercase","malvernemel","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-c9bd28d7","guard":[["hasAny",["buckeyechuck","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Buckeye Chuck."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-c9c84563","guard":[["hasAny",["element","item number","nth","position","shubenacadiesam"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Shubenacadie Sam."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-d303e735","guard":[["hasAny",["element","item number","msg","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-d39cbbf2","guard":[["hasAny",["doverdoug","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Dover Doug."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-dd31c314","guard":[["hasAny",["element","item number","mountjoyminnie","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Mount Joy Minnie."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-de72e8f3","guard":[["hasAny",["element","item number","lower case","lowercase","malvernemel","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-e6869c1a","guard":[["hasAny",["element","item number","nth","position","potomacphil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Potomac Phil."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-fedd6eef","guard":[["hasAny",["element","item number","msg","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Ms. G."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-06a091c6","guard":[["hasAny",["element","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}],{"lit":3}]],"mem":null},
{"id":"n-0aafd3e5","guard":[["hasAny",["element","item number","nth","position","schnogadahlsammi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Schnogadahl Sammi."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-0f0631a9","guard":[["hasAny",["element","item number","landerlil","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Lander Lil."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-1196cc72","guard":[["hasAny",["element","item number","nth","position","stonewalljackson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Stonewall Jackson."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-19137a0a","guard":[["hasAny",["element","item number","nth","position","stumptownfil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Stumptown Fil."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-1bf0a87c","guard":[["hasAny",["element","item number","lucythelobster","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Lucy the Lobster."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-1e15b722","guard":[["hasAny",["element","item number","nth","position","woodstockwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Woodstock Willie."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-27abd876","guard":[["hasAny",["element","item number","nth","position","woodythewoodchuck"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Woody the Woodchuck."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-2ffa618d","guard":[["hasAny",["element","item number","nth","position","scrambletheduck"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Scramble the Duck."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-477e44d2","guard":[["hasAny",["element","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}],{"lit":3}]],"mem":null},
{"id":"n-47bb02a1","guard":[["hasAny",["chuckwood","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Chuck Wood."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-48fe3a09","guard":[["hasAny",["element","item number","nth","position","snowytheprairiedog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Snowy the Prairie Dog."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-598f5bc2","guard":[["hasAny",["element","item number","nth","position","yonahthegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Yonah the Groundhog."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-662fd2ea","guard":[["hasAny",["element","item number","nth","polkcountypaula","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Polk County Paula."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-66e8305f","guard":[["hasAny",["element","item number","nth","position","vanislandviolet"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Van Island Violet."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-6b66d389","guard":[["hasAny",["dunkirkdave","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Dunkirk Dave."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-8c8aa486","guard":[["hasAny",["element","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"shortname"}],{"lit":2}]],"mem":null},
{"id":"n-9458e347","guard":[["hasAny",["chillycharlie","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Chilly Charlie."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-a3801779","guard":[["hasAny",["element","item number","middlemissmike","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Middlemiss Mike."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-be2d703e","guard":[["hasAny",["element","item number","nth","octoraroorphie","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Octoraro Orphie."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-c8b7047d","guard":[["hasAny",["cluxatawneyhenrietta","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Cluxatawney Henrietta."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-d92c63a5","guard":[["hasAny",["element","item number","nth","poppythegroundhog","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Poppy the Groundhog."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-ea2704b1","guard":[["hasAny",["element","item number","nth","position","wildwoodwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ",{"slot":2}," is Wildwood Willie."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}]]],"mem":null},
{"id":"n-f1ee3012","guard":[["hasAny",["element","item number","malvernemel","normalise","normalize","nth","position","simplify the text"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}],{"lit":2}]],"mem":null},
{"id":"n-13d56237","guard":[["hasAny",["element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":4},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-43017e9a","guard":[["hasAny",["element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-78cdc01e","guard":[["hasAny",["element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":12},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}]]],"mem":null},
{"id":"n-7d388e98","guard":[["hasAny",["change to","element","item number","nth","position","replace","stonewalljackson","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],["sense.lastWord"]]],"mem":null},
{"id":"n-ac0ada43","guard":[["hasAny",["element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-c1f89a10","guard":[["hasAny",["element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["sense.wordCount"],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-ec50e9ac","guard":[["hasAny",["element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":5},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}]]],"mem":null},
{"id":"n-f12e2e35","guard":[["hasAny",["change to","element","has","item number","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":2}],["sense.lastWord"]]],"mem":null},
{"id":"n-fbdf6956","guard":[["hasAny",["element","item number","leading zeros","malvernemel","nth","pad","pad with","padded to","position","zero pad"]]],"pyramid":["render.str",["transform.padStart",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],{"lit":10},["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}]]],"mem":null},
{"id":"n-3e54865d","guard":[["hasAny",["element","item number","join","joined with","malvernemel","nth","position","separated by"]]],"pyramid":["render.str",["transform.join",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"name"}]]],"mem":null},
{"id":"n-13e5f83d","guard":[["hasAny",["bennythebass","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is benny-the-bass is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-1c5554ec","guard":[["hasAny",["buffalobert","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is buffalo-bert is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-29150157","guard":[["hasAny",["element","groverandsue","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is grover-and-sue is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-39b70c07","guard":[["hasAny",["element","item number","nth","oilspringsollie","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is oil-springs-ollie is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-3be1c262","guard":[["hasAny",["beardsleybart","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is beardsley-bart is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-4ae1c5d5","guard":[["hasAny",["element","item number","mountgretnagrady","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is mount-gretna-grady is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-50520ce2","guard":[["hasAny",["element","generalbeauregardlee","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is general-beauregard-lee is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-600208f0","guard":[["hasAny",["element","harleysvillehank","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is harleysville-hank is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-6365909c","guard":[["hasAny",["element","item number","nth","pisgahpenny","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is pisgah-penny is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-77612bf5","guard":[["hasAny",["element","item number","nth","position","tinicumtim"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is tinicum-tim is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-78f7f4bc","guard":[["hasAny",["element","frenchcreekfreddie","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is french-creek-freddie is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-7939dc53","guard":[["hasAny",["element","item number","nth","position","queencitycharlie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is queen-city-charlie is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-7b476401","guard":[["hasAny",["chesapeakechuck","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is chesapeake-chuck is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-88ea70c6","guard":[["hasAny",["element","item number","nth","position","sandmountainsam"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is sand-mountain-sam is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-aa6a03b1","guard":[["hasAny",["element","item number","ladyedwinaofessex","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is lady-edwina-of-essex is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-aed2d890","guard":[["hasAny",["element","item number","nth","position","tworiverstunnel"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is two-rivers-tunnel is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-afbf723d","guard":[["hasAny",["element","item number","nth","position","sirwalterwally"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is sir-walter-wally is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-d60406de","guard":[["hasAny",["element","fredlamarmotte","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is fred-la-marmotte is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-f30ba32d","guard":[["hasAny",["element","item number","nth","position","statenislandchuck"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is staten-island-chuck is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-f8f51298","guard":[["hasAny",["element","item number","nth","poorrichard","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is poor-richard is ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-051c2e62","guard":[["hasAny",["element","item number","nth","position","separate by","split","split by","stumptownfil"]]],"pyramid":["render.lines",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-109fcb86","guard":[["hasAny",["bowmanbill","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is bowman-bill is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-15c42dd2","guard":[["hasAny",["balzacbilly","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is balzac-billy is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-3a7e48fc","guard":[["hasAny",["element","item number","nth","position","shubenacadiesam"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is shubenacadie-sam is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-4494e17b","guard":[["hasAny",["element","item number","nth","position","smithlakejake"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is smith-lake-jake is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-50eb3e5a","guard":[["hasAny",["element","item number","mtparker","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is mt-parker is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-5260df24","guard":[["hasAny",["buckeyechuck","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is buckeye-chuck is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-5831274d","guard":[["hasAny",["chucklesthegroundhog","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is chuckles-the-groundhog is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-5a021d64","guard":[["hasAny",["element","gordythegroundhog","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is gordy-the-groundhog is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-5d38ed71","guard":[["hasAny",["element","item number","nth","position","unithegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is uni-the-groundhog is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-65608c80","guard":[["hasAny",["delete","element","item number","nth","position","remove","stonewalljackson","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-69002b98","guard":[["hasAny",["element","item number","malvernemel","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is malverne-mel is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-6a22d443","guard":[["hasAny",["element","item number","nth","position","potomacphil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is potomac-phil is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-71371a15","guard":[["hasAny",["doverdoug","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is dover-doug is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-75ef9ddc","guard":[["hasAny",["element","item number","nth","pattypagoda","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is patty-pagoda is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-7b4b8425","guard":[["hasAny",["element","heavenswildlifeharvey","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is heavens-wildlife-harvey is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-7f43532f","guard":[["hasAny",["element","item number","mountjoyminnie","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is mount-joy-minnie is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-93dc630a","guard":[["hasAny",["delete","element","item number","nth","position","remove","strip out","stumptownfil","without"]]],"pyramid":["render.str",["transform.remove",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-98f1339e","guard":[["hasAny",["element","item number","msg","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is ms-g is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-9cf22d9a","guard":[["hasAny",["element","item number","nth","position","separate by","split","split by","stonewalljackson"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-9d7192fd","guard":[["hasAny",["element","item number","nth","position","wiartonwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is wiarton-willie is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-a0b0d4ec","guard":[["hasAny",["boisebill","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is boise-bill is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-b6357213","guard":[["hasAny",["element","item number","nth","position","separate by","split","split by","stumptownfil"]]],"pyramid":["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-c2cd896e","guard":[["hasAny",["element","item number","nth","position","separate by","split","split by","stumptownfil"]]],"pyramid":["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"},{"lit":"shortname"}]]],"mem":null},
{"id":"n-c7ff9346","guard":[["hasAny",["element","fenwickflossie","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is fenwick-flossie is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-fbb137f4","guard":[["hasAny",["element","hopethegroundhog","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is hope-the-groundhog is ",{"slot":2},"."]},["sense.wordAt",{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-00fc8169","guard":[["hasAny",["change to","element","hopethegroundhog","item number","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-1b2f2ad9","guard":[["hasAny",["element","item number","middlemissmike","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is middlemiss-mike is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-28759862","guard":[["hasAny",["change to","element","item number","malvernemel","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}]]],"mem":null},
{"id":"n-2af92226","guard":[["hasAny",["element","item number","nth","position","stonewalljackson"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is stonewall-jackson is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-2ea04050","guard":[["hasAny",["change to","element","hopethegroundhog","item number","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}]]],"mem":null},
{"id":"n-336bfbd8","guard":[["hasAny",["element","item number","nth","position","yonahthegroundhog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is yonah-the-groundhog is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-63c0090b","guard":[["hasAny",["element","item number","nth","polkcountypaula","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is polk-county-paula is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-7446b5c1","guard":[["hasAny",["element","item number","nth","position","snowytheprairiedog"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is snowy-the-prairie-dog is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-7975a5f9","guard":[["hasAny",["chuckwood","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is chuck-wood is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-829d61a5","guard":[["hasAny",["element","item number","lucythelobster","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is lucy-the-lobster is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-8c8700b5","guard":[["hasAny",["element","item number","nth","position","woodythewoodchuck"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is woody-the-woodchuck is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-8e5c03f5","guard":[["hasAny",["element","item number","landerlil","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is lander-lil is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-8ead4c24","guard":[["hasAny",["change to","element","hopethegroundhog","item number","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}]]],"mem":null},
{"id":"n-8fb2f02c","guard":[["hasAny",["element","item number","nth","position","wildwoodwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is wildwood-willie is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-9638a1d2","guard":[["hasAny",["change to","element","hopethegroundhog","item number","nth","position","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"name"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"shortname"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"city"}],{"lit":-1}]]],"mem":null},
{"id":"n-a1a87f5b","guard":[["hasAny",["element","item number","nth","position","woodstockwillie"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is woodstock-willie is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-a71eb43a","guard":[["hasAny",["chillycharlie","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is chilly-charlie is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-b31a6a58","guard":[["hasAny",["element","item number","nth","position","stumptownfil"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is stumptown-fil is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-c61cbd5f","guard":[["hasAny",["element","item number","nth","position","schnogadahlsammi"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is schnogadahl-sammi is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-cb0dff05","guard":[["hasAny",["cluxatawneyhenrietta","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is cluxatawney-henrietta is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-dbf72917","guard":[["hasAny",["dunkirkdave","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is dunkirk-dave is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-dce989cc","guard":[["hasAny",["element","item number","nth","position","vanislandviolet"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is van-island-violet is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-de7656bb","guard":[["hasAny",["element","item number","nth","poppythegroundhog","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is poppy-the-groundhog is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-e17a1d1d","guard":[["hasAny",["element","item number","nth","position","scrambletheduck"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is scramble-the-duck is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-f16c5d11","guard":[["hasAny",["element","item number","nth","octoraroorphie","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," whose ",{"slot":1}," is octoraro-orphie is ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":3}],["know.lookup",["transform.nthStr",["know.find",{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"}],{"lit":1}],{"lit":"fr-tidytuesday-groundhogs-bfd00a"},{"lit":"slug"},{"lit":"name"}]],"mem":null},
{"id":"n-04d0a7a7","guard":[["hasAny",["dunkirkdave","has","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug dunkirk-dave":"The name whose slug is dunkirk-dave is Dunkirk Dave."}}},
{"id":"n-1ba0c662","guard":[["hasAny",["chillycharlie","has","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug chilly-charlie":"The name whose slug is chilly-charlie is Chilly Charlie."}}},
{"id":"n-1bfb50cb","guard":[["hasAny",["name","slug","tinicumtim"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"tinicum-tim is the slug of which name":"The name whose slug is tinicum-tim is Tinicum Tim."}}},
{"id":"n-1e71a87c","guard":[["hasAny",["buffalobert","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"buffalo-bert is the slug of which name":"The name whose slug is buffalo-bert is Buffalo Bert."}}},
{"id":"n-275753ff","guard":[["hasAny",["buckeyechuck","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is buckeye-chuck":"The name whose slug is buckeye-chuck is Buckeye Chuck."}}},
{"id":"n-29065a96","guard":[["hasAny",["bennythebass","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"benny-the-bass is the slug of which name":"The name whose slug is benny-the-bass is Benny the Bass."}}},
{"id":"n-2b733406","guard":[["hasAny",["boisebill","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is boise-bill":"The name whose slug is boise-bill is Boise Bill."}}},
{"id":"n-2f89061f","guard":[["hasAny",["bowmanbill","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is bowman-bill":"The name whose slug is bowman-bill is Bowman Bill."}}},
{"id":"n-3230e62e","guard":[["hasAny",["has","name","slug","woodythewoodchuck"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug woody-the-woodchuck":"The name whose slug is woody-the-woodchuck is Woody the Woodchuck."}}},
{"id":"n-3b75b67f","guard":[["hasAny",["has","name","slug","vanislandviolet"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug van-island-violet":"The name whose slug is van-island-violet is Van Island Violet."}}},
{"id":"n-3dc9be77","guard":[["hasAny",["name","queencitycharlie","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"queen-city-charlie is the slug of which name":"The name whose slug is queen-city-charlie is Queen City Charlie."}}},
{"id":"n-40a2de14","guard":[["hasAny",["generalbeauregardlee","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"general-beauregard-lee is the slug of which name":"The name whose slug is general-beauregard-lee is General Beauregard Lee."}}},
{"id":"n-41b56196","guard":[["hasAny",["mountgretnagrady","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"mount-gretna-grady is the slug of which name":"The name whose slug is mount-gretna-grady is Mount Gretna Grady."}}},
{"id":"n-48d51cef","guard":[["hasAny",["chucklesthegroundhog","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is chuckles-the-groundhog":"The name whose slug is chuckles-the-groundhog is Chuckles the Groundhog."}}},
{"id":"n-4984de36","guard":[["hasAny",["has","name","octoraroorphie","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug octoraro-orphie":"The name whose slug is octoraro-orphie is Octoraro Orphie."}}},
{"id":"n-49dfa57a","guard":[["hasAny",["has","name","slug","stumptownfil"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug stumptown-fil":"The name whose slug is stumptown-fil is Stumptown Fil."}}},
{"id":"n-4e0d55b2","guard":[["hasAny",["mountjoyminnie","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is mount-joy-minnie":"The name whose slug is mount-joy-minnie is Mount Joy Minnie."}}},
{"id":"n-51da038c","guard":[["hasAny",["frenchcreekfreddie","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"french-creek-freddie is the slug of which name":"The name whose slug is french-creek-freddie is French Creek Freddie."}}},
{"id":"n-53604dc0","guard":[["hasAny",["name","slug","tworiverstunnel"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"two-rivers-tunnel is the slug of which name":"The name whose slug is two-rivers-tunnel is Two Rivers Tunnel."}}},
{"id":"n-53ba53ef","guard":[["hasAny",["has","middlemissmike","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug middlemiss-mike":"The name whose slug is middlemiss-mike is Middlemiss Mike."}}},
{"id":"n-56f32847","guard":[["hasAny",["name","oilspringsollie","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"oil-springs-ollie is the slug of which name":"The name whose slug is oil-springs-ollie is Oil Springs Ollie."}}},
{"id":"n-586f9c73","guard":[["hasAny",["has","name","poppythegroundhog","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug poppy-the-groundhog":"The name whose slug is poppy-the-groundhog is Poppy the Groundhog."}}},
{"id":"n-5b88f1d5","guard":[["hasAny",["fredlamarmotte","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"fred-la-marmotte is the slug of which name":"The name whose slug is fred-la-marmotte is Fred la Marmotte."}}},
{"id":"n-61a433f2","guard":[["hasAny",["name","sirwalterwally","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"sir-walter-wally is the slug of which name":"The name whose slug is sir-walter-wally is Sir Walter Wally."}}},
{"id":"n-64693deb","guard":[["hasAny",["name","potomacphil","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is potomac-phil":"The name whose slug is potomac-phil is Potomac Phil."}}},
{"id":"n-672902e3","guard":[["hasAny",["has","name","slug","woodstockwillie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug woodstock-willie":"The name whose slug is woodstock-willie is Woodstock Willie."}}},
{"id":"n-67400b68","guard":[["hasAny",["name","poorrichard","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"poor-richard is the slug of which name":"The name whose slug is poor-richard is Poor Richard."}}},
{"id":"n-67f15570","guard":[["hasAny",["fenwickflossie","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is fenwick-flossie":"The name whose slug is fenwick-flossie is Fenwick Flossie."}}},
{"id":"n-6b5e9112","guard":[["hasAny",["name","pattypagoda","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is patty-pagoda":"The name whose slug is patty-pagoda is Patty Pagoda."}}},
{"id":"n-6e0fd08c","guard":[["hasAny",["cluxatawneyhenrietta","has","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug cluxatawney-henrietta":"The name whose slug is cluxatawney-henrietta is Cluxatawney Henrietta."}}},
{"id":"n-79372ec7","guard":[["hasAny",["name","slug","statenislandchuck"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"staten-island-chuck is the slug of which name":"The name whose slug is staten-island-chuck is Staten Island Chuck."}}},
{"id":"n-7d6ee425","guard":[["hasAny",["has","name","slug","wildwoodwillie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug wildwood-willie":"The name whose slug is wildwood-willie is Wildwood Willie."}}},
{"id":"n-7fb2b20b","guard":[["hasAny",["chuckwood","has","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug chuck-wood":"The name whose slug is chuck-wood is Chuck Wood."}}},
{"id":"n-7fd9deb1","guard":[["hasAny",["mtparker","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is mt-parker":"The name whose slug is mt-parker is MT Parker."}}},
{"id":"n-87be1d58","guard":[["hasAny",["groverandsue","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"grover-and-sue is the slug of which name":"The name whose slug is grover-and-sue is Grover and Sue."}}},
{"id":"n-902de4d1","guard":[["hasAny",["balzacbilly","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is balzac-billy":"The name whose slug is balzac-billy is Balzac Billy."}}},
{"id":"n-955c2134","guard":[["hasAny",["beardsleybart","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"beardsley-bart is the slug of which name":"The name whose slug is beardsley-bart is Beardsley Bart."}}},
{"id":"n-9a50e02a","guard":[["hasAny",["msg","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is ms-g":"The name whose slug is ms-g is Ms. G."}}},
{"id":"n-9b669069","guard":[["hasAny",["has","name","scrambletheduck","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug scramble-the-duck":"The name whose slug is scramble-the-duck is Scramble the Duck."}}},
{"id":"n-9ddc57cd","guard":[["hasAny",["chesapeakechuck","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"chesapeake-chuck is the slug of which name":"The name whose slug is chesapeake-chuck is Chesapeake Chuck."}}},
{"id":"n-a84b4b09","guard":[["hasAny",["has","landerlil","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug lander-lil":"The name whose slug is lander-lil is Lander Lil."}}},
{"id":"n-aac98199","guard":[["hasAny",["hopethegroundhog","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is hope-the-groundhog":"The name whose slug is hope-the-groundhog is Hope the Groundhog."}}},
{"id":"n-aadf6125","guard":[["hasAny",["malvernemel","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is malverne-mel":"The name whose slug is malverne-mel is Malverne Mel."}}},
{"id":"n-b2f810ea","guard":[["hasAny",["doverdoug","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is dover-doug":"The name whose slug is dover-doug is Dover Doug."}}},
{"id":"n-c2b95505","guard":[["hasAny",["has","name","slug","stonewalljackson"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug stonewall-jackson":"The name whose slug is stonewall-jackson is Stonewall Jackson."}}},
{"id":"n-c2f1ffda","guard":[["hasAny",["has","name","polkcountypaula","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug polk-county-paula":"The name whose slug is polk-county-paula is Polk County Paula."}}},
{"id":"n-c55fa16d","guard":[["hasAny",["has","name","slug","yonahthegroundhog"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug yonah-the-groundhog":"The name whose slug is yonah-the-groundhog is Yonah the Groundhog."}}},
{"id":"n-c7869393","guard":[["hasAny",["gordythegroundhog","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is gordy-the-groundhog":"The name whose slug is gordy-the-groundhog is Gordy the Groundhog."}}},
{"id":"n-c88d1936","guard":[["hasAny",["ladyedwinaofessex","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"lady-edwina-of-essex is the slug of which name":"The name whose slug is lady-edwina-of-essex is Lady Edwina of Essex."}}},
{"id":"n-d12ab48c","guard":[["hasAny",["name","slug","wiartonwillie"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is wiarton-willie":"The name whose slug is wiarton-willie is Wiarton Willie."}}},
{"id":"n-d95c03e9","guard":[["hasAny",["has","name","schnogadahlsammi","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug schnogadahl-sammi":"The name whose slug is schnogadahl-sammi is Schnogadahl Sammi."}}},
{"id":"n-d9c12121","guard":[["hasAny",["name","slug","unithegroundhog"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is uni-the-groundhog":"The name whose slug is uni-the-groundhog is Uni the Groundhog."}}},
{"id":"n-da4d236a","guard":[["hasAny",["heavenswildlifeharvey","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is heavens-wildlife-harvey":"The name whose slug is heavens-wildlife-harvey is Heaven’s Wildlife Harvey."}}},
{"id":"n-de3a073d","guard":[["hasAny",["name","shubenacadiesam","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is shubenacadie-sam":"The name whose slug is shubenacadie-sam is Shubenacadie Sam."}}},
{"id":"n-df86942b","guard":[["hasAny",["has","name","slug","snowytheprairiedog"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug snowy-the-prairie-dog":"The name whose slug is snowy-the-prairie-dog is Snowy the Prairie Dog."}}},
{"id":"n-e0ebd373","guard":[["hasAny",["name","pisgahpenny","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pisgah-penny is the slug of which name":"The name whose slug is pisgah-penny is Pisgah Penny."}}},
{"id":"n-e455c847","guard":[["hasAny",["has","lucythelobster","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which name has the slug lucy-the-lobster":"The name whose slug is lucy-the-lobster is Lucy the Lobster."}}},
{"id":"n-eccb19a7","guard":[["hasAny",["name","sandmountainsam","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"sand-mountain-sam is the slug of which name":"The name whose slug is sand-mountain-sam is Sand Mountain Sam."}}},
{"id":"n-f07e865e","guard":[["hasAny",["harleysvillehank","name","slug"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"harleysville-hank is the slug of which name":"The name whose slug is harleysville-hank is Harleysville Hank."}}},
{"id":"n-fb2081ad","guard":[["hasAny",["name","slug","smithlakejake"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"name the name whose slug is smith-lake-jake":"The name whose slug is smith-lake-jake is Smith Lake Jake."}}},
{"id":"n-ce5dd3e7","guard":[["has","name"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug lucy-the-lobster":"The name whose slug is lucy-the-lobster is Lucy the Lobster.","lady-edwina-of-essex is the slug of which name":"The name whose slug is lady-edwina-of-essex is Lady Edwina of Essex.","which name has the slug woody-the-woodchuck":"The name whose slug is woody-the-woodchuck is Woody the Woodchuck.","which name has the slug snowy-the-prairie-dog":"The name whose slug is snowy-the-prairie-dog is Snowy the Prairie Dog.","sand-mountain-sam is the slug of which name":"The name whose slug is sand-mountain-sam is Sand Mountain Sam.","name the name whose slug is malverne-mel":"The name whose slug is malverne-mel is Malverne Mel.","name the name whose slug is shubenacadie-sam":"The name whose slug is shubenacadie-sam is Shubenacadie Sam.","name the name whose slug is mount-joy-minnie":"The name whose slug is mount-joy-minnie is Mount Joy Minnie.","name the name whose slug is balzac-billy":"The name whose slug is balzac-billy is Balzac Billy.","which name has the slug chilly-charlie":"The name whose slug is chilly-charlie is Chilly Charlie.","two-rivers-tunnel is the slug of which name":"The name whose slug is two-rivers-tunnel is Two Rivers Tunnel.","name the name whose slug is patty-pagoda":"The name whose slug is patty-pagoda is Patty Pagoda.","harleysville-hank is the slug of which name":"The name whose slug is harleysville-hank is Harleysville Hank.","pisgah-penny is the slug of which name":"The name whose slug is pisgah-penny is Pisgah Penny.","name the name whose slug is buckeye-chuck":"The name whose slug is buckeye-chuck is Buckeye Chuck.","beardsley-bart is the slug of which name":"The name whose slug is beardsley-bart is Beardsley Bart.","mount-gretna-grady is the slug of which name":"The name whose slug is mount-gretna-grady is Mount Gretna Grady.","which name has the slug polk-county-paula":"The name whose slug is polk-county-paula is Polk County Paula.","name the name whose slug is wiarton-willie":"The name whose slug is wiarton-willie is Wiarton Willie.","name the name whose slug is boise-bill":"The name whose slug is boise-bill is Boise Bill.","name the name whose slug is dover-doug":"The name whose slug is dover-doug is Dover Doug.","which name has the slug cluxatawney-henrietta":"The name whose slug is cluxatawney-henrietta is Cluxatawney Henrietta.","which name has the slug dunkirk-dave":"The name whose slug is dunkirk-dave is Dunkirk Dave.","name the name whose slug is heavens-wildlife-harvey":"The name whose slug is heavens-wildlife-harvey is Heaven’s Wildlife Harvey.","staten-island-chuck is the slug of which name":"The name whose slug is staten-island-chuck is Staten Island Chuck.","which name has the slug poppy-the-groundhog":"The name whose slug is poppy-the-groundhog is Poppy the Groundhog.","poor-richard is the slug of which name":"The name whose slug is poor-richard is Poor Richard.","name the name whose slug is smith-lake-jake":"The name whose slug is smith-lake-jake is Smith Lake Jake.","which name has the slug middlemiss-mike":"The name whose slug is middlemiss-mike is Middlemiss Mike.","which name has the slug schnogadahl-sammi":"The name whose slug is schnogadahl-sammi is Schnogadahl Sammi.","chesapeake-chuck is the slug of which name":"The name whose slug is chesapeake-chuck is Chesapeake Chuck.","benny-the-bass is the slug of which name":"The name whose slug is benny-the-bass is Benny the Bass.","which name has the slug chuck-wood":"The name whose slug is chuck-wood is Chuck Wood.","general-beauregard-lee is the slug of which name":"The name whose slug is general-beauregard-lee is General Beauregard Lee.","which name has the slug stumptown-fil":"The name whose slug is stumptown-fil is Stumptown Fil.","name the name whose slug is fenwick-flossie":"The name whose slug is fenwick-flossie is Fenwick Flossie.","name the name whose slug is hope-the-groundhog":"The name whose slug is hope-the-groundhog is Hope the Groundhog.","buffalo-bert is the slug of which name":"The name whose slug is buffalo-bert is Buffalo Bert.","fred-la-marmotte is the slug of which name":"The name whose slug is fred-la-marmotte is Fred la Marmotte.","name the name whose slug is bowman-bill":"The name whose slug is bowman-bill is Bowman Bill.","french-creek-freddie is the slug of which name":"The name whose slug is french-creek-freddie is French Creek Freddie.","tinicum-tim is the slug of which name":"The name whose slug is tinicum-tim is Tinicum Tim.","which name has the slug stonewall-jackson":"The name whose slug is stonewall-jackson is Stonewall Jackson.","name the name whose slug is mt-parker":"The name whose slug is mt-parker is MT Parker.","which name has the slug octoraro-orphie":"The name whose slug is octoraro-orphie is Octoraro Orphie.","which name has the slug van-island-violet":"The name whose slug is van-island-violet is Van Island Violet.","grover-and-sue is the slug of which name":"The name whose slug is grover-and-sue is Grover and Sue.","name the name whose slug is ms-g":"The name whose slug is ms-g is Ms. G.","sir-walter-wally is the slug of which name":"The name whose slug is sir-walter-wally is Sir Walter Wally.","which name has the slug wildwood-willie":"The name whose slug is wildwood-willie is Wildwood Willie.","oil-springs-ollie is the slug of which name":"The name whose slug is oil-springs-ollie is Oil Springs Ollie.","name the name whose slug is gordy-the-groundhog":"The name whose slug is gordy-the-groundhog is Gordy the Groundhog.","which name has the slug scramble-the-duck":"The name whose slug is scramble-the-duck is Scramble the Duck.","which name has the slug lander-lil":"The name whose slug is lander-lil is Lander Lil.","name the name whose slug is chuckles-the-groundhog":"The name whose slug is chuckles-the-groundhog is Chuckles the Groundhog.","which name has the slug woodstock-willie":"The name whose slug is woodstock-willie is Woodstock Willie.","which name has the slug yonah-the-groundhog":"The name whose slug is yonah-the-groundhog is Yonah the Groundhog.","queen-city-charlie is the slug of which name":"The name whose slug is queen-city-charlie is Queen City Charlie.","name the name whose slug is potomac-phil":"The name whose slug is potomac-phil is Potomac Phil.","name the name whose slug is uni-the-groundhog":"The name whose slug is uni-the-groundhog is Uni the Groundhog."}}},
{"id":"n-036ffb0f","guard":[["has","mountjoyminnie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is mount-joy-minnie":"The name whose slug is mount-joy-minnie is Mount Joy Minnie."}}},
{"id":"n-08df9946","guard":[["has","groverandsue"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"grover-and-sue is the slug of which name":"The name whose slug is grover-and-sue is Grover and Sue."}}},
{"id":"n-09f0ab4d","guard":[["has","doverdoug"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is dover-doug":"The name whose slug is dover-doug is Dover Doug."}}},
{"id":"n-0c411197","guard":[["has","mountgretnagrady"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"mount-gretna-grady is the slug of which name":"The name whose slug is mount-gretna-grady is Mount Gretna Grady."}}},
{"id":"n-0e28a954","guard":[["has","statenislandchuck"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"staten-island-chuck is the slug of which name":"The name whose slug is staten-island-chuck is Staten Island Chuck."}}},
{"id":"n-17614ea7","guard":[["has","poppythegroundhog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug poppy-the-groundhog":"The name whose slug is poppy-the-groundhog is Poppy the Groundhog."}}},
{"id":"n-199baaed","guard":[["has","wiartonwillie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is wiarton-willie":"The name whose slug is wiarton-willie is Wiarton Willie."}}},
{"id":"n-1f677f5f","guard":[["has","polkcountypaula"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug polk-county-paula":"The name whose slug is polk-county-paula is Polk County Paula."}}},
{"id":"n-2584e730","guard":[["has","chesapeakechuck"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"chesapeake-chuck is the slug of which name":"The name whose slug is chesapeake-chuck is Chesapeake Chuck."}}},
{"id":"n-25e3f1f2","guard":[["has","woodythewoodchuck"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug woody-the-woodchuck":"The name whose slug is woody-the-woodchuck is Woody the Woodchuck."}}},
{"id":"n-2d2da760","guard":[["has","landerlil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug lander-lil":"The name whose slug is lander-lil is Lander Lil."}}},
{"id":"n-324bf452","guard":[["has","chucklesthegroundhog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is chuckles-the-groundhog":"The name whose slug is chuckles-the-groundhog is Chuckles the Groundhog."}}},
{"id":"n-3794c85e","guard":[["has","poorrichard"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"poor-richard is the slug of which name":"The name whose slug is poor-richard is Poor Richard."}}},
{"id":"n-38b1ac99","guard":[["has","gordythegroundhog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is gordy-the-groundhog":"The name whose slug is gordy-the-groundhog is Gordy the Groundhog."}}},
{"id":"n-3bf5aee6","guard":[["has","smithlakejake"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is smith-lake-jake":"The name whose slug is smith-lake-jake is Smith Lake Jake."}}},
{"id":"n-3fde716c","guard":[["has","stumptownfil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug stumptown-fil":"The name whose slug is stumptown-fil is Stumptown Fil."}}},
{"id":"n-42b168a4","guard":[["has","malvernemel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is malverne-mel":"The name whose slug is malverne-mel is Malverne Mel."}}},
{"id":"n-436ef594","guard":[["has","generalbeauregardlee"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"general-beauregard-lee is the slug of which name":"The name whose slug is general-beauregard-lee is General Beauregard Lee."}}},
{"id":"n-51929e0c","guard":[["has","boisebill"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is boise-bill":"The name whose slug is boise-bill is Boise Bill."}}},
{"id":"n-53e94cda","guard":[["has","oilspringsollie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"oil-springs-ollie is the slug of which name":"The name whose slug is oil-springs-ollie is Oil Springs Ollie."}}},
{"id":"n-5807474d","guard":[["has","woodstockwillie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug woodstock-willie":"The name whose slug is woodstock-willie is Woodstock Willie."}}},
{"id":"n-5b046c73","guard":[["has","mtparker"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is mt-parker":"The name whose slug is mt-parker is MT Parker."}}},
{"id":"n-60a4275f","guard":[["has","middlemissmike"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug middlemiss-mike":"The name whose slug is middlemiss-mike is Middlemiss Mike."}}},
{"id":"n-65b5e212","guard":[["has","buffalobert"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"buffalo-bert is the slug of which name":"The name whose slug is buffalo-bert is Buffalo Bert."}}},
{"id":"n-67ccd995","guard":[["has","fredlamarmotte"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"fred-la-marmotte is the slug of which name":"The name whose slug is fred-la-marmotte is Fred la Marmotte."}}},
{"id":"n-7849ecfd","guard":[["has","shubenacadiesam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is shubenacadie-sam":"The name whose slug is shubenacadie-sam is Shubenacadie Sam."}}},
{"id":"n-7864ba8c","guard":[["has","pisgahpenny"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pisgah-penny is the slug of which name":"The name whose slug is pisgah-penny is Pisgah Penny."}}},
{"id":"n-80d29180","guard":[["has","tinicumtim"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"tinicum-tim is the slug of which name":"The name whose slug is tinicum-tim is Tinicum Tim."}}},
{"id":"n-8395f5a2","guard":[["has","balzacbilly"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is balzac-billy":"The name whose slug is balzac-billy is Balzac Billy."}}},
{"id":"n-8bd9a342","guard":[["has","tworiverstunnel"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"two-rivers-tunnel is the slug of which name":"The name whose slug is two-rivers-tunnel is Two Rivers Tunnel."}}},
{"id":"n-8dfd87f8","guard":[["has","snowytheprairiedog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug snowy-the-prairie-dog":"The name whose slug is snowy-the-prairie-dog is Snowy the Prairie Dog."}}},
{"id":"n-906a811b","guard":[["has","beardsleybart"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"beardsley-bart is the slug of which name":"The name whose slug is beardsley-bart is Beardsley Bart."}}},
{"id":"n-91e1d21b","guard":[["has","octoraroorphie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug octoraro-orphie":"The name whose slug is octoraro-orphie is Octoraro Orphie."}}},
{"id":"n-92ce3a2d","guard":[["has","heavenswildlifeharvey"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is heavens-wildlife-harvey":"The name whose slug is heavens-wildlife-harvey is Heaven’s Wildlife Harvey."}}},
{"id":"n-9426684b","guard":[["has","buckeyechuck"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is buckeye-chuck":"The name whose slug is buckeye-chuck is Buckeye Chuck."}}},
{"id":"n-957f64c0","guard":[["has","potomacphil"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is potomac-phil":"The name whose slug is potomac-phil is Potomac Phil."}}},
{"id":"n-97aec382","guard":[["has","chillycharlie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug chilly-charlie":"The name whose slug is chilly-charlie is Chilly Charlie."}}},
{"id":"n-98bf7b54","guard":[["has","pattypagoda"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is patty-pagoda":"The name whose slug is patty-pagoda is Patty Pagoda."}}},
{"id":"n-a8974bce","guard":[["has","wildwoodwillie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug wildwood-willie":"The name whose slug is wildwood-willie is Wildwood Willie."}}},
{"id":"n-a9578cbd","guard":[["has","queencitycharlie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"queen-city-charlie is the slug of which name":"The name whose slug is queen-city-charlie is Queen City Charlie."}}},
{"id":"n-b32f57d2","guard":[["has","sandmountainsam"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"sand-mountain-sam is the slug of which name":"The name whose slug is sand-mountain-sam is Sand Mountain Sam."}}},
{"id":"n-b430f8d8","guard":[["has","yonahthegroundhog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug yonah-the-groundhog":"The name whose slug is yonah-the-groundhog is Yonah the Groundhog."}}},
{"id":"n-b8b85d01","guard":[["has","harleysvillehank"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"harleysville-hank is the slug of which name":"The name whose slug is harleysville-hank is Harleysville Hank."}}},
{"id":"n-b8ec304d","guard":[["has","ladyedwinaofessex"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"lady-edwina-of-essex is the slug of which name":"The name whose slug is lady-edwina-of-essex is Lady Edwina of Essex."}}},
{"id":"n-bd12dd35","guard":[["has","vanislandviolet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug van-island-violet":"The name whose slug is van-island-violet is Van Island Violet."}}},
{"id":"n-bfea201a","guard":[["has","frenchcreekfreddie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"french-creek-freddie is the slug of which name":"The name whose slug is french-creek-freddie is French Creek Freddie."}}},
{"id":"n-c5db00c3","guard":[["has","hopethegroundhog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is hope-the-groundhog":"The name whose slug is hope-the-groundhog is Hope the Groundhog."}}},
{"id":"n-ca5ac3b4","guard":[["has","msg"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is ms-g":"The name whose slug is ms-g is Ms. G."}}},
{"id":"n-cc036063","guard":[["has","lucythelobster"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug lucy-the-lobster":"The name whose slug is lucy-the-lobster is Lucy the Lobster."}}},
{"id":"n-cd63bd69","guard":[["has","dunkirkdave"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug dunkirk-dave":"The name whose slug is dunkirk-dave is Dunkirk Dave."}}},
{"id":"n-cf62bc8e","guard":[["has","bowmanbill"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is bowman-bill":"The name whose slug is bowman-bill is Bowman Bill."}}},
{"id":"n-d1d42030","guard":[["has","sirwalterwally"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"sir-walter-wally is the slug of which name":"The name whose slug is sir-walter-wally is Sir Walter Wally."}}},
{"id":"n-d23bfca5","guard":[["has","cluxatawneyhenrietta"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug cluxatawney-henrietta":"The name whose slug is cluxatawney-henrietta is Cluxatawney Henrietta."}}},
{"id":"n-da3d857b","guard":[["has","fenwickflossie"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is fenwick-flossie":"The name whose slug is fenwick-flossie is Fenwick Flossie."}}},
{"id":"n-dc51e7f7","guard":[["has","stonewalljackson"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug stonewall-jackson":"The name whose slug is stonewall-jackson is Stonewall Jackson."}}},
{"id":"n-e7c42963","guard":[["has","schnogadahlsammi"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug schnogadahl-sammi":"The name whose slug is schnogadahl-sammi is Schnogadahl Sammi."}}},
{"id":"n-e8e0e996","guard":[["has","scrambletheduck"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug scramble-the-duck":"The name whose slug is scramble-the-duck is Scramble the Duck."}}},
{"id":"n-e9da64e8","guard":[["has","chuckwood"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which name has the slug chuck-wood":"The name whose slug is chuck-wood is Chuck Wood."}}},
{"id":"n-f6b48575","guard":[["has","unithegroundhog"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"name the name whose slug is uni-the-groundhog":"The name whose slug is uni-the-groundhog is Uni the Groundhog."}}},
{"id":"n-f91ea291","guard":[["has","bennythebass"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"benny-the-bass is the slug of which name":"The name whose slug is benny-the-bass is Benny the Bass."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"which name has the slug lucy-the-lobster","expect":{"contains":["Lucy the Lobster"],"notRefusal":true}},{"q":"lady-edwina-of-essex is the slug of which name","expect":{"contains":["Lady Edwina of Essex"],"notRefusal":true}},{"q":"which name has the slug woody-the-woodchuck","expect":{"contains":["Woody the Woodchuck"],"notRefusal":true}},{"q":"which name has the slug snowy-the-prairie-dog","expect":{"contains":["Snowy the Prairie Dog"],"notRefusal":true}},{"q":"sand-mountain-sam is the slug of which name","expect":{"contains":["Sand Mountain Sam"],"notRefusal":true}},{"q":"name the name whose slug is malverne-mel","expect":{"contains":["Malverne Mel"],"notRefusal":true}},{"q":"name the name whose slug is shubenacadie-sam","expect":{"contains":["Shubenacadie Sam"],"notRefusal":true}},{"q":"name the name whose slug is mount-joy-minnie","expect":{"contains":["Mount Joy Minnie"],"notRefusal":true}},{"q":"name the name whose slug is balzac-billy","expect":{"contains":["Balzac Billy"],"notRefusal":true}},{"q":"which name has the slug chilly-charlie","expect":{"contains":["Chilly Charlie"],"notRefusal":true}},{"q":"two-rivers-tunnel is the slug of which name","expect":{"contains":["Two Rivers Tunnel"],"notRefusal":true}},{"q":"name the name whose slug is patty-pagoda","expect":{"contains":["Patty Pagoda"],"notRefusal":true}},{"q":"harleysville-hank is the slug of which name","expect":{"contains":["Harleysville Hank"],"notRefusal":true}},{"q":"pisgah-penny is the slug of which name","expect":{"contains":["Pisgah Penny"],"notRefusal":true}},{"q":"name the name whose slug is buckeye-chuck","expect":{"contains":["Buckeye Chuck"],"notRefusal":true}},{"q":"beardsley-bart is the slug of which name","expect":{"contains":["Beardsley Bart"],"notRefusal":true}},{"q":"mount-gretna-grady is the slug of which name","expect":{"contains":["Mount Gretna Grady"],"notRefusal":true}},{"q":"which name has the slug polk-county-paula","expect":{"contains":["Polk County Paula"],"notRefusal":true}},{"q":"name the name whose slug is wiarton-willie","expect":{"contains":["Wiarton Willie"],"notRefusal":true}},{"q":"name the name whose slug is boise-bill","expect":{"contains":["Boise Bill"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
