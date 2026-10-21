// media-type-extension-neo-g10.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"media-type-extension-neo-g10","class":"media-type-extension","generation":10,"lane":"neo","grownFrom":["what file extension does the media type image/vnd.fastbidsheet use","give the extension for application/vnd.yamaha.openscoreformat files","what file extension does the media type application/x-cdlink use","give the extension for application/vnd.osgi.subsystem files","which extension goes with the MIME type application/vnd.ms-powerpoint.addin.macroenabled.12","what file extension does the media type application/x-ms-shortcut use","which extension goes with the MIME type application/vnd.denovo.fcselayout-link","which extension goes with the MIME type application/calendar+xml","what file extension does the media type application/vnd.stardivision.calc use","give the extension for application/vnd.openblox.game+xml files","which extension goes with the MIME type text/vnd.fmi.flexstor","what file extension does the media type application/vnd.proteus.magazine use","which extension goes with the MIME type application/x-wais-source","what file extension does the media type application/vnd.oasis.opendocument.formula-template use","give the extension for application/vnd.openxmlformats-officedocument.wordprocessingml.document files","what file extension does the media type application/p2p-overlay+xml use","what file extension does the media type application/vnd.openxmlformats-officedocument.presentationml.slideshow use","what file extension does the media type text/x-component use","which extension goes with the MIME type application/vnd.sun.xml.draw.template","give the extension for application/vnd.llamagraphics.life-balance.desktop files"],"version":1});

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
knowLoad([{"id":"mime-types","columns":["file extension","media type"],"n":2878,"cols":[{"s":"|||||||||||||||||||||||||||||||||||||ez|appinstaller||aw|appx|appxbundle||||||atom|atomcat|atomdeleted||atomsvc|dwd||held||rsat|||aml|amlx|||bdoc|||||xcs||||||||ccxml||cdfx|cdmia|cdmic|cdmid|cdmio|cdmiq||||||||||||||||||||||||||||||cpl|||||cu|cwl||||||mpd|mpp||davmount|||||dcm|||||||||dbk||||dssc|xdssc||||||||ecma||||||||||||||||||emma|emotionml||||epub||exi|||exp|||fdf|fdt|||||||pfr|||geojson||||||||gml|||||gpx||gxf|gz|||hjson|||stk|||||||||||ink|inkml||ipfix|||its|jar|war|ear|ser|class|js|||||||json|map||||json5|jsonml|||||||kbl|||jsonld|lgr||||||lostxml||||hqx|cpt||mads|webmanifest|mrc|mrcx|ma|nb|mb|mathml||||||||||||||mbox|||mpf||mscml||metalink|meta4|mets|||||maei|musd|mods|||||m21|mp21|mp4|mpg4|mp4s|m4p||||||||msix|msixbundle|doc|dot|||mxf|nq|nt||||||cjs||||||bin|dms|lrf|mar|so|dist|distz|pkg|bpk|dump|elc|deploy|exe|dll|deb|dmg|iso|img|msi|msp|msm|buffer|oda|||opf|ogx||omdoc|onetoc|onetoc2|onetmp|onepkg|one|onea|||oxps|||relo|||xer|pdf|||pgp|asc|sig|asc|prf|||p10||p7m|p7c|p7s|p8||ac|cer|crl|pkipath|pki|pls||ai|eps|ps|||||||||provx|||cww|||||||||||||||xsf|pskcxml|||raml|||rdf|owl|rif|rnc||||rl|rld||||rs|rapd|sls|rusd||gbr|mft||roa||||rsd|rss|rtf||||||||sbml|||||scq|scs|spq|spp||||sdp||||senmlx||||||sensmlx||||||setpay||setreg|||shf|siv|sieve|||||||smi|smil||||rq|srx|||sql|gram|grxml|sru|ssdl||ssml|||||||swidtag|||||||||||||||tei|teicorpus|||tfi|||tsd|||||||toml||trig|||||ttml||||ubj|||||rsheet|td||||||||vec|||||1km||||||||||||||||||||||||||||||||||||||||||||||||||||||plb|psb|pvb|||||||||||||||||||||||||||tcap||pwn|aso|imp|||acu|atc|acutc|air||fcdt|fxp|fxpl||xdp|xfdf|||||||||||||||age||ahead||azf|azs||azw||acc|ami|||apk||cii|fti|atx|||parquet||||||||mpkg|key|m3u8|numbers|pages|pkpass||swi|||||||iota|aep|fbx||||bmml||||||||||||mpm|||bmi|||rep|||||||||||cdxml||mmd||cdy||csl|cla|rp9|c4g|c4d|c4f|c4p|c4u|c11amc|c11amz|||||||||||||||||csp|cdbcmsg||cmc|clkx|clkk|clkp|clkt|clkw|wbs|||||pml||||ppd||||car|pcurl||||||||dart|rdz||||dbf|dcmp||uvf|uvvf|uvd|uvvd|uvt|uvvt|uvx|uvvx|uvz|uvvz|fe_launch||||dna||mlp||||dpg|dfac||kpxx||||ait|||||||||||||||||||svc||geo||||||mag||||||||||nml|||esf|msf|qam|slt|ssf||||es3|et3||||||||||||||||||||||||||||||ez2|ez3|||||fdf|mseed|seed|dataless||||||||gph|ftc||fm|frame|maker|book||fnc|ltf|fsc|||||oas|oa2|oa3|fg5|bh2|||ddd|xdw|xbd||||||fzs|||txd||||||||||||ggb||ggs|ggt|gex|gre|gxt|g2w|g3w||||gmx||||gdoc|gdraw||||gform||gjam||gmap||gslides|gscript||gsite|gsheet|||kml|kmz|||xdcf||gqf|gqs||gac|ghf|gim|grv|gtm|tpl|vcg||hal|zmm|hbci|||||les|hpgl|hpid|hps|jlt|pcl|pclxl|||sfd-hdstx|||||||mpy|afp|listafp|list3820|irm|sc|icc|icm||igl|||ivp|ivu|||||||||||||||igm|xpw|xpx|i2g|||qbo|qfx|||||||||||||rcprofile|irp|xpr|fcs||jam|||||||||rms|jisp|joda||ktz|ktr|karbon|chrt|kfo|flw|kon|kpr|kpt|ksp|kwd|kwt||htke|||kia|kne|knp|skp|skd|skt|skm|sse|||lasxml|||||lbd|lbe|||123|apr|pre|nsf|org|scm|lwp|portpkg||mvt||||||||mcd|||mc1|cdkey||||mwf|mfm||flo|igx||||mif|||daf|dis|mbk|mqy|msl|plc|txf||mpn|mpc|||||||||xul||cil||cab||xls|xlm|xla|xlc|xlt|xlw|xlam|xlsb|xlsm|xltm|eot|chm|ims|lrm||thmx||msg||cat|stl||ppt|pps|pot|ppam|pptm|sldm|ppsm|potm||||mpp|mpt||vdx|||||||||docm|dotm|wps|wks|wcm|wdb|wpl|xps||mseq||||||mus|msty|taglet||||bdo||||||||nlu||||ntf|nitf|nnd|nns|nnw|||||||||ac|ngdat|n-gage||||rpst|rpss|edm|edx|ext|||||||||||odc|otc|odb|odf|odft|odg|otg|odi|oti|odp|otp|ods|ots|odt|odm||ott|oth||||||||||||||||xo||||||||||||||||||||||||dd2|||||||||||||||||||||||||||obgx|||oxt||osm||||||||||||||||||pptx|||sldx||||ppsx|||||potx||||||||||||||||xlsx||||||xltx|||||||||docx||||||||||dotx|||||||||mgp||dp|esa||||pdb|pqa|oprc|||||paw||str|ei6||efif|wg|||plf|pbd||||||systemverify||box|brush|brushset|drm||mgz|||qps|ptid||xhtm||||qxd|qxt|qwd|qwt|qxl|qxb||||||||||||||||||||rar|bed|mxl|musicxml|||||cryptonote|cod|rm|rmvb|link66||||st||||||||||||||||see||sema|semd|semf||ifm|itp|iif|ipk||||||twd|twds||||mmf||teacher|||fo||sdkm|sdkd|dxp|sfs|sqlite|sqlite3||||sdc|sda|sdd|smf|sdw|vor|sgl|smzip|sm||wadl|sxc|stc|sxd|std|sxi|sti|sxm|sxw|sxg|stw||sus|susp|svd|||||sis|sisx|xsm|bdm|xdm|||ddf|||||tao|pcap|cap|dmp||||tmo||tpt|mxs|tra|||ufd|ufdl|||||utz|umj|unityweb|uoml|uo||||||||||||||||vcx||||||||||||vsd|vst|vss|vsw|vsdx|vtx|vis|||vsf|||||wbxml|wmlc|wmlsc||wtb||||||||||nbp||wpd|wqd||stf|||||xar||||xfdl||||||||hvd|hvs|hvp|osf|osfpvg||saf|spf||||cmp||zir|zirz|zaz|vxml||||||||wasm|wif||||wgt|hlp|||wsdl|wspolicy|7z|abw|ace||dmg|arj|aab|x32|u32|vox|aam|aas|bcpio|bdoc|torrent|blend|blb|blorb|bz|bz2|boz|cbr|cba|cbt|cbz|cb7|vcd|cfs|chat|pgn|crx|cco||rar|nsc|cpio|csh||deb|udeb|dgc|dir|dcr|dxr|cst|cct|cxt|w3d|fgd|swa|wad|ncx|dtb|res|dvi|evy|eva|bdf|||gsf||psf|pcf|snf|||pfa|pfb|pfm|afm||arc|spl|gca|ulx|gnumeric|gramps|gtar||hdf|php|install|ipynb|iso|key|numbers|pages|jardiff|jnlp||kdbx|latex|luac|lzh|lha|run|mie|prc|mobi||application|lnk|wmd|wmz|xbap|mdb|obd|crd|clp|exe|exe|dll|com|bat|msi|mvb|m13|m14|wmf|wmz|emf|emz|mny|pub|scd|trm|wri|nc|cdf|pac|nzb|pl|pm|prc|pdb|p12|pfx|p7b|spc|p7r||rar|rpm|ris|sea|sh|shar|swf|xap|sql|sit|sitx|srt|sv4cpio|sv4crc|t3|gam|tar|tcl|tk|tex|tfm|texinfo|texi|obj|ustar|hdd|ova|ovf|vbox|vbox-extpack|vdi|vhd|vmdk|src|webapp||der|crt|pem|||fig|xlf|xpi|xz|zip|z1|z2|z3|z4|z5|z6|z7|z8|||xaml|xav|xca|xdf|xel||xns|||xenc|xfdf|xhtml|xht||xlf|xml|xsl|xsd|rng|dtd||||xop|xpl|xsl|xslt|xspf|mxml|xhvml|xvml|xvm||yang|||||||yin|zip|lottie|||||3gpp||adts|aac||adp|amr||||||||au|snd|||||||||||||||||||||||||||||||||||||||||||||||||||||||||mka||||||mid|midi|kar|rmi||mxmf|mp3|m4a|mp4a|m4b||||mpga|mp2|mp2a|mp3|m2a|m3a|||oga|ogg|spx|opus|||||||||||||||s3m||sil|||||||||||||||||||||||||||||uva|uvva|eol||||||||||dra|dts|dtshd|||||lvp|pya|||ecelp4800|ecelp7470|ecelp9600|||||rip|||||||wav|wav|weba|aac|aif|aiff|aifc|caf|flac|m4a|mka|m3u|wax|wma|ram|ra|rmp|ra||wav|xm|cdx|cif|cmdf|cml|csml||xyz|ttc|otf||ttf|woff|woff2|exr|apng|avci|avcs|avif|bmp|dib|cgm|drle|dpx|emf|fits|g3|gif|heic|heics|heif|heifs|hej2|ief||jaii|jais|jls|jp2|jpg2|jpg|jpeg|jpe|jph|jhc|jpm|jpgm|jpx|jpf|jxl|jxr|jxra|jxrs|jxs|jxsc|jxsi|jxss|ktx|ktx2||jfif|png|btif|btf|pti||sgi|svg|svgz|t38|tif|tiff|tfx|psd|azv|facti|||uvi|uvvi|uvg|uvvg|djvu|djv|sub|dwg|dxf|fbs|fpx|fst|mmr|rlc||ico|||dds|mdi|wdp|npx|b16||||||tap|vtf|wbmp|xif|pcx|webp|wmf|3ds|dng|ras|cmx||fh|fhc|fh4|fh5|fh7|ico|jng|sid|bmp|pcx|pic|pct|pnm|pbm|pgm|ppm|rgb|tga||xbm||xpm|xwd||||disposition-notification|||u8msg|u8dsn|u8mdn|u8hdr||||||||eml|mime|mht|mhtml||||||wsc|3mf||gltf|glb|igs|iges|jt|msh|mesh|silo|mtl|obj|prc|step|stp|stpnc|p21|210|stpx|stpz|stpxz|stl|u3d|bary|cld|dae|dwf||gdl|||gtw||mts|ogex|x_b|x_t|pyo|pyox||vds|usda|usdz|bsp|vtu|wrl|vrml|x3db|x3dbz|x3db|x3dv|x3dvz|x3d|x3dz|x3dv||||||||||||||||||appcache|manifest|ics|ifb||coffee|litcoffee||||css|csv|||||||||||||html|htm|shtml|jade|js|mjs||jsx|less|md|markdown|mml|mdx||n3||||txt|text|conf|def|list|log|in|ini|||dsc||||||rtx|rtf||||sgml|sgm||shex|slim|slm|spdx||stylus|styl||tsv|t|tr|roff|man|me|ms|ttl||uri|uris|urls|vcard||||curl|dcurl|mcurl|scurl|||sub|||ged||fly|flx||gv|||3dml|spot|||||||||||jad||||||wml|wmls||vtt|wgsl|s|asm|c|cc|cxx|cpp|h|hh|dic|htc|f|for|f77|f90||hbs|java||lua|mkd|nfo|opml|org|p|pas|php|pde|sass|scss|etx|sfv|ymp|uu|vcs|vcf|xml||yaml|yml||3gp|3gpp||3g2||||||||||h261|h263|||h264|||||m4s|jpgv|||jpm|jpgm|||mkv|mk3d|mj2|mjp2|||ts|m2t|m2ts|mts|mp4|mp4v|mpg4||mpeg|mpg|mpe|m1v|m2v||||ogv|||qt|mov||||||||||||||uvh|uvvh|uvm|uvvm||uvp|uvvp|uvs|uvvs|uvv|uvvv||||dvb|fvt||||||||||mxu|m4u|pyv||||||||||||uvu|uvvu|viv||||webm|f4v|fli|flv|m4v|mkv|mk3d|mks|mng|asf|asx|vob|wm|wmv|wmx|wvx|avi|movie|smv|ice||","sep":"|"},{"f":"0application/1d-interleaved-parityfec|c3gpdash-qoe-report+xml|fp-ims+xml|hmbs-object-manifest+json|luser-service-descriptions+json|iedia-delivery-metrics-report+json|ghal+json|jforms+json|ca2l|das+zip|dce+cbor|gjson|f-groupcomm+cbor|gtrl+cbor|etivemessage|hity+json|dif+cbor|gjson|dlto-cdni+json|lfilter+json|iostmap+json|ofilter+json|hdirectory+json|hendpointcost+json|tparams+json|pprop+json|tparams+json|irror+json|hnetworkmap+json|rfilter+json|hpropmap+json|oparams+json|htips+json|lparams+json|hupdatestreamcontrol+json|tparams+json|dml|dndrew-inset|dppinstaller|flefile|gixware|fx|gbundle|dsyncapi+json|lyaml|dt+jwt|ef|fx|eom+xml|gcat+xml|gdeleted+xml|gicmail|gsvc+xml|esc-dwd+xml|iynamic-event-message|hheld+xml|hrdt+json|isat+xml|exml|duth-policy+xml|fomationml-aml+xml|sx+zip|cbacnet-xdd+zip|etch-smtp|ddoc|deep+xml|dufr|cc2pa|dalendar+json|lxml|fl-completion|fs-1840|eptive+json|dbor|g-seq|dccex|emp+xml|exml+xml|dda+xml|efx+xml|emi-capability|iontainer|hdomain|hobject|hqueue|eni|de+cbor|ea|f-2018+xml|ellml+xml|dfw|did|f-edhoc+cbor-seq|ety+json|l-seq|dlr|eue+xml|g_info+xml|dms|ew+cbor|hose|gjson|hws|dnrp+xml|doap-eap|hgroup+json|hpayload|emmonground|encise-problem-details+cbor|fference-info+xml|ese|g-key|k-set|hx509|dpl+xml|dsrattrs|eta+xml|gdata+xml|evm+json|du-seeme|dwl|f+json|gyaml|et|dybercash|cdart|esh+xml|g-patch+xml|gdelta|evmount+xml|dca-rft|ed|dec-dx|dialog-info+xml|ecom|h+json|ixml|ed|ei|et|dns|f+json|f-message|docbook+xml|ets+cbor|dpop+jwt|dskpp+xml|esc+der|hxml|dvcs|ceat+cwt|gjwt|f-bun+cbor|kjson|gucs+cbor|kjson|dcmascript|ddhoc+cbor-seq|ei-consent|gx12|ffact|dfi|dlm+json|gxml|dmergencycalldata.cap+xml|vomment+xml|wntrol+xml|udeviceinfo+xml|uecall.msd|ulegacyesn+json|uproviderinfo+xml|userviceinfo+xml|vubscriberinfo+xml|uveds+xml|ema+xml|eotionml+xml|dncaprtp|etity-statement+jwt|dpp+xml|eub+zip|dshop|dxi|epect-ct-report+json|flicit-registration-response+jwt|fress|cfastinfoset|gsoap|ddf|et+xml|dhir+json|hxml|dido.trusted-apps+json|ets|dlexfec|dont-sfnt|htdpfr|hwoff|dramework-attributes+xml|cgeo+json|k-seq|ffeed+csv|fpackage+sqlite3|gose+json|fxacml+json|lxml|dltf-buffer|dml+xml|dnap-binding-jws|sd|protation-jws|zwsd|dpx+xml|drib|dxf|dzip|ch224|deld+xml|djson|dl7v2+xml|dttp|dyperstudio|cibe-key-request+xml|gpkg-reply+xml|hp-data|dges|dm-iscomposing+xml|dndex|h.cmd|iobj|iresponse|ivnd|ekml+xml|l|dotp|dpfix|ep|dsup|dts+xml|cjava-archive|o|o|hserialized-object|hvm|gscript|df2feed+json|dose|g+json|drd+json|dscalendar+json|fontact+json|eon|g|g-patch+json|m-query+json|hseq|g5|gml+json|gpath|dwk+json|f-set+json|lwt|et|ckb+jwt|el+xml|dpml-request+xml|jsponse+xml|cld+json|dgr+xml|dink-format|gset|j+json|doad-control+xml|egout+jwt|est+xml|gsync+xml|dpf+zip|dxf|cmac-binhex40|gcompactpro|fwriteii|eds+xml|enifest+json|erc|gxml+xml|ethematica|n|n|gml+xml|i-content+xml|jpresentation+xml|dbms-associated-procedure-description+xml|hderegister+xml|henvelope+xml|hmsk+xml|k-response+xml|hprotection-description+xml|hreception-report+xml|jgister+xml|p-response+xml|hschedule+xml|huser-service-description+xml|eox|deasured-component+cbor|vjson|edia-policy-dataset+xml|h_control+xml|hservercontrol+xml|erge-patch+json|etalink+xml|k4+xml|fs+xml|df4|dikey|epc|essing-blocks+cbor-seq|dmt-aei+xml|gusd+xml|dods+xml|ess-keys|hsignature|gkey-data|krequest|dp21|g|e4|f|f|f|eeg4-generic|iiod|l-xmt|drb-consumer+xml|gpublish+xml|dsc-ivr+xml|gmixer+xml|eix|gbundle|eword|i|dud+json|eltipart-core|dxf|cn-quads|etriples|dasdata|dews-checkgroups|hgroupinfo|htransmission|dlsml+xml|dode|dss|coauth-authz-req+jwt|dblivious-dns-message|dcsp-request|jsponse|etet-stream|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|o|dda|em+xml|ex|debps-package+xml|dgg|dhttp-keys|dmdoc+xml|dnenote|j|j|j|j|j|dpc-nodeset+xml|dscore|dxps|cp21|f+zip|ep-overlay+xml|darityfec|essport|etch-ops-error+xml|ddf|ex|dem-certificate-chain|dgp-encrypted|gkeys|gsignature|p|dics-rules|edf+xml|g-diff+xml|dkcs10|h2|g7-mime|m|isignature|g8|h-encrypted|eix-attr-cert|hcert|irl|hpkipath|gcmp|dls+xml|doc-settings+xml|estscript|m|m|dpsp-tracker+json|drivate-token-issuer-directory|qrequest|ssponse|eoblem+json|kxml|ftobuf|k+json|fvenance+xml|gided-claims+jwt|es.alvestrand.titrax-sheet|gcww|hyn|ghpub+zip|gimplied-document+xml|oexecutable|oobject+json|z-seq|vyaml|ostructure|gmayfile|gnprend|gplucker|grdf-xml-crypt|gsclt|gvcfbzip2|gxsf+xml|dskc+xml|dvd+json|cqsig|craml+yaml|eptorfec|ddap+json|ef+xml|j|deginfo+xml|elax-ng-compact-syntax|emote-printing|eputon+json|esolve-response+jwt|gurce-lists+xml|q-diff+xml|dfc+xml|discos|dlmi+xml|es-services+xml|doute-apd+xml|is-tsid+xml|iusd+xml|dpki-checklist|hghostbusters|hmanifest|hpublication|hroa|hsigned-tal|hupdown|ds-metadata+xml|ed+xml|es+xml|dtf|eploopback|ex|csamlassertion+xml|gmetadata+xml|erif+json|h-external-properties+json|dbe|eml+xml|dcaip+xml|eim+json|ftt-receipt+cose|istatement+cose|evp-cv-request|msponse|hvp-request|msponse|dd-jwt|i+json|ef+json|ep|decevent+jwt|enml+cbor|ijson|ixml|h-etch+cbor|njson|jxi|fsml+cbor|jjson|jxml|i-exi|ep+xml|f-exi|ession-info|et-payment|n-initiation|gregistration|s-initiation|dgml|g-open-catalog|dhf+xml|dieve|h|emple-filter+xml|jmessage-summary|isymbolcontainer|epc|dlate|dmil|g+xml|k|epte336m|doap+fastinfoset|hxml|dparql-query|jresults+xml|edx+json|eirits-event+xml|dql|drgs|g+xml|eu+xml|dsdl+xml|elkeylogfile|eml+xml|dt2110-41|eix+json|eratum|duit-envelope+cose|hreport+cose|dwid+cbor|hxml|ctamp-apex-update|s-confirm|hcommunity-update|x-confirm|herror|hsequence-adjust|w-confirm|itatus-query|oresponse|hupdate|n-confirm|er|exii+json|dd+json|dei+xml|j|etra_isi|exinfo|dhraud+xml|dimestamp-query|mreply|led-data|dlsrpt+gzip|jjson|dm+json|dnauthlist|doc+cbor|eken-introspection+jwt|eml|drickle-ice-sdpfrag|fg|eust-chain+json|imark+jwt|m-delegation+jwt|nstatus-response+jwt|dtml+xml|dve-trigger|dzif|g-leap|cubjson|dccs+cbor|djcs+json|dlpfec|drc-grpsheet+xml|gressheet+xml|gtargetdesc+xml|guisocketdesc+xml|cvc|e+cose|fjwt|fsd-jwt|eard+json|ixml|dec+xml|f-package+gzip|ozip|emmi|dividence.scriptfile|dnd.1000minds.decision-model+xml|hob|g3gpp-prose+xml|q-pc3a+xml|vch+xml|uch+xml|t8+xml|lv2x-local-service-information|k.5gnas|nsa2x|r-local-service-information|ov2x|r-local-service-information|laccess-transfer-events+xml|lbsf+xml|lcrs+xml|murrent-location-discovery+xml|lgmop+xml|mtpc|linterworking-data|llpp|lmc-signalling-ear|ndata-affiliation-command+xml|sinfo+xml|smsgstore-ctrl-request+xml|spayload|sregroup+xml|sservice-config+xml|tignalling|sue-config+xml|tser-profile+xml|nptt-affiliation-command+xml|rfloor-request+xml|rinfo+xml|rlocation-info+xml|rmbms-usage-info+xml|rregroup+xml|rservice-config+xml|signed+xml|rue-config+xml|uinit-config+xml|sser-profile+xml|nvideo-affiliation-command+xml|tinfo+xml|tlocation-info+xml|tmbms-usage-info+xml|tregroup+xml|tservice-config+xml|ttransmission-request+xml|tue-config+xml|user-profile+xml|mid-call+xml|lngap|lpfcp|mic-bw-large|ssmall|svar|nnapp-info+xml|ls1ap|meal-app-comm-requirements-info+xml|qdata-delivery-info+cbor|zvery-info+xml|qgroup-doc+xml|qinfo+xml|qlocation-info+cbor|zinfo+xml|qmbms-usage-info+xml|ss-usage-info+xml|qnetwork-qos-management-info+xml|yresource-info+cbor|que-config-info+xml|rnicast-info+xml|rser-profile-info+xml|mms|o+xml|mrvcc-ext+xml|rinfo+xml|mtate-and-event-info+xml|lussd+xml|lv2x|mae-info+xml|k2.bcmcsinfo+xml|msms|mtcap|hlightssoftware.imagescal|hm.post-it-notes|gaccpac.simply.aso|uimp|im.addressxfer+json|kchatbot+json|iucobol|lrp|n|hdobe.air-application-installer-package+zip|mflash.movie|normscentral.fcdt|nxp|p|mpartial-upload|mxdp+xml|nfdf|hether.imp|hfpc.afplinedata|w-pagedef|lcmoca-cmresource|lfoca-charset|rodedfont|upage|lmodca|q-cmtable|rformdef|rmediummap|robjectcontainer|sverlay|rpagesegment|hge|hh-barcode|iead.space|hia|irzip.filesecure.azf|zzs|hmadeus+json|jzon.ebook|nmobi8-ebook|iericandynamics.acc|iiga.ami|iundsen.maze+xml|hndroid.ota|opackage-archive|iki|iser-web-certificate-issue-initiation|qfunds-transfer-initiation|itix.game-component|hpache.arrow.file|tstream|nparquet|nthrift.binary|ucompact|ujson|iexlang|ii+json|ilextor.warrp+json|iothekende.reservation+json|iple.installer+xml|mkeynote|mmpegurl|mnumbers|mpages|nkpass|hrastra.swi|iistanetworks.swi|itisan+json|jsquare|hs207960.vas.config+jer|z+uper|ttap+jer|xuper|itraea-software.iota|hudiograph|itodesk.fbx|kpackage|hvalon+json|iistar+xml|gbalsamiq.bmml+xml|rpr|inana-accounting|hbf.usp.error|omsg|r+json|hekitzur-stech+json|ilightsoft.lhzd+zip|vl+zip|hint.med-content|iopax.rdf+xml|hlink-idb-value-wrapper|iueice.multipass|ktooth.ep.oob|qle.oob|hmi|hpf|j3|husinessobjects|hyu.uapi+json|hzip3|gc3voc.schedule+xml|hab-jscript|inon-cpdl|mlips|ipasystems-pg+json|hel|indio.thinlinc.clientconf|jtury-systems.tcp_stream|hhemdraw+xml|jss-pgn|iipnuts.karaoke-mmd|hiedi|inderella|irpack.isdn-ext|itationstyles.style+xml|hlaymore|ioanto.rp9|jnk.c4group|t|t|t|t|iuetrust.cartomobile-config|zle-config-pkg|hncf.helm.chart.content.v1.tar+gzip|wprovenance.v1.prov|ronfig.v1+json|hoffeescript|illabio.xodocuments.document|zs.document-template|zs.presentation|zs.presentation-template|zs.spreadsheet|zs.spreadsheet-template|kection+json|q.doc+json|rnext+json|imicbook+zip|p-rar|jmerce-battelle|konspace|intact.cmsg|ireos.ignition+json|ismocaller|hrick.clicker|t.keyboard|upalette|utemplate|uwordbank|jticaltools.wbs+xml|iyptii.pipe+json|lo-shade-file|mmator.encrypted|svault|htc-posml|jt.ws+xml|hups-pdf|mostscript|mpd|lraster|nw|irl|k.car|lpcurl|hyan.dean.root+xml|ibank|iclonedx+json|qxml|gd2l.coursepackage1p0+zip|h3m-dataset|kproblem|hart|ita-vision.rdz|klog|kpackage+json|kresource+json|hbf|hcmp+xml|hebian.binary-package|ice.data|p|p|p|lttml+xml|t|lunspecified|w|lzip|o|inovo.fcselayout-link|ismume.movie|hir-bi.plate-dl-nosuffix|hm.delegation+xml|hna|hocument+json|ilby.mlp|nobile.1|t2|iremir.scorecloud-binary-document|hpgraph|hreamfactory|iive+json|hs-keypoint|htg.local|p.flash|qhtml|hvb.ait|kdvbisl+xml|nj|kesgcontainer|kipdcdftnotifaccess|oesgaccess|x2|rpdd|oroaming|mtv.alfec-base|venhancement|knotif-aggregate-root+xml|qcontainer+xml|qgeneric+xml|qia-msglist+xml|tregistration-request+xml|zration-response+xml|rnit+xml|kpfr|kservice|hxr|hynageo|hzr|geasykaraoke.cdgdownload|hcdis-update|iip.rlp|ilipse.ditto+json|iowin.chart|nfilerequest|rupdate|nseries|trequest|tupdate|hfi.img|lso|hln+zip|hmclient.accessrequest+xml|hnliven|iphase.envoy|hprints.data+xml|ison.esf|mmsf|mquickanime|msalt|nsf|hricsson.quickcall|iofs|hspass-espass+zip|izigno3+xml|s|htsi.aoc+xml|msic-e+zip|qs+zip|lcug+xml|liptvcommand+xml|pdiscovery+xml|pprofile+xml|psad-bc+xml|tcod+xml|tnpvr+xml|qervice+xml|qync+xml|pueprofile+xml|lmcid+xml|mheg5|loverload-control-policy-dataset+xml|lpstn+xml|lsci+xml|mimservs+xml|ltimestamp-token|msl+xml|o.der|hu.kasparian.car+json|idora.data|hvolv.ecig.profile|rsettings|rtheme|hxstream-empower+zip|ppackage|hzpix-album|mpackage|gf-secure.mobile|haf+yaml|imilysearch.gedcom+zip|istcopy-disk-image|hdf|isn.mseed|lseed|p|mtationxml+xml|hfsns|hgb|hiclab.flb+zip|ilmit.zfc|ints|iremonkeys.cloudcell|hlographit|iuxtime.clip|hont-fontforge-sfd|hramemaker|q|q|q|ieelog.comic|iogans.fnc|oltf|hsc.weblaunch|hujifilm.fb.docuworks|zks.binder|zks.container|sjfi+xml|ktsu.oasys|t2|t3|tgp|tprs|kxerox.art-ex|t4|qddd|rocuworks|z.binder|z.container|qhbpl|it-misnet|join+cbor|njson|izzysheet|gg3pix.g3fc|ha4gh.passport+jwt|henomatix.tuxedo|kzip|jtics.grd+json|koo.catmetadata+xml|nebuild|oclass|ngpkg|nmanifest|npkgmetadata+xml|nxpak|io+json|jcube+xml|jgebra.file|ppinboard|pslides|ptool|jmetry-explorer|x|jnext|jplan|jspace|irber|hlobalplatform.card-content-mgt|z-content-mgt-response|hmx|hnu.taler.exchange+json|qmerchant+json|hoogle-apps.audio|sdocument|trawing|uive-sdk|sfile|tolder|urm|tusiontable|sjam|smail-layout|up|sphoto|tresentation|sscript|thortcut|tite|tpreadsheet|sunknown|svideo|nearth.kml+xml|vz|iv.sk.e-form+xml|uzip|nxmldatacontainer+xml|hpxsee.map+xml|hrafeq|m|iidmp|ioove-account|nhelp|nidentity-message|onjector|ntool-message|stemplate|nvcard|ghal+json|kxml|indheld-entertainment+xml|hbci|hc+json|il-bireports|hdt|heroku+json|hhe.lesson-player|hp-hpgl|lid|ls|jjlyt|jpcl|mxl|hsl|httphone|hydrostatix.sof-data|iper+json|l-item+json|ldrive+json|hzn-3d-crossword|gibm.afplinedata|kelectronic-media|kminipay|lodcap|q|q|krights-management|ksecure-container|hccprofile|q|heee.1905|hgloader|hmagemeter.folder+zip|rimage+zip|imervision-ivp|uu|is.imsccv1p1|s2|s3|klis.v2.result+json|lti.v2.toolconsumerprofile+json|vproxy+json|zy.id+json|vsettings+json|zings.simple+json|hnformedcontrol.rms+xml|mix-visionary|ktech.project|w+xml|inopath.wamp.notification|isors.igm|itercon.formnet|w|lgeo|ltrust.digibox|rnncp|ju.qbo|mfx|hpfs.ipns-record|ild.car|ldag-cbor|pjson|lraw|itc.g2.catalogitem+xml|ponceptitem+xml|oknowledgeitem+xml|onewsitem+xml|smessage+xml|opackageitem+xml|planningitem+xml|iunplugged.rcprofile|hrepository.package+xml|hs-xpr|iac.fcs|io11783-10+zip|gjam|ipannet-directory-service|pjpnstore-wakeup|ppayment-wakeup|pregistration|zon-wakeup|psetstore-wakeup|pverification|zon-wakeup|hcp.javame.midlet-rms|hisp|hoost.joda-archive|hsk.isdn-ngn|gkahootz|n|hde.karbon|lchart|lformula|livio|lontour|lpresenter|u|lspread|lword|p|il|henameaapp|iyman.kmp+zip|px|hidspiration|inar|l|hoan|k|k|k|idak-descriptor|glas|j.las+json|oxml|jzip|hdev.productlicensing|heap+json|hiberty-request+xml|hlamagraphics.life-balance.desktop|zbalance.exchange+xml|hogipipe.circuit+zip|iom|itus-1-2-3|mapproach|mfreelance|mnotes|morganizer|mscreencam|mwordpro|gmacports.portpkg|iml|ipbox-vector-tile|irlin.drm.actiontoken+xml|rconftoken+xml|rlicense+xml|rmdcf|ison+json|ixar.archive.3tz+zip|jmind.maxmind-db|hcd|hdl|j-mbsdf|hedcalcdata|jiastation.cdkey|kcalholodeck.recordxr|iridian-slingshot|jmaid|hfer|imp|hicro+json|lgrafx.flo|rigx|lsoft.portable-executable|qwindows.thumbnail-cache|iele+json|if|inisoft-hp3000-save|itsubishi.misty-guard.trustweb|hobius.daf|ois|nmbk|oqy|osl|nplc|ntxf|idl|iphun.application|ncertificate|itorola.flexsuite|y.adsi|zfis|zgotap|zkmr|zttc|zwem|piprm|izilla.xul+xml|hs-3mfdocument|jartgalry|ksf|jcab-compressed|kolor.iccprofile|jexcel|o|o|o|o|o|o.addin.macroenabled.12|psheet.binary.macroenabled.12|vmacroenabled.12|ptemplate.macroenabled.12|jfontobject|jhtmlhelp|jims|jlrm|joffice.activex+xml|ptheme|kpentype|kutlook|jpackage.obfuscated-opentype|kki.seccat|otl|klayready.initiator+xml|kowerpoint|t|t|t.addin.macroenabled.12|upresentation.macroenabled.12|uslide.macroenabled.12|zshow.macroenabled.12|utemplate.macroenabled.12|krintdevicecapabilities+xml|oing.printticket+xml|oschematicket+xml|loject|q|jtnef|jvisio.viewer|jwindows.devicepairing|rnwprinting.oob|rprinterpairing|rwsd.oob|kmdrm.lic-chlg-req|tresp|pmeter-chlg-req|vresp|kord.document.macroenabled.12|otemplate.macroenabled.12|mks|o|o|o|kpl|jxpsdocument|ia-disk-image|ieq|igpack|iign|hultiad.creator|v.cif|isic-niff|lian|ivee.style|hynfc|gnacamar.ybrid+json|ito.bindingdataobject+cbor|zect+json|zect+xml|lopenxmlformats-package.iepd+zip|hcd.control|kreference|hearst.inv+json|ibumind.line|irvana|itfpx|iurolanguage.nlu|himn|intendo.nitro.rom|psnes.rom|itf|k|hoblenet-directory|psealer|pweb|ikia.catalogs|nonml+wbxml|sxml|miptv.config+xml|nsds-radio-presets|mlandmark+wbxml|vxml|ucollection+xml|mn-gage.ac+xml|tdata|tsymbian.install|ncd|mpcd+wbxml|qxml|mradio-preset|ys|ivadigm.edm|rx|qxt|htt-local.content-share|qfile-transfer|qogw_remote-access|qsip-ta_remote|xtcp_stream|hubaltec.nudoku-game|goai.workflows|t+json|uyaml|isis.opendocument.base|zchart|zchart-template|zdatabase|zformula|zformula-template|zgraphics|zgraphics-template|zimage|zimage-template|zpresentation|zpresentation-template|zspreadsheet|zspreadsheet-template|ztext|ztext-master|ztext-master-template|ztext-template|ztext-web|hbn|hcf+cbor|ii.image.manifest.v1+json|hftn.l10n+json|hipf.contentaccessdownload+xml|ystreaming+xml|mspg-hexbinary|ldae.svg+xml|pxhtml+xml|lmippvcontrolmessage+xml|lpae.gem|lspdiscovery+xml|olist+xml|lueprofile+xml|mserprofile+xml|hlpc-sugar|hma-scws-config|phttp-request|wsponse|j.bcast.associated-procedure-parameter+xml|qdrm-trigger+xml|qimd+xml|qltkm|qnotification+xml|qprovisioningtrigger|qsgboot|sdd+xml|tu|rimple-symbol-container|rmartcard-trigger+xml|rprov+xml|rtkm|kcab-address-book+xml|ofeature-handler+xml|opcc+xml|osubs-invite+xml|ouser-prefs+xml|kdcd|nc|ld2+xml|lrm.risd+xml|kgroup-usage-list+xml|klwm2m+cbor|qjson|qtlv|kpal+xml|loc.detailed-progress-report+xml|ofinal-report+xml|ogroups+xml|oinvocation-descriptor+xml|ooptimized-progress-report+xml|lush|kscidm.messages+xml|kxcap-directory+xml|jds-email+xml|mfile+xml|nolder+xml|jloc-supl-init|is.cellular-cose-content+cbor|hnepager|otamp|rx|qt|rp|rx|ivif.metadata|hpenblox.game+xml|t-binary|keye.oeb|kofficeorg.extension|kprinttag|kstreetmap.data+xml|ktimestamps.ots|kvpi.dspx+json|kxmlformats-officedocument.custom-properties+xml|zcedocument.customxmlproperties+xml|zcedocument.drawing+xml|zcedocument.drawingml.chart+xml|zcedocument.drawingml.chartshapes+xml|zcedocument.drawingml.diagramcolors+xml|zcedocument.drawingml.diagramdata+xml|zcedocument.drawingml.diagramlayout+xml|zcedocument.drawingml.diagramstyle+xml|zcedocument.extended-properties+xml|zcedocument.presentationml.commentauthors+xml|zcedocument.presentationml.comments+xml|zcedocument.presentationml.handoutmaster+xml|zcedocument.presentationml.notesmaster+xml|zcedocument.presentationml.notesslide+xml|zcedocument.presentationml.presentation|zcedocument.presentationml.presentation.main+xml|zcedocument.presentationml.presprops+xml|zcedocument.presentationml.slide|zcedocument.presentationml.slide+xml|zcedocument.presentationml.slidelayout+xml|zcedocument.presentationml.slidemaster+xml|zcedocument.presentationml.slideshow|zcedocument.presentationml.slideshow.main+xml|zcedocument.presentationml.slideupdateinfo+xml|zcedocument.presentationml.tablestyles+xml|zcedocument.presentationml.tags+xml|zcedocument.presentationml.template|zcedocument.presentationml.template.main+xml|zcedocument.presentationml.viewprops+xml|zcedocument.spreadsheetml.calcchain+xml|zcedocument.spreadsheetml.chartsheet+xml|zcedocument.spreadsheetml.comments+xml|zcedocument.spreadsheetml.connections+xml|zcedocument.spreadsheetml.dialogsheet+xml|zcedocument.spreadsheetml.externallink+xml|zcedocument.spreadsheetml.pivotcachedefinition+xml|zcedocument.spreadsheetml.pivotcacherecords+xml|zcedocument.spreadsheetml.pivottable+xml|zcedocument.spreadsheetml.querytable+xml|zcedocument.spreadsheetml.revisionheaders+xml|zcedocument.spreadsheetml.revisionlog+xml|zcedocument.spreadsheetml.sharedstrings+xml|zcedocument.spreadsheetml.sheet|zcedocument.spreadsheetml.sheet.main+xml|zcedocument.spreadsheetml.sheetmetadata+xml|zcedocument.spreadsheetml.styles+xml|zcedocument.spreadsheetml.table+xml|zcedocument.spreadsheetml.tablesinglecells+xml|zcedocument.spreadsheetml.template|zcedocument.spreadsheetml.template.main+xml|zcedocument.spreadsheetml.usernames+xml|zcedocument.spreadsheetml.volatiledependencies+xml|zcedocument.spreadsheetml.worksheet+xml|zcedocument.theme+xml|zcedocument.themeoverride+xml|zcedocument.vmldrawing|zcedocument.wordprocessingml.comments+xml|zcedocument.wordprocessingml.document|zcedocument.wordprocessingml.document.glossary+xml|zcedocument.wordprocessingml.document.main+xml|zcedocument.wordprocessingml.endnotes+xml|zcedocument.wordprocessingml.fonttable+xml|zcedocument.wordprocessingml.footer+xml|zcedocument.wordprocessingml.footnotes+xml|zcedocument.wordprocessingml.numbering+xml|zcedocument.wordprocessingml.settings+xml|zcedocument.wordprocessingml.styles+xml|zcedocument.wordprocessingml.template|zcedocument.wordprocessingml.template.main+xml|zcedocument.wordprocessingml.websettings+xml|vpackage.core-properties+xml|zage.digital-signature-xmlsignature+xml|zage.relationships+xml|hracle.resource+json|jnge.indata|hsa.netdeploy|igeo.mapguide.package|ji.bundle|ldp|lsubsystem|htps.ct-kip+xml|hxli.countgraph|gpagerduty+json|ilm|k|k|inoply|ios.xml|itentdive|jientecommsdoc|iwaafile|hcos|hg.format|josasli|hiaccess.application-licence|icsel|hmi.widget|itiles|hoc.group-advertisement+xml|jketlearn|iwerbuilder6|t-s|s7|t-s|t5|u-s|hp.systemverify+xml|hreminet|jviewsystems.box|iocreate.brush|vset|qdream|jject-graph|jteus.magazine|hsfs|ht.mundusmundi|hublishare-delta-tree|hvi.ptid1|hwg-multiplexed|kxhtml-print+xml|hyon+json|gqualcomm.brew-app-res|jrantainenet|kk.quarkxpress|x|x|x|x|x|iobject-quoxdocument|gr74n.sandboxels+json|hadisys.moml+xml|psml+xml|s-audit+xml|y-conf+xml|zconn+xml|zdialog+xml|zstream+xml|tconf+xml|tdialog+xml|z-base+xml|z-fax-detect+xml|z-fax-sendrecv+xml|z-group+xml|z-speech+xml|z-transform+xml|iinstor.data|ipid|ir|healvnc.bed|icordare.musicxml|y+xml|ilpipe|inlearn.rlprint|isilient.logic|jtful+json|hig.cryptonote|im.cod|hn-realmedia|s-vbr|houte66.link66+xml|hs-274x|huckus.download|gs3sms|hailingtracker.track|ir|hbm.cid|kmid2|hcribus|healed.3df|ncsf|ndoc|neml|nmht|nnet|nppt|ntiff|nxls|mmedia.softseal.html|zl.pdf|iemail|iis+json|ima|jd|jf|hhade-save-file|jna.informed.formdata|ztemplate|vinterchange|vpackage|iootproof+json|jpkick+json|ip|ix|higrok.session|imtech-mindmapper|y|iren+json|jtx.vmv0|hketchometry|hmaf|jrt.notebook|mteacher|iintio.portals.archive|hnesdev-page-table|hoftware602.filler.form+xml|zform-xml-zip|ilent.sdkm+xml|v|hpotfire.dxp|psfs|hqlite3|n|hss-cod|kdtf|kntf|htardivision.calc|tdraw|timpress|tmath|twriter|z|z-global|iepmania.package|qstepchart|ireet-stream|hun.wadl+xml|kxml.calc|s.template|odraw|s.template|oimpress|v.template|omath|owriter|u.global|vtemplate|iperfile.super|is-calendar|s|hvd|hwiftview-ics|hybyl.mol2|icle+xml|ift+json|imbian.install|v|incml+xml|m.dm+wbxml|qxml|p.notification|pddf+wbxml|txml|ptnds+wbxml|uxml|os.notification|gtableschema+json|io.intent-module-archive|hcpdump.pcap|s|s|hhink-cell.ppttc+json|hmd.mediaflex.api+xml|il|iobile-livetv|hri.onesource|jd.tpt|jscape.mxs|iueapp|kdoc|gubisoft.webplayer|hfdl|k|hic.dosipas.v1|t2|kosdm+json|ktlb-fcb|iq.theme|hmajin|hnity|homl+xml|o|hplanet.alert|t-wbxml|obearer-choice|zce-wbxml|ocacheop|v-wbxml|phannel|v-wbxml|olist|s-wbxml|scmd|v-wbxml|osignal|hri-map|gvalve.source.material|hcx|hd-study|hectorworks|il+json|iraison.tsm-report+cbor|z+json|jifier-attestation+jwt|kmatrix.vcas|ktone.aion+json|jyant.thin|is.encrypted|hidsoft.vidconference|isio|l|l|l|l|l|lnary|ividence.scriptfile|hocalshaper.vsp4|hsf|huq|gwantverse|ip.sic|llc|kwbxml|lmlc|nscriptc|ismflow.wafl|hebturbo|hfa.dpp|kp2p|kwsc|hindows.devicepairing|hmap|ic|if.bootstrap|holfram.mathematica|z.package|oplayer|irdlift|kperfect|hqd|hrq-hp3000-labelled|ht.stf|hv.csp+wbxml|nxml|jssp+xml|gxacml+json|ira|jin.cpj|hcdn|hecrets-encrypted|hfdl|k.webform|hmi+xml|ipie.cpkg|mdpkg|mplan|npkg|mxlim|gyamaha.hv-dic|qscript|qvoice|nopenscoreformat|zmat.osfpvg+xml|nremote-setup|nsmaf-audio|sphrase|nthrough-ngn|ounnel-udpencap|ioweme|hellowriver-custom-menu|gzoho-presentation.show|hul|j|hzazz.deck+xml|doicexml+xml|eucher-cms+json|kjws+json|dp|e+cose|fjwt|fsd-jwt|dq-rtcpxr|cwasm|etcherinfo+xml|debpush-options+json|dhoispp-query|kresponse|didget|enhlp|eta|dordperfect5.1|dsdl+xml|epolicy+xml|cx-7z-compressed|eabiword|fce-compressed|fmf|fpple-diskimage|frj|futhorware-bin|s|s|s|pmap|pseg|ebcpio|fdoc|fittorrent|flender|gorb|j|fzip|i2|j|ecbr|h|h|h|h|fdlink|ffs-compressed|fhat|gess-pgn|grome-extension|focoa|gmpress|med|gnference|fpio|fsh|edeb|hian-package|s|fgc-compressed|firector|m|m|m|m|m|m|m|m|foom|ftbncx+xml|hook+xml|hresource+xml|fvi|eenvoy|fva|efont-bdf|jdos|jframemaker|jghostscript|jlibgrx|lnux-psf|jpcf|jsnf|kpeedo|kunos-news|jtype1|o|o|o|jvfont|freearc|futuresplash|egca-compressed|flulx|fnumeric|framps-xml|ftar|fzip|ehdf|fttpd-php|einstall-instructions|fpynb+json|fso9660-image|fwork-keynote-sffkey|knumbers-sffnumbers|kpages-sffpages|ejava-archive-diff|jjnlp-file|iscript|ekeepass2|elatex|fua-bytecode|fzh-compressed|s|emakeself|fie|fobipocket-ebook|u|fpegurl|fs-application|hshortcut|hwmd|jz|hxbap|gaccess|gbinder|gcardfile|hlip|gdos-program|iwnload|o|o|o|o|gmediaview|p|p|itafile|o|o|o|honey|gpublisher|gschedule|gterminal|gwrite|enetcdf|k|fs-proxy-autoconfig|fzb|eperl|i|filot|j|fkcs12|k|i7-certificates|w|oreqresp|gi-message|erar-compressed|fedhat-package-manager|gsearch-info-systems|esea|fh|gar|gockwave-flash|filverlight-app|fql|ftuffit|lx|fubrip|fv4cpio|irc|et3vm-image|fads|gr|fcl|h|fex|h-tfm|hinfo|l|fgif|eustar|evirtualbox-hdd|pova|rf|pvbox|t-extpack|qdi|qhd|qmdk|ewais-source|feb-app-manifest+json|fww-form-urlencoded|ex509-ca-cert|q|q|mra-cert|jnext-ca-cert|ffig|fliff+xml|fpinstall|fz|ezip-compressed|fmachine|m|m|m|m|m|m|m|d400-bp|dacml+xml|eml+xml|dcap-att+xml|hcaps+xml|hdiff+xml|hel+xml|irror+xml|hns+xml|eon-conference-info+xml|w-diff+xml|denc+xml|dfdf|dhtml+xml|l|h-voice+xml|dliff+xml|dml|f|f|f|f-dtd|gexternal-parsed-entity|gpatch+xml|epp+xml|dop+xml|dproc+xml|dslt+xml|k|epf+xml|dv+xml|i|i|i|cyaml|eng|g-data+cbor|mjson|mxml|hpatch+json|nxml|hsid+json|din+xml|czip|f+dotlottie|dlib|dstd|1udio/1d-interleaved-parityfec|632kadpcm|7gpp|a2|6aac|9|7c3|7dpcm|7mr|9-wb|c+|7ptx|7sc|7trac-advanced-lossless|cx|b3|6basic|b|7v16|832|6clearmode|7n|6dat12|7ls|7sr-es201108|e2050|f211|h2|7v|8i4|6eac3|7ncaprtp|7vrc|a-qcp|a0|a1|ab|b0|b1|anw|c0|c1|awb|c0|c1|8s|6flac|8exfec|7wdred|6g711-0|99|822|a1|93|96-16|b24|b32|b40|98|99|a1|ad|ae|7sm|9-efr|ahr-08|6ilbc|7p-mr_v2.5|7sac|6l16|720|84|78|7pc|6matroska|7elp|a1200|a2400|a600|7has|7idi|a|a|a|a-clip|7obile-xmf|7p3|84|9|9|9a-latm|8a|9-robust|8eg|a|a|a|a|a|a4-generic|7usepack|6ogg|9|9|9|7pus|6parityfec|7cma|a-wb|9u|a-wb|7rs.sid|6qcelp|6raptorfec|7ed|7tp-enc-aescm128|amidi|9loopback|8x|6s3m|7cip|7ilk|7mv|9-qcp|90|7ofa|8undfont|7p-midi|8eex|6t140c|738|7elephone-event|8tra_acelp|h_bb|7one|7svcis|6uemclip|7lpfec|7sac|6vdvi|7mr-wb|7nd.3gpp.iufp|a4sb|aaudiokoz|ablockfact.facta|acelp|bisco.nse|bmles.radio-events|bns.anp1|einf1|adece.audio|k|bigital-winds|blna.adts|bolby.heaac.1|m2|gmlp|hps|gpl2|jx|jz|hulse.1|bra|bts|d.hd|euhd|bvb.file|aeverad.plj|ahns.audio|alucent.voice|ams-playready.media.pya|anokia.mobile-xmf|crtel.vbk|buera.ecelp4800|l7470|l9600|aoctel.sbc|apresonus.multitrack|aqcelp|arhetorex.32kadpcm|bip|bn-realaudio|asealedmedia.softseal.mpeg|avmx.cvsd|awave|7orbis|c-config|6wav|9e|7ebm|6x-aac|9iff|c|c|8caf|8flac|8m4a|9atroska|9pegurl|9s-wax|cma|8pn-realaudio|k|k-plugin|8realaudio|8tta|8wav|7m|0chemical/x-cdx|cif|cmdf|dl|csml|bpdb|bxyz|0font/collection|5otf|5sfnt|5ttf|5woff|92|0image/aces|7png|7vci|9s|8if|6bmp|9|6cgm|6dicom-rle|7px|6emf|6fits|6g3fax|7if|6heic|a-sequence|9f|a-sequence|8j2k|6ief|6j2c|7aii|9s|7ls|7p2|9|8eg|a|a|8h|9c|8m|9|8x|9|7xl|8r|9a|9s|8s|9c|9i|9s|6ktx|92|6naplps|6pjpeg|7ng|7rs.btif|e|apti|7wg-raster|6sgi|7vg+xml|d|6t38|7iff|a|a-fx|6vnd.adobe.photoshop|birzip.accelerator.azv|ablockfact.facti|aclip|bns.inf2|adece.graphic|m|m|m|bjvu|e|bvb.subtitle|bwg|bxf|afastbidsheet|bpx|bst|bujixerox.edmics-mmr|rrlc|aglobalgraphics.pgb|amicrosoft.icon|cx|bozilla.apng|bs-dds|dmodi|dphoto|anet-fpx|apco.b16|aradiance|asealed.png|gmedia.softseal.gif|vjpg|bvf|atencent.tap|avalve.source.texture|awap.wbmp|axiff|azbrush.pcx|6webp|7mf|6x-3ds|8adobe-dng|8cmu-raster|ax|8emf|8freehand|g|g|g|g|8icon|8jng|8mrsid-image|9s-bmp|8pcx|9ict|c|9ortable-anymap|hbitmap|hgraymap|hpixmap|8rgb|8tga|8wmf|8xbitmap|9cf|9pixmap|9windowdump|0message/bhttp|8cpim|8delivery-status|9isposition-notification|8external-body|8feedback-report|8global|e-delivery-status|gisposition-notification|fheaders|8http|8imdn+xml|8mls|8news|8ohttp-req|gs|8partial|8rfc822|e|e|e|8s-http|9ip|bfrag|8tracking-status|8vnd.si.simp|cwfa.wsc|1odel/3mf|6e57|6gltf+json|a-binary|6iges|a|6jt|6mesh|a|a|7tl|6obj|6prc|6step|a|a|a|a|a+xml|bzip|a-xml+zip|8l|6u3d|6vnd.bary|acld|bollada+xml|adwf|aflatland.3dml|agdl|bs-gdl|c.gdl|btw|amoml+xml|bts|aopengex|aparasolid.transmit.binary|ttext|bytha.pyox|k|arosette.annotated-data-model|asap.vds|ausda|dz+zip|avalve.source.compiled-map|btu|7rml|a|6x3d+binary|g|afastinfoset|avrml|e|axml|d|9-vrml|1ultipart/alternative|bppledouble|abyteranges|adigest|aencrypted|aform-data|aheader-set|amixed|bultilingual|aparallel|arelated|cport|asigned|avnd.bint.med-plus|boice-message|ax-mixed-replace|0text/1d-interleaved-parityfec|5cache-manifest|j|7lendar|d|6md|6offeescript|h|6ql|8-expression|9identifier|6ss|7v|8-schema|5directory|6ns|5ecmascript|6ncaprtp|7riched|5fhirpath|6lexfec|6wdred|5gff3|6rammar-ref-list|5hl7v2|6tml|9|9|5jade|7vascript|f|6cr-cnd|6sx|5less|5markdown|d|7thml|6dx|6izar|5n3|5org|5parameters|8ityfec|6lain|a|a|a|a|a|a|a|6rovenance-notation|7s.fallenstein.rst|9lines.tag|9prop.logic|9texi|5raptorfec|6ed|6fc822-headers|6ichtext|6tf|7p-enc-aescm128|8loopback|7x|5sgml|9|6haclc|7ex|6lim|9|6pdx|6trings|7ylus|b|5t140|6ab-separated-values|6roff|a|a|a|a|a|6urtle|5ulpfec|6ri-list|d|d|5vcard|6nd.a|abc|ascii-art|9curl|d.dcurl|emcurl|escurl|9debian.copyright|amclientscript|avb.subtitle|9esmertec.theme-descriptor|axchangeable|9familysearch.gedcom|aiclab.flt|aly|ami.flexstor|9gml|araphviz|9hans|agl|9in3d.3dml|espot|aptc.newsml|fitf|9latex-z|9motorola.reflex|as-mediapackage|9net2phone.commcenter.command|9radisys.msml-basic-layout|9senx.warpscript|ai.uricatalogue|aosi|aun.j2me.app-descriptor|9trolltech.linguist|aypst|9vcf|9wap.si|el|dwml|gscript|9zoo.kcl|6tt|5wgsl|5x-asm|a|7c|8|8|8|8|8|8|8omponent|7fortran|e|e|e|7gwt-rpc|7handlebars-template|7java-source|8query-tmpl|7lua|7markdown|7nfo|7opml|8rg|7pascal|d|8hp|8rocessing|7sass|8css|8etext|8fv|8use-ymp|7uuencode|7vcalendar|ard|6ml|8-external-parsed-entity|5yaml|9|0video/1d-interleaved-parityfec|63gpp|a|a-tt|a2|6av1|6bmpeg|7t656|6celb|6dv|6encaprtp|7vc|6ffv1|7lexfec|6h261|93|a-1998|b2000|94|a-rcdo|bsvc|95|96|6iso.segment|6jpeg|a2000|e-scl|8m|9|7xsv|6lottie+json|6matroska|e-3d|7j2|9|7p1s|82p|9t|a|a|a|84|9|9|9v-es|8eg|a|a|a|a|a4-generic|8v|6nv|6ogg|6parityfec|7ointer|6quicktime|f|6raptorfec|8w|7tp-enc-aescm128|9loopback|8x|6scip|7mpte291|d2m|6ulpfec|6vc1|82|7nd.blockfact.factv|acctv|adece.hd|h|fmobile|l|gp4|fpd|h|fsd|h|fvideo|k|birectv.mpeg|m-tts|blna.mpeg-tts|bvb.file|afvt|ahns.video|aiptvforum.1dparityfec-1010|w2005|k2dparityfec-1010|w2005|kttsavc|nmpeg2|amotorola.video|op|bpegurl|h|bs-playready.media.pyv|anokia.interleaved-multimedia|gmp4vr|gvideovoip|aobjectvideo|aplanar|aradgamettools.bink|osmacker|asealed.mpeg1|l4|hswf|gmedia.softseal.mov|auvvu.mp4|i|avivo|ayoutube.yt|7p8|89|6webm|6x-f4v|9li|av|8m4v|9atroska|g|g|9ng|9s-asf|e|bvob|bwm|dv|dx|cvx|avideo|8sgi-movie|9mv|0x-conference/x-cooltalk|2shader/x-fragment|bvertex","sep":"|"}]}]);
const COLONY = [
{"id":"n-8120ced9","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-ca6046a6","guard":[["hasAny",["element","extension","item number","nth","position"]],["not",["has","of"]]],"pyramid":["render.str",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-bab0231a","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-c87adb74","guard":[["hasAny",["element","extension","invert case","item number","nth","position","swap case","toggle case"]],["not",["has","of"]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-e7e65023","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","extension","item number","nth","position","title case"]],["not",["has","of"]]],"pyramid":["render.str",["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-f7a73032","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-200825cf","guard":[["hasAny",["element","extension","item number","nth","position"]],["not",["has","of"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," files."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-32c7a6ab","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," files."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-6e200262","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type image/vnd.fastbidsheet use":"The media type image/vnd.fastbidsheet uses .fbs files.","give the extension for application/vnd.yamaha.openscoreformat files":"The media type application/vnd.yamaha.openscoreformat uses .osf files.","what file extension does the media type application/x-cdlink use":"The media type application/x-cdlink uses .vcd files.","give the extension for application/vnd.osgi.subsystem files":"The media type application/vnd.osgi.subsystem uses .esa files.","which extension goes with the MIME type application/vnd.ms-powerpoint.addin.macroenabled.12":"The media type application/vnd.ms-powerpoint.addin.macroenabled.12 uses .ppam files.","what file extension does the media type application/x-ms-shortcut use":"The media type application/x-ms-shortcut uses .lnk files.","which extension goes with the MIME type application/vnd.denovo.fcselayout-link":"The media type application/vnd.denovo.fcselayout-link uses .fe_launch files.","which extension goes with the MIME type application/calendar+xml":"The media type application/calendar+xml uses .xcs files.","what file extension does the media type application/vnd.stardivision.calc use":"The media type application/vnd.stardivision.calc uses .sdc files.","give the extension for application/vnd.openblox.game+xml files":"The media type application/vnd.openblox.game+xml uses .obgx files.","which extension goes with the MIME type text/vnd.fmi.flexstor":"The media type text/vnd.fmi.flexstor uses .flx files.","what file extension does the media type application/vnd.proteus.magazine use":"The media type application/vnd.proteus.magazine uses .mgz files.","which extension goes with the MIME type application/x-wais-source":"The media type application/x-wais-source uses .src files.","what file extension does the media type application/vnd.oasis.opendocument.formula-template use":"The media type application/vnd.oasis.opendocument.formula-template uses .odft files.","give the extension for application/vnd.openxmlformats-officedocument.wordprocessingml.document files":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx files.","what file extension does the media type application/p2p-overlay+xml use":"The media type application/p2p-overlay+xml uses .relo files.","what file extension does the media type application/vnd.openxmlformats-officedocument.presentationml.slideshow use":"The media type application/vnd.openxmlformats-officedocument.presentationml.slideshow uses .ppsx files.","what file extension does the media type text/x-component use":"The media type text/x-component uses .htc files.","which extension goes with the MIME type application/vnd.sun.xml.draw.template":"The media type application/vnd.sun.xml.draw.template uses .std files.","give the extension for application/vnd.llamagraphics.life-balance.desktop files":"The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd files.","which extension goes with the MIME type text/x-setext":"The media type text/x-setext uses .etx files.","which extension goes with the MIME type image/x-portable-pixmap":"The media type image/x-portable-pixmap uses .ppm files.","which extension goes with the MIME type application/srgs+xml":"The media type application/srgs+xml uses .grxml files.","give the extension for application/vnd.ibm.rights-management files":"The media type application/vnd.ibm.rights-management uses .irm files.","give the extension for application/vnd.stepmania.stepchart files":"The media type application/vnd.stepmania.stepchart uses .sm files.","what file extension does the media type application/vnd.lotus-approach use":"The media type application/vnd.lotus-approach uses .apr files.","which extension goes with the MIME type application/vnd.pocketlearn":"The media type application/vnd.pocketlearn uses .plf files.","give the extension for application/vnd.stardivision.impress files":"The media type application/vnd.stardivision.impress uses .sdd files.","which extension goes with the MIME type application/vnd.groove-account":"The media type application/vnd.groove-account uses .gac files.","which extension goes with the MIME type application/vnd.openxmlformats-officedocument.spreadsheetml.template":"The media type application/vnd.openxmlformats-officedocument.spreadsheetml.template uses .xltx files.","which extension goes with the MIME type application/vnd.geogebra.file":"The media type application/vnd.geogebra.file uses .ggb files.","give the extension for application/vnd.epson.quickanime files":"The media type application/vnd.epson.quickanime uses .qam files.","what file extension does the media type model/vnd.opengex use":"The media type model/vnd.opengex uses .ogex files.","which extension goes with the MIME type application/vnd.openxmlformats-officedocument.wordprocessingml.template":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.template uses .dotx files.","what file extension does the media type application/n-triples use":"The media type application/n-triples uses .nt files.","which extension goes with the MIME type application/vnd.ms-htmlhelp":"The media type application/vnd.ms-htmlhelp uses .chm files.","what file extension does the media type application/vnd.groove-tool-template use":"The media type application/vnd.groove-tool-template uses .tpl files.","what file extension does the media type application/vnd.1000minds.decision-model+xml use":"The media type application/vnd.1000minds.decision-model+xml uses .1km files.","give the extension for application/vnd.intergeo files":"The media type application/vnd.intergeo uses .i2g files.","which extension goes with the MIME type application/vnd.hp-jlyt":"The media type application/vnd.hp-jlyt uses .jlt files.","which extension goes with the MIME type image/x-portable-graymap":"The media type image/x-portable-graymap uses .pgm files.","what file extension does the media type application/vnd.fujitsu.oasys2 use":"The media type application/vnd.fujitsu.oasys2 uses .oa2 files.","give the extension for application/vnd.nato.bindingdataobject+xml files":"The media type application/vnd.nato.bindingdataobject+xml uses .bdo files.","what file extension does the media type application/vnd.ms-powerpoint.slideshow.macroenabled.12 use":"The media type application/vnd.ms-powerpoint.slideshow.macroenabled.12 uses .ppsm files."}}},
{"id":"n-bca91794","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"extension"}]]],"mem":{"table":{"does the media type image/vnd.fastbidsheet use":"The media type image/vnd.fastbidsheet uses .fbs files.","for application/vnd.yamaha.openscoreformat files":"The media type application/vnd.yamaha.openscoreformat uses .osf files.","does the media type application/x-cdlink use":"The media type application/x-cdlink uses .vcd files.","for application/vnd.osgi.subsystem files":"The media type application/vnd.osgi.subsystem uses .esa files.","goes with the MIME type application/vnd.ms-powerpoint.addin.macroenabled.12":"The media type application/vnd.ms-powerpoint.addin.macroenabled.12 uses .ppam files.","does the media type application/x-ms-shortcut use":"The media type application/x-ms-shortcut uses .lnk files.","goes with the MIME type application/vnd.denovo.fcselayout-link":"The media type application/vnd.denovo.fcselayout-link uses .fe_launch files.","goes with the MIME type application/calendar+xml":"The media type application/calendar+xml uses .xcs files.","does the media type application/vnd.stardivision.calc use":"The media type application/vnd.stardivision.calc uses .sdc files.","for application/vnd.openblox.game+xml files":"The media type application/vnd.openblox.game+xml uses .obgx files.","goes with the MIME type text/vnd.fmi.flexstor":"The media type text/vnd.fmi.flexstor uses .flx files.","does the media type application/vnd.proteus.magazine use":"The media type application/vnd.proteus.magazine uses .mgz files.","goes with the MIME type application/x-wais-source":"The media type application/x-wais-source uses .src files.","does the media type application/vnd.oasis.opendocument.formula-template use":"The media type application/vnd.oasis.opendocument.formula-template uses .odft files.","for application/vnd.openxmlformats-officedocument.wordprocessingml.document files":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx files.","does the media type application/p2p-overlay+xml use":"The media type application/p2p-overlay+xml uses .relo files.","does the media type application/vnd.openxmlformats-officedocument.presentationml.slideshow use":"The media type application/vnd.openxmlformats-officedocument.presentationml.slideshow uses .ppsx files.","does the media type text/x-component use":"The media type text/x-component uses .htc files.","goes with the MIME type application/vnd.sun.xml.draw.template":"The media type application/vnd.sun.xml.draw.template uses .std files.","for application/vnd.llamagraphics.life-balance.desktop files":"The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd files.","goes with the MIME type text/x-setext":"The media type text/x-setext uses .etx files.","goes with the MIME type image/x-portable-pixmap":"The media type image/x-portable-pixmap uses .ppm files.","goes with the MIME type application/srgs+xml":"The media type application/srgs+xml uses .grxml files.","for application/vnd.ibm.rights-management files":"The media type application/vnd.ibm.rights-management uses .irm files.","for application/vnd.stepmania.stepchart files":"The media type application/vnd.stepmania.stepchart uses .sm files.","does the media type application/vnd.lotus-approach use":"The media type application/vnd.lotus-approach uses .apr files.","goes with the MIME type application/vnd.pocketlearn":"The media type application/vnd.pocketlearn uses .plf files.","for application/vnd.stardivision.impress files":"The media type application/vnd.stardivision.impress uses .sdd files.","goes with the MIME type application/vnd.groove-account":"The media type application/vnd.groove-account uses .gac files.","goes with the MIME type application/vnd.openxmlformats-officedocument.spreadsheetml.template":"The media type application/vnd.openxmlformats-officedocument.spreadsheetml.template uses .xltx files.","goes with the MIME type application/vnd.geogebra.file":"The media type application/vnd.geogebra.file uses .ggb files.","for application/vnd.epson.quickanime files":"The media type application/vnd.epson.quickanime uses .qam files.","does the media type model/vnd.opengex use":"The media type model/vnd.opengex uses .ogex files.","goes with the MIME type application/vnd.openxmlformats-officedocument.wordprocessingml.template":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.template uses .dotx files.","does the media type application/n-triples use":"The media type application/n-triples uses .nt files.","goes with the MIME type application/vnd.ms-htmlhelp":"The media type application/vnd.ms-htmlhelp uses .chm files.","does the media type application/vnd.groove-tool-template use":"The media type application/vnd.groove-tool-template uses .tpl files.","does the media type application/vnd.1000minds.decision-model+xml use":"The media type application/vnd.1000minds.decision-model+xml uses .1km files.","for application/vnd.intergeo files":"The media type application/vnd.intergeo uses .i2g files.","goes with the MIME type application/vnd.hp-jlyt":"The media type application/vnd.hp-jlyt uses .jlt files.","goes with the MIME type image/x-portable-graymap":"The media type image/x-portable-graymap uses .pgm files.","does the media type application/vnd.fujitsu.oasys2 use":"The media type application/vnd.fujitsu.oasys2 uses .oa2 files.","for application/vnd.nato.bindingdataobject+xml files":"The media type application/vnd.nato.bindingdataobject+xml uses .bdo files.","does the media type application/vnd.ms-powerpoint.slideshow.macroenabled.12 use":"The media type application/vnd.ms-powerpoint.slideshow.macroenabled.12 uses .ppsm files."}}},
{"id":"n-0495284b","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-1cefda8b","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-25ebafcf","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","dashes","element","file","files","hyphens","imagexportablegraymap","imagexportablepixmap","item number","kebab case","kebabcase","nth","position","slug","textvndfmiflexstor","textxsetext"]],["not",["has","of"]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-31cd52c0","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","camel case","camelcase","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","lower camel case","nth","position","textvndfmiflexstor","textxsetext"]],["not",["has","of"]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-35cecdbf","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","each word","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","nth","position","split into words","textvndfmiflexstor","textxsetext","words"]],["not",["has","of"]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-6b1844ad","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-7922df6d","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-84ab890d","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-906075e0","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","each word","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","nth","position","split into words","textvndfmiflexstor","textxsetext","words"]],["not",["has","of"]]],"pyramid":["render.lines",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-c0f23783","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-dacc9b59","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","class name","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","nth","pascal case","pascalcase","position","textvndfmiflexstor","textxsetext","upper camel case"]],["not",["has","of"]]],"pyramid":["render.str",["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-f185c50f","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","each word","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","nth","position","split into words","textvndfmiflexstor","textxsetext","words"]],["not",["has","of"]]],"pyramid":["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-04439fd3","guard":[["hasAny",["applicationcalendarxml","applicationvnddenovofcselayoutlink","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","delete","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","nth","position","remove","strip out","textvndfmiflexstor","textxsetext","without"]],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]]],"mem":null},
{"id":"n-18649fce","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","each word","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","nth","position","shortest","shortest one","shortest word","split into words","textvndfmiflexstor","textxsetext","words"]],["not",["has","of"]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-1a427027","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationsrgsxml","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndgroovevcard","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndsoftware602fillerformxml","applicationxresearchinfosystems","imagexxwindowdump","modelgltfjson","name","of","subtype"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]]],"mem":null},
{"id":"n-39771543","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-5da37fc4","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-686df50f","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","each word","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","longest","longest one","longest word","nth","position","split into words","textvndfmiflexstor","textxsetext","words"]],["not",["has","of"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-b37069a3","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-c23b0e11","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","camel case","camelcase","element","file","files","imagexportablegraymap","imagexportablepixmap","invert case","item number","lower camel case","nth","position","swap case","textvndfmiflexstor","textxsetext","toggle case"]],["not",["has","of"]]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-d13d6c7b","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvnddenovofcselayoutlink","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imageheic","imagevndwapwbmp","imagexxwindowdump","modelgltfjson","modelmtl","modelvnddwf","modelvndgdl","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],{"lit":1}]],"mem":null},
{"id":"n-fefb84d6","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","normalise","normalize","nth","position","simplify the text","textvndfmiflexstor","textxsetext"]],["not",["has","of"]]],"pyramid":["render.str",["transform.norm",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],{"lit":1}]],"mem":null},
{"id":"n-0c730b9e","guard":[["hasAny",["delete","element","extension","item number","nth","position","remove","strip out","without"]],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-7d4da072","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationoda","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndautodeskfbx","applicationvndgroovevcard","applicationvndimmervisionivu","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndprocreatebrush","applicationvndsoftware602fillerformxml","applicationvndvsf","applicationvndwqd","applicationxresearchinfosystems","imagexxwindowdump","name","of","subtype","textn3","textvndcurldcurl","videoxmswm"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-9b2963c6","guard":[["hasAny",["applicationcalendarxml","applicationvnddenovofcselayoutlink","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","delete","element","file","files","imagexportablegraymap","imagexportablepixmap","item number","nth","position","remove","strip out","textvndfmiflexstor","textxsetext","without"]],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":-1}]]],"mem":null},
{"id":"n-e73f7e48","guard":[["not",["hasAny",["applicationatscheldxml","applicationnquads","applicationsrgsxml","applicationvndadobexdpxml","applicationvndanserwebfundstransferinitiation","applicationvndgroovevcard","applicationvndnoblenetsealer","applicationvndoasisopendocumentimage","applicationvndoasisopendocumenttextmaster","applicationvndsoftware602fillerformxml","applicationxresearchinfosystems","imagexxwindowdump","modelgltfjson","name","of","subtype"]]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":-1}]]],"mem":null},
{"id":"n-62e8a93f","guard":[["hasAny",["element","extension","item number","nth","position"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-676ef7a7","guard":[["not",["has","name"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-9689d5ed","guard":[["hasAny",["element","extension","item number","nth","position"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-d45fa23e","guard":[["not",["has","name"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-2525ad21","guard":[["not",["has","name"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-4bce0b43","guard":[["hasAny",["element","extension","invert case","item number","nth","position","swap case","toggle case"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-4d84eab3","guard":[["not",["has","name"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-ac2ab126","guard":[["hasAny",["element","extension","item number","nth","position"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-b7a62d91","guard":[["not",["has","name"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-e1a7d636","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","extension","item number","nth","position","title case"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-110d8201","guard":[["not",["has","name"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-336e7511","guard":[["hasAny",["element","extension","invert case","item number","nth","position","swap case","toggle case"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-d9f668d0","guard":[["not",["has","name"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-e9ce94a6","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","extension","item number","nth","position","title case"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-6fc28694","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","dashes","element","file","hyphens","imagexportablegraymap","imagexportablepixmap","item number","kebab case","kebabcase","nth","position","slug","textvndfmiflexstor","textxsetext"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-eee56cb8","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","class name","element","file","imagexportablegraymap","imagexportablepixmap","item number","nth","pascal case","pascalcase","position","textvndfmiflexstor","textxsetext","upper camel case"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-f12bce13","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","camel case","camelcase","element","file","imagexportablegraymap","imagexportablepixmap","item number","lower camel case","nth","position","textvndfmiflexstor","textxsetext"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-4194d48d","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","each word","element","file","imagexportablegraymap","imagexportablepixmap","item number","nth","position","split into words","textvndfmiflexstor","textxsetext","words"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-dd878296","guard":[["hasAny",["applicationcalendarxml","applicationsrgsxml","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndsunxmldrawtemplate","applicationxwaissource","each word","element","file","imagexportablegraymap","imagexportablepixmap","item number","nth","position","split into words","textvndfmiflexstor","textxsetext","words"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-4ca2ddae","guard":[["hasAny",["element","extension","item number","join","joined with","nth","position","separated by"]],["has","type"]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.join",["know.find",{"lit":"mime-types"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-13c75df9","guard":[["hasAny",["applicationcalendarxml","applicationntriples","applicationsrgsxml","applicationvnd1000mindsdecisionmodelxml","applicationvndgeogebrafile","applicationvndgroovetooltemplate","applicationvndhpjlyt","applicationvndllamagraphicslifebalancedesktop","applicationvndmshtmlhelp","applicationvndmspowerpointslideshowmacroenabled12","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndpocketlearn","applicationvndproteusmagazine","applicationvndstardivisioncalc","applicationvndstardivisionimpress","applicationvndstepmaniastepchart","applicationvndsunxmldrawtemplate","applicationxcdlink","applicationxmsshortcut","applicationxwaissource","element","imagevndfastbidsheet","imagexportablegraymap","imagexportablepixmap","item number","no vowels","nth","position","remove vowels","textvndfmiflexstor","textxcomponent","without vowels"]],["not",["has","is"]]],"pyramid":["render.str",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-f68e22da","guard":[["hasAny",["applicationcalendarxml","applicationntriples","applicationsrgsxml","applicationvnd1000mindsdecisionmodelxml","applicationvndgeogebrafile","applicationvndgroovetooltemplate","applicationvndhpjlyt","applicationvndllamagraphicslifebalancedesktop","applicationvndmshtmlhelp","applicationvndmspowerpointslideshowmacroenabled12","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndpocketlearn","applicationvndproteusmagazine","applicationvndstardivisioncalc","applicationvndstardivisionimpress","applicationvndstepmaniastepchart","applicationvndsunxmldrawtemplate","applicationxcdlink","applicationxmsshortcut","applicationxwaissource","camel case","camelcase","element","imagevndfastbidsheet","imagexportablegraymap","imagexportablepixmap","item number","lower camel case","no vowels","nth","position","remove vowels","textvndfmiflexstor","textxcomponent","without vowels"]],["not",["has","is"]]],"pyramid":["render.str",["transform.camel",["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-fa5085a5","guard":[["hasAny",["applicationcalendarxml","applicationntriples","applicationsrgsxml","applicationvnd1000mindsdecisionmodelxml","applicationvndgeogebrafile","applicationvndgroovetooltemplate","applicationvndhpjlyt","applicationvndmshtmlhelp","applicationvndmspowerpointslideshowmacroenabled12","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndpocketlearn","applicationvndproteusmagazine","applicationvndstardivisioncalc","applicationvndsunxmldrawtemplate","applicationxcdlink","applicationxmsshortcut","applicationxwaissource","element","imagevndfastbidsheet","imagexportablegraymap","imagexportablepixmap","item number","no vowels","nth","position","remove vowels","textvndfmiflexstor","textxcomponent","without vowels"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-1e20392b","guard":[["hasAny",["element","goes","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.after",{"lit":"type"}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-3e0e4084","guard":[["hasAny",["element","goes","item number","nth","position","reverse the words","reverse word order","words backwards"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.reverseWords",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-909b9d54","guard":[["hasAny",["element","goes","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.after",{"lit":"type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-98b2f7b9","guard":[["hasAny",["element","file","item number","nth","position"]],["has","does"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-004b13e3","guard":[["hasAny",["element","file","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-47d38a67","guard":[["hasAny",["element","file","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-23a2eb7e","guard":[["hasAny",["dashes","element","file","hyphens","item number","kebab case","kebabcase","nth","position","slug"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-2f4425b5","guard":[["hasAny",["element","file","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-38c4e2cd","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","file","item number","nth","position","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-6ff44d00","guard":[["hasAny",["class name","element","file","item number","nth","pascal case","pascalcase","position","upper camel case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-80e2a792","guard":[["hasAny",["camel case","camelcase","element","file","item number","lower camel case","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-90fada6f","guard":[["hasAny",["element","file","invert case","item number","nth","position","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-13f98e1f","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","file","item number","nth","position","title case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-1bfa4c23","guard":[["hasAny",["each word","element","file","item number","nth","position","split into words","words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-6501505d","guard":[["hasAny",["each word","element","file","item number","nth","position","split into words","words"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-a118cefe","guard":[["hasAny",["element","file","invert case","item number","nth","position","swap case","toggle case"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-70c38d5a","guard":[["hasAny",["delete","element","file","item number","nth","position","remove","strip out","without"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.remove",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-caffc88b","guard":[["hasAny",["element","file","item number","nth","position","separate by","split","split by"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-fedd31a1","guard":[["hasAny",["element","file","item number","nth","position","separate by","split","split by"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-fbceb160","guard":[["hasAny",["element","file","item number","join","joined with","nth","position","separated by"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.join",["know.find",{"lit":"mime-types"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-4dc9b2a9","guard":[["hasAny",["element","files","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-fc5c3a86","guard":[["hasAny",["element","files","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.and",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-214d5772","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","files","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.title",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],["sense.lastWord"]],"mem":null},
{"id":"n-46acb977","guard":[["hasAny",["camel case","camelcase","element","files","item number","lower camel case","nth","position"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.camel",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],["sense.lastWord"]],"mem":null},
{"id":"n-7ff5d584","guard":[["hasAny",["class name","element","files","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.pascal",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],["sense.lastWord"]],"mem":null},
{"id":"n-8ccb3187","guard":[["hasAny",["dashes","element","files","hyphens","item number","kebab case","kebabcase","nth","position","slug"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.kebab",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],["sense.lastWord"]],"mem":null},
{"id":"n-b42a2943","guard":[["hasAny",["class name","element","files","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.pascal",["sense.lastWord"]]],"mem":null},
{"id":"n-c3386330","guard":[["hasAny",["element","files","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-e5919f08","guard":[["hasAny",["element","files","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-f903e784","guard":[["hasAny",["element","files","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.swapCase",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],["sense.lastWord"]],"mem":null},
{"id":"n-15f99217","guard":[["hasAny",["each word","element","files","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["render.list",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],["sense.lastWord"]],"mem":null},
{"id":"n-1bff7b62","guard":[["hasAny",["each word","element","files","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-87f74615","guard":[["hasAny",["each word","element","files","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c0a80baa","guard":[["hasAny",["element","files","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-d4041387","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","files","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["transform.title",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-f2fceac6","guard":[["hasAny",["each word","element","files","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["render.and",["transform.words",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],["sense.lastWord"]],"mem":null},
{"id":"n-fcaf250a","guard":[["hasAny",["element","files","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a7a74df6","guard":[["hasAny",["delete","element","files","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["transform.remove",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["sense.lastWord"]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-4d45f93a","guard":[["hasAny",["element","files","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.split",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-cad25953","guard":[["hasAny",["element","files","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.split",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["sense.lastWord"]]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-fd55f38f","guard":[["hasAny",["element","files","item number","join","joined with","nth","position","separated by"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["transform.join",["know.find",{"lit":"mime-types"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-74a60f0e","guard":[["hasAny",["delete","element","files","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.remove",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]],"mem":null},
{"id":"n-e7ebc7d3","guard":[["hasAny",["applicationntriples","applicationvnd1000mindsdecisionmodelxml","applicationvndgroovetooltemplate","applicationvndmspowerpointslideshowmacroenabled12","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","applicationvndproteusmagazine","applicationvndstardivisioncalc","applicationxcdlink","applicationxmsshortcut","element","imagevndfastbidsheet","item number","no vowels","nth","position","remove vowels","textxcomponent","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-e493b013","guard":[["hasAny",["element","files","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["render.list",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]]],"mem":null},
{"id":"n-fc4cfe47","guard":[["hasAny",["element","files","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["render.and",["transform.split",["sense.lastWord"],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]]],"mem":null},
{"id":"n-79796018","guard":[["has","extension"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"for"}]]],"mem":{"table":{"application/vnd.yamaha.openscoreformat files":"The media type application/vnd.yamaha.openscoreformat uses .osf files.","application/vnd.osgi.subsystem files":"The media type application/vnd.osgi.subsystem uses .esa files.","application/vnd.openblox.game+xml files":"The media type application/vnd.openblox.game+xml uses .obgx files.","application/vnd.openxmlformats-officedocument.wordprocessingml.document files":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx files.","application/vnd.llamagraphics.life-balance.desktop files":"The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd files.","application/vnd.ibm.rights-management files":"The media type application/vnd.ibm.rights-management uses .irm files.","application/vnd.stepmania.stepchart files":"The media type application/vnd.stepmania.stepchart uses .sm files.","application/vnd.stardivision.impress files":"The media type application/vnd.stardivision.impress uses .sdd files.","application/vnd.epson.quickanime files":"The media type application/vnd.epson.quickanime uses .qam files.","application/vnd.intergeo files":"The media type application/vnd.intergeo uses .i2g files.","application/vnd.nato.bindingdataobject+xml files":"The media type application/vnd.nato.bindingdataobject+xml uses .bdo files."}}},
{"id":"n-7b06ba49","guard":[["hasAny",["alphabetize the letters","applicationntriples","applicationvnd1000mindsdecisionmodelxml","applicationvndhpjlyt","applicationvndlotusapproach","applicationvndmshtmlhelp","applicationvndnatobindingdataobjectxml","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","element","item number","letters in order","nth","position","sort the letters","textvndfmiflexstor","textxsetext"]],["not",["has","is"]]],"pyramid":["render.str",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-9e930ab4","guard":[["hasAny",["alphabetize the letters","applicationntriples","applicationvnd1000mindsdecisionmodelxml","applicationvndhpjlyt","applicationvndlotusapproach","applicationvndmshtmlhelp","applicationvndnatobindingdataobjectxml","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","camel case","camelcase","element","item number","letters in order","lower camel case","nth","position","sort the letters","textvndfmiflexstor","textxsetext"]],["not",["has","is"]]],"pyramid":["render.str",["transform.camel",["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]]],"mem":null},
{"id":"n-22356868","guard":[["hasAny",["applicationcalendarxml","applicationvndmshtmlhelp","applicationvndmspowerpointaddinmacroenabled12","applicationvndsunxmldrawtemplate","delete","element","file","files","item number","nth","position","remove","strip out","without"]],["not",["has","of"]]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":2}]]],"mem":null},
{"id":"n-05e6c064","guard":[["hasAny",["alphabetize the letters","applicationntriples","applicationvnd1000mindsdecisionmodelxml","applicationvndhpjlyt","applicationvndlotusapproach","applicationvndmshtmlhelp","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","element","item number","letters in order","nth","position","sort the letters","textvndfmiflexstor","textxsetext"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-6a9b74b8","guard":[["hasAny",["applicationxwaissource","delete","element","file","imagexportablegraymap","imagexportablepixmap","item number","nth","position","remove","strip out","without"]],["has","type"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.roman"]]],"mem":null},
{"id":"n-2a26e83c","guard":[["hasAny",["delete","element","extension","item number","nth","position","remove","strip out","without"]],["has","type"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.numeral"]]],"mem":null},
{"id":"n-c8be9dfd","guard":[["hasAny",["delete","element","extension","item number","nth","position","remove","strip out","without"]],["has","type"]],"pyramid":["render.str",["transform.remove",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.unit"]]],"mem":null},
{"id":"n-94c1d194","guard":[["hasAny",["alphabetize the letters","applicationntriples","applicationvnd1000mindsdecisionmodelxml","applicationvndlotusapproach","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","element","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]]],"mem":null},
{"id":"n-a903157a","guard":[["hasAny",["applicationvndllamagraphicslifebalancedesktop","applicationvndstardivisionimpress","applicationvndstepmaniastepchart","element","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.noVowels",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],["sense.lastWord"]],"mem":null},
{"id":"n-13c57757","guard":[["has","applicationvndibmrightsmanagement"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .irm ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-376febae","guard":[["has","applicationvndintergeo"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .i2g ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-38047479","guard":[["has","applicationvndnatobindingdataobjectxml"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .bdo ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-3f0b9786","guard":[["has","applicationvndllamagraphicslifebalancedesktop"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .lbd ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-5b4e27f3","guard":[["has","applicationvndosgisubsystem"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .esa ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-5d548e68","guard":[["hasAny",["applicationntriples","class name","element","item number","nth","pascal case","pascalcase","position","upper camel case"]]],"pyramid":["render.str",["transform.pascal",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]]],"mem":null},
{"id":"n-63e4aa2d","guard":[["has","applicationvndstepmaniastepchart"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .sm ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-6d3141cb","guard":[["has","applicationvndopenxmlformatsofficedocumentwordprocessingmldocument"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .docx ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-9e38abbd","guard":[["hasAny",["applicationntriples","camel case","camelcase","element","item number","lower camel case","nth","position"]]],"pyramid":["render.str",["transform.camel",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]]],"mem":null},
{"id":"n-a1ab6d78","guard":[["has","applicationvndstardivisionimpress"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .sdd ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-d19dbdf0","guard":[["has","applicationvndepsonquickanime"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .qam ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-e0301d9f","guard":[["has","applicationvndyamahaopenscoreformat"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .osf ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-fbc9fe5f","guard":[["has","applicationvndopenbloxgamexml"]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .obgx ",{"slot":1},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["sense.lastWord"]],"mem":null},
{"id":"n-000622d1","guard":[["hasAny",["applicationntriples","class name","element","invert case","item number","nth","pascal case","pascalcase","position","swap case","toggle case","upper camel case"]]],"pyramid":["render.str",["transform.pascal",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]]]],"mem":null},
{"id":"n-0d2aa202","guard":[["hasAny",["applicationntriples","camel case","camelcase","element","invert case","item number","lower camel case","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.camel",["transform.swapCase",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]]]],"mem":null},
{"id":"n-40b60922","guard":[["hasAny",["abbreviate","abbreviation","acronym","applicationntriples","element","first letters of the name","initials","item number","nth","position","short form"]]],"pyramid":["render.str",["transform.acronym",["transform.initials",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]]]],"mem":null},
{"id":"n-8ddb7202","guard":[["hasAny",["abbreviate","abbreviation","acronym","applicationntriples","element","item number","no vowels","nth","position","remove vowels","short form","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]]]],"mem":null},
{"id":"n-a469209c","guard":[["hasAny",["applicationntriples","class name","element","invert case","item number","nth","pascal case","pascalcase","position","swap case","toggle case","upper camel case"]]],"pyramid":["render.str",["transform.swapCase",["transform.pascal",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]]]],"mem":null},
{"id":"n-af9f90ad","guard":[["hasAny",["applicationntriples","camel case","camelcase","element","invert case","item number","lower camel case","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.camel",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}]]]],"mem":null},
{"id":"n-27ba18b8","guard":[["hasAny",["element","imagexportablegraymap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-29be037c","guard":[["hasAny",["element","item number","nth","position","textvndfmiflexstor"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .flx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-2c6f4db7","guard":[["hasAny",["applicationvndmshtmlhelp","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .chm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-3e91f0ae","guard":[["hasAny",["applicationvndpocketlearn","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .plf files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-42cfa228","guard":[["hasAny",["applicationntriples","camel case","camelcase","delete","element","item number","lower camel case","nth","position","remove","strip out","without"]]],"pyramid":["render.str",["transform.camel",["transform.remove",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["sense.lastWord"]]]],"mem":null},
{"id":"n-51065220","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .dotx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-558ba12b","guard":[["hasAny",["applicationxwaissource","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .src files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-55daf4a8","guard":[["hasAny",["applicationvnddenovofcselayoutlink","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .fe_launch files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-6c6cde10","guard":[["hasAny",["applicationvndsunxmldrawtemplate","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .std files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-76bbd930","guard":[["hasAny",["applicationvndgrooveaccount","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .gac files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-a15f47fa","guard":[["hasAny",["element","item number","nth","position","textxsetext"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .etx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-a29c3425","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .xltx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-a7167454","guard":[["hasAny",["element","imagexportablepixmap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .ppm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-affd755e","guard":[["hasAny",["applicationvndgeogebrafile","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .ggb files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-bf6fede0","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .ppam files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-c3a3effa","guard":[["hasAny",["applicationsrgsxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .grxml files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-ce6e0f0d","guard":[["hasAny",["applicationcalendarxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .xcs files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-e0734daf","guard":[["hasAny",["applicationvndhpjlyt","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," ",{"slot":1}," uses .jlt files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-7a902d77","guard":[["hasAny",["applicationntriples","camel case","camelcase","element","item number","join","joined with","lower camel case","nth","position","separated by"]]],"pyramid":["render.str",["transform.camel",["transform.join",["know.find",{"lit":"mime-types"},{"lit":"media type"}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]]],"mem":null},
{"id":"n-02ec4e6f","guard":[["hasAny",["applicationvndstardivisionimpress","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stardivision.impress uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-05aca208","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .1km files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-1a868613","guard":[["hasAny",["applicationvndstardivisioncalc","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .sdc files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-1ad11bff","guard":[["hasAny",["applicationntriples","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .nt files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-1e81606b","guard":[["hasAny",["applicationxcdlink","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .vcd files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-201804e6","guard":[["hasAny",["element","imagevndfastbidsheet","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .fbs files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-225109ac","guard":[["hasAny",["applicationvndstepmaniastepchart","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stepmania.stepchart uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-2c0378d8","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .ppsx files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-2d6c67a5","guard":[["hasAny",["applicationvndibmrightsmanagement","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.ibm.rights-management uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-2e1f78e9","guard":[["hasAny",["applicationvndnatobindingdataobjectxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.nato.bindingdataobject+xml uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-4dbbe222","guard":[["hasAny",["element","item number","modelvndopengex","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .ogex files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-585d0bc3","guard":[["hasAny",["applicationxmsshortcut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-5c991f16","guard":[["hasAny",["applicationvndepsonquickanime","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.epson.quickanime uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-5dc082d6","guard":[["hasAny",["applicationvndlotusapproach","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .apr files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-7ff66d86","guard":[["hasAny",["applicationvndyamahaopenscoreformat","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.yamaha.openscoreformat uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-852574de","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-86c7f321","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmldocument","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-a4cf8993","guard":[["hasAny",["applicationp2poverlayxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .relo files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-a7c6b704","guard":[["hasAny",["applicationvndosgisubsystem","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.osgi.subsystem uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-c984ae0d","guard":[["hasAny",["applicationvndllamagraphicslifebalancedesktop","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.llamagraphics.life-balance.desktop uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-cdfb763b","guard":[["hasAny",["applicationvndfujitsuoasys2","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .oa2 files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-cfffd15e","guard":[["hasAny",["applicationvndoasisopendocumentformulatemplate","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .odft files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-d12438c7","guard":[["hasAny",["applicationvndopenbloxgamexml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openblox.game+xml uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-da796e92","guard":[["hasAny",["applicationvndgroovetooltemplate","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .tpl files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-e52aa562","guard":[["hasAny",["element","item number","nth","position","textxcomponent"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .htc files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-f0c4bb9a","guard":[["hasAny",["applicationvndproteusmagazine","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," ",{"slot":2}," uses .mgz files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]]],"mem":null},
{"id":"n-fd8eac5e","guard":[["hasAny",["applicationvndintergeo","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.intergeo uses .",{"slot":0}," ",{"slot":1},"."]},["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}],["sense.lastWord"]],"mem":null},
{"id":"n-3be640c7","guard":[["hasAny",["abbreviate","abbreviation","acronym","applicationntriples","delete","element","item number","nth","position","remove","short form","strip out","without"]]],"pyramid":["render.str",["transform.acronym",["transform.remove",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":1}]]]],"mem":null},
{"id":"n-84c9954b","guard":[["hasAny",["abbreviate","abbreviation","acronym","applicationntriples","delete","element","item number","nth","position","remove","short form","strip out","without"]]],"pyramid":["render.str",["transform.acronym",["transform.remove",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"file extension"}],{"lit":-1}]]]],"mem":null},
{"id":"n-111f0fd3","guard":[["hasAny",["applicationvnddenovofcselayoutlink","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.denovo.fcselayout-link uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-1220382d","guard":[["hasAny",["applicationxwaissource","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/x-wais-source uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-1289272b","guard":[["hasAny",["element","item number","nth","position","textxsetext"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/x-setext uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-1e86a7ad","guard":[["hasAny",["applicationvndhpjlyt","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.hp-jlyt uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-320c3e29","guard":[["hasAny",["applicationvndsunxmldrawtemplate","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.sun.xml.draw.template uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-39d8d03f","guard":[["hasAny",["applicationvndmshtmlhelp","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.ms-htmlhelp uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-4101cc12","guard":[["hasAny",["applicationvndgrooveaccount","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.groove-account uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-64f89bd6","guard":[["hasAny",["element","imagexportablepixmap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/x-portable-pixmap uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-8f152a01","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.ms-powerpoint.addin.macroenabled.12 uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-92e36e36","guard":[["hasAny",["applicationsrgsxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/srgs+xml uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-a87cac7a","guard":[["hasAny",["applicationvndpocketlearn","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.pocketlearn uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-b7dc66cc","guard":[["hasAny",["element","item number","nth","position","textvndfmiflexstor"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/vnd.fmi.flexstor uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-bf848291","guard":[["hasAny",["element","imagexportablegraymap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/x-portable-graymap uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-d2446f19","guard":[["hasAny",["applicationcalendarxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/calendar+xml uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-d4eefc07","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.openxmlformats-officedocument.wordprocessingml.template uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-dc3ad575","guard":[["hasAny",["applicationvndgeogebrafile","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.geogebra.file uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-e88e2033","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.openxmlformats-officedocument.spreadsheetml.template uses .",{"slot":1}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-0d95a427","guard":[["hasAny",["applicationxcdlink","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/x-cdlink uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-0e7a93b2","guard":[["hasAny",["applicationxmsshortcut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/x-ms-shortcut uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-110f222c","guard":[["hasAny",["applicationvndproteusmagazine","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.proteus.magazine uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-14a99d4a","guard":[["hasAny",["element","item number","modelvndopengex","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," model/vnd.opengex uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-2a5d95bb","guard":[["hasAny",["alphabetize the letters","applicationvndnatobindingdataobjectxml","element","item number","letters in order","nth","position","sort the letters"]]],"pyramid":["render.template",{"lit":["The media type ",{"slot":0}," uses .",{"slot":1}," ",{"slot":2},"."]},["render.list",["know.find",{"lit":"mime-types"},{"lit":"media type"}]],["transform.sortLetters",["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],["sense.lastWord"]],"mem":null},
{"id":"n-2d6d3ca4","guard":[["hasAny",["applicationvndoasisopendocumentformulatemplate","element","item number","nth","position"]],["has","what"]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.oasis.opendocument.formula-template uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-45a3062f","guard":[["hasAny",["applicationp2poverlayxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/p2p-overlay+xml uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-5b808175","guard":[["hasAny",["element","item number","nth","position","textxcomponent"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," text/x-component uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-743211a3","guard":[["hasAny",["applicationvndgroovetooltemplate","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.groove-tool-template uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-9003092a","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.1000minds.decision-model+xml uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-9eecd5d9","guard":[["hasAny",["applicationvndstardivisioncalc","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.stardivision.calc uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-beed5b67","guard":[["hasAny",["applicationvndlotusapproach","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.lotus-approach uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-d5ff4e72","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.openxmlformats-officedocument.presentationml.slideshow uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-e6d79e06","guard":[["hasAny",["applicationntriples","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/n-triples uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-f77a3c90","guard":[["hasAny",["applicationvndfujitsuoasys2","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.fujitsu.oasys2 uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-f8e4d8c8","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.ms-powerpoint.slideshow.macroenabled.12 uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-f98b6faa","guard":[["hasAny",["element","imagevndfastbidsheet","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," image/vnd.fastbidsheet uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["know.lookup",["transform.nthStr",["know.find",{"lit":"mime-types"},{"lit":"media type"}],{"lit":1}],{"lit":"mime-types"},{"lit":"media type"},{"lit":"file extension"}]],"mem":null},
{"id":"n-02080751","guard":[["hasAny",["applicationvndmshtmlhelp","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.ms-htmlhelp":"The media type application/vnd.ms-htmlhelp uses .chm files."}}},
{"id":"n-05710508","guard":[["hasAny",["applicationvndopenbloxgamexml","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.openblox.game+xml files":"The media type application/vnd.openblox.game+xml uses .obgx files."}}},
{"id":"n-0d851fa3","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.1000minds.decision-model+xml use":"The media type application/vnd.1000minds.decision-model+xml uses .1km files."}}},
{"id":"n-10666041","guard":[["hasAny",["applicationxwaissource","no vowels","remove vowels","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-18e76dd4","guard":[["hasAny",["applicationvndgeogebrafile","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.geogebra.file":"The media type application/vnd.geogebra.file uses .ggb files."}}},
{"id":"n-1912af0a","guard":[["hasAny",["extension","goes","imagexportablegraymap","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type image/x-portable-graymap":"The media type image/x-portable-graymap uses .pgm files."}}},
{"id":"n-1da0d3a3","guard":[["has","applicationvndibmrightsmanagement"]],"pyramid":["render.template",{"lit":["The media type application/vnd.ibm.rights-management uses .irm ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-2191c8db","guard":[["hasAny",["extension","file","media","textxcomponent","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type text/x-component use":"The media type text/x-component uses .htc files."}}},
{"id":"n-232e8a63","guard":[["hasAny",["extension","goes","mime","textxsetext","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type text/x-setext":"The media type text/x-setext uses .etx files."}}},
{"id":"n-2499f912","guard":[["has","applicationsrgsxml"]],"pyramid":["render.template",{"lit":["The media type application/srgs+",{"slot":0}," uses .grxml files."]},["sense.lastWord"]],"mem":null},
{"id":"n-2e8e3454","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.ms-powerpoint.addin.macroenabled.12":"The media type application/vnd.ms-powerpoint.addin.macroenabled.12 uses .ppam files."}}},
{"id":"n-324ef680","guard":[["hasAny",["applicationvndpocketlearn","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.pocketlearn":"The media type application/vnd.pocketlearn uses .plf files."}}},
{"id":"n-33418d67","guard":[["hasAny",["extension","file","media","modelvndopengex","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type model/vnd.opengex use":"The media type model/vnd.opengex uses .ogex files."}}},
{"id":"n-36798ca5","guard":[["hasAny",["applicationvndstardivisionimpress","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.stardivision.impress files":"The media type application/vnd.stardivision.impress uses .sdd files."}}},
{"id":"n-3719cb50","guard":[["hasAny",["applicationvndlotusapproach","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.lotus-approach use":"The media type application/vnd.lotus-approach uses .apr files."}}},
{"id":"n-386270d7","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.ms-powerpoint.slideshow.macroenabled.12 use":"The media type application/vnd.ms-powerpoint.slideshow.macroenabled.12 uses .ppsm files."}}},
{"id":"n-3badefd9","guard":[["hasAny",["applicationvndintergeo","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.intergeo files":"The media type application/vnd.intergeo uses .i2g files."}}},
{"id":"n-3e861bc9","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.openxmlformats-officedocument.spreadsheetml.template":"The media type application/vnd.openxmlformats-officedocument.spreadsheetml.template uses .xltx files."}}},
{"id":"n-45622b2f","guard":[["hasAny",["applicationvndnatobindingdataobjectxml","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.nato.bindingdataobject+xml files":"The media type application/vnd.nato.bindingdataobject+xml uses .bdo files."}}},
{"id":"n-4c5fffc7","guard":[["hasAny",["applicationvndosgisubsystem","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.osgi.subsystem files":"The media type application/vnd.osgi.subsystem uses .esa files."}}},
{"id":"n-4f1788da","guard":[["has","applicationvndyamahaopenscoreformat"]],"pyramid":["render.template",{"lit":["The media type application/vnd.yamaha.openscoreformat uses .osf ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-4fb8ac12","guard":[["hasAny",["applicationntriples","longest one","longest word"]]],"pyramid":["render.str",["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-531ea4a5","guard":[["hasAny",["applicationvnddenovofcselayoutlink","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.denovo.fcselayout-link":"The media type application/vnd.denovo.fcselayout-link uses .fe_launch files."}}},
{"id":"n-5aa10442","guard":[["hasAny",["applicationxmsshortcut","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/x-ms-shortcut use":"The media type application/x-ms-shortcut uses .lnk files."}}},
{"id":"n-626c82d5","guard":[["has","applicationcalendarxml"]],"pyramid":["render.template",{"lit":["The media type application/calendar+",{"slot":0}," uses .xcs files."]},["sense.lastWord"]],"mem":null},
{"id":"n-6419349d","guard":[["hasAny",["applicationvndsunxmldrawtemplate","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.sun.xml.draw.template":"The media type application/vnd.sun.xml.draw.template uses .std files."}}},
{"id":"n-6489083d","guard":[["has","applicationvndstepmaniastepchart"]],"pyramid":["render.template",{"lit":["The media type application/vnd.stepmania.stepchart uses .sm ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-64d5f610","guard":[["has","applicationvndgrooveaccount"]],"pyramid":["render.template",{"lit":["The media type application/vnd.groove-",{"slot":0}," uses .gac files."]},["sense.lastWord"]],"mem":null},
{"id":"n-6bc71cea","guard":[["hasAny",["applicationvndepsonquickanime","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.epson.quickanime files":"The media type application/vnd.epson.quickanime uses .qam files."}}},
{"id":"n-6c3ecd56","guard":[["hasAny",["applicationxwaissource","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/x-wais-source":"The media type application/x-wais-source uses .src files."}}},
{"id":"n-72900d99","guard":[["hasAny",["applicationvndoasisopendocumentformulatemplate","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.oasis.opendocument.formula-template use":"The media type application/vnd.oasis.opendocument.formula-template uses .odft files."}}},
{"id":"n-734e7274","guard":[["hasAny",["applicationvndstardivisioncalc","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.stardivision.calc use":"The media type application/vnd.stardivision.calc uses .sdc files."}}},
{"id":"n-7699cead","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.openxmlformats-officedocument.presentationml.slideshow use":"The media type application/vnd.openxmlformats-officedocument.presentationml.slideshow uses .ppsx files."}}},
{"id":"n-7850c0cf","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.openxmlformats-officedocument.wordprocessingml.template":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.template uses .dotx files."}}},
{"id":"n-7cfa56ec","guard":[["hasAny",["extension","file","imagevndfastbidsheet","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type image/vnd.fastbidsheet use":"The media type image/vnd.fastbidsheet uses .fbs files."}}},
{"id":"n-7e9b042a","guard":[["hasAny",["applicationvndhpjlyt","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.hp-jlyt":"The media type application/vnd.hp-jlyt uses .jlt files."}}},
{"id":"n-82b1637c","guard":[["hasAny",["applicationvndgroovetooltemplate","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.groove-tool-template use":"The media type application/vnd.groove-tool-template uses .tpl files."}}},
{"id":"n-832b900a","guard":[["has","applicationvndgeogebrafile"]],"pyramid":["render.template",{"lit":["The media type application/vnd.geogebra.",{"slot":0}," uses .ggb files."]},["sense.lastWord"]],"mem":null},
{"id":"n-98176626","guard":[["hasAny",["applicationvndstepmaniastepchart","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.stepmania.stepchart files":"The media type application/vnd.stepmania.stepchart uses .sm files."}}},
{"id":"n-98444574","guard":[["hasAny",["extension","goes","imagexportablepixmap","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type image/x-portable-pixmap":"The media type image/x-portable-pixmap uses .ppm files."}}},
{"id":"n-99593007","guard":[["has","applicationvndsunxmldrawtemplate"]],"pyramid":["render.template",{"lit":["The media type application/vnd.sun.xml.draw.",{"slot":0}," uses .std files."]},["sense.lastWord"]],"mem":null},
{"id":"n-9be9cedc","guard":[["hasAny",["applicationvndgrooveaccount","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.groove-account":"The media type application/vnd.groove-account uses .gac files."}}},
{"id":"n-a496cfaa","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmldocument","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.openxmlformats-officedocument.wordprocessingml.document files":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx files."}}},
{"id":"n-a4f8f9a9","guard":[["has","textvndfmiflexstor"]],"pyramid":["render.template",{"lit":["The media type text/vnd.fmi.",{"slot":0}," uses .flx files."]},["sense.lastWord"]],"mem":null},
{"id":"n-a5593d35","guard":[["has","applicationvndnatobindingdataobjectxml"]],"pyramid":["render.template",{"lit":["The media type application/vnd.nato.bindingdataobject+xml uses .bdo ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-a5b4dcd9","guard":[["hasAny",["applicationntriples","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/n-triples use":"The media type application/n-triples uses .nt files."}}},
{"id":"n-aa926b42","guard":[["hasAny",["applicationcalendarxml","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/calendar+xml":"The media type application/calendar+xml uses .xcs files."}}},
{"id":"n-aa9d6132","guard":[["hasAny",["applicationvndfujitsuoasys2","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.fujitsu.oasys2 use":"The media type application/vnd.fujitsu.oasys2 uses .oa2 files."}}},
{"id":"n-afa410a7","guard":[["has","applicationvndopenbloxgamexml"]],"pyramid":["render.template",{"lit":["The media type application/vnd.openblox.game+xml uses .obgx ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-b7cb4990","guard":[["has","applicationvnddenovofcselayoutlink"]],"pyramid":["render.template",{"lit":["The media type application/vnd.denovo.fcselayout-",{"slot":0}," uses .fe_launch files."]},["sense.lastWord"]],"mem":null},
{"id":"n-b9ecf09e","guard":[["has","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate"]],"pyramid":["render.template",{"lit":["The media type application/vnd.openxmlformats-officedocument.wordprocessingml.",{"slot":0}," uses .dotx files."]},["sense.lastWord"]],"mem":null},
{"id":"n-bf98b11c","guard":[["has","applicationvndopenxmlformatsofficedocumentwordprocessingmldocument"]],"pyramid":["render.template",{"lit":["The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-c640f576","guard":[["has","applicationvndstardivisionimpress"]],"pyramid":["render.template",{"lit":["The media type application/vnd.stardivision.impress uses .sdd ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-d03f8dee","guard":[["has","applicationvndllamagraphicslifebalancedesktop"]],"pyramid":["render.template",{"lit":["The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-d7bcb984","guard":[["hasAny",["applicationsrgsxml","extension","goes","mime","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/srgs+xml":"The media type application/srgs+xml uses .grxml files."}}},
{"id":"n-e05c6429","guard":[["hasAny",["extension","goes","mime","textvndfmiflexstor","type"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type text/vnd.fmi.flexstor":"The media type text/vnd.fmi.flexstor uses .flx files."}}},
{"id":"n-e189be56","guard":[["has","applicationvndepsonquickanime"]],"pyramid":["render.template",{"lit":["The media type application/vnd.epson.quickanime uses .qam ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-e2df2d39","guard":[["hasAny",["applicationp2poverlayxml","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/p2p-overlay+xml use":"The media type application/p2p-overlay+xml uses .relo files."}}},
{"id":"n-e2ed528f","guard":[["has","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate"]],"pyramid":["render.template",{"lit":["The media type application/vnd.openxmlformats-officedocument.spreadsheetml.",{"slot":0}," uses .xltx files."]},["sense.lastWord"]],"mem":null},
{"id":"n-e829856c","guard":[["has","applicationvndpocketlearn"]],"pyramid":["render.template",{"lit":["The media type application/vnd.",{"slot":0}," uses .plf files."]},["sense.lastWord"]],"mem":null},
{"id":"n-e9b7e743","guard":[["hasAny",["applicationvndibmrightsmanagement","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.ibm.rights-management files":"The media type application/vnd.ibm.rights-management uses .irm files."}}},
{"id":"n-ea31854f","guard":[["hasAny",["applicationvndyamahaopenscoreformat","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.yamaha.openscoreformat files":"The media type application/vnd.yamaha.openscoreformat uses .osf files."}}},
{"id":"n-ecdb6238","guard":[["hasAny",["applicationxcdlink","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/x-cdlink use":"The media type application/x-cdlink uses .vcd files."}}},
{"id":"n-ed2c80e2","guard":[["hasAny",["applicationvndproteusmagazine","extension","file","media","type","use"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.proteus.magazine use":"The media type application/vnd.proteus.magazine uses .mgz files."}}},
{"id":"n-f6b57a0d","guard":[["hasAny",["applicationvndllamagraphicslifebalancedesktop","extension","files"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.llamagraphics.life-balance.desktop files":"The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd files."}}},
{"id":"n-f8ebc5c2","guard":[["has","applicationvndintergeo"]],"pyramid":["render.template",{"lit":["The media type application/vnd.intergeo uses .i2g ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-fd07db45","guard":[["has","applicationvndosgisubsystem"]],"pyramid":["render.template",{"lit":["The media type application/vnd.osgi.subsystem uses .esa ",{"slot":0},"."]},["sense.lastWord"]],"mem":null},
{"id":"n-0ce4e57f","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmldocument","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-0fc2cc2c","guard":[["hasAny",["applicationvndosgisubsystem","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.osgi.subsystem uses .esa ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-212c5a7a","guard":[["hasAny",["applicationvndyamahaopenscoreformat","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.yamaha.openscoreformat uses .osf ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-27637071","guard":[["hasAny",["applicationvndosgisubsystem","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.osgi.subsystem uses .esa ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-29c78637","guard":[["hasAny",["applicationvndllamagraphicslifebalancedesktop","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-2df30939","guard":[["has","applicationvndmspowerpointaddinmacroenabled12"]],"pyramid":["render.template",{"lit":["The media type application/vnd.",{"slot":0},"-powerpoint.addin.macroenabled.",{"slot":1}," uses .ppam files."]},["sense.unit"],["sense.lastWord"]],"mem":null},
{"id":"n-358c63b6","guard":[["hasAny",["applicationxwaissource","class name","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]]],"pyramid":["render.str",["transform.pascal",["transform.noVowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-37c9956c","guard":[["hasAny",["applicationntriples","item number","nth"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-3abd5630","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmldocument","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-3e371767","guard":[["hasAny",["applicationntriples","invert case","longest one","longest word","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-4063fc83","guard":[["hasAny",["applicationxwaissource","invert case","no vowels","remove vowels","swap case","toggle case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.swapCase",["sense.lastWord"]]]],"mem":null},
{"id":"n-43b9f771","guard":[["hasAny",["applicationvndllamagraphicslifebalancedesktop","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-47101f5e","guard":[["hasAny",["applicationvndyamahaopenscoreformat","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.yamaha.openscoreformat uses .osf ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-53c9a198","guard":[["hasAny",["applicationntriples","class name","longest one","longest word","pascal case","pascalcase","upper camel case"]]],"pyramid":["render.str",["transform.pascal",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-5d360133","guard":[["hasAny",["applicationxwaissource","class name","no vowels","pascal case","pascalcase","remove vowels","upper camel case","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.pascal",["sense.lastWord"]]]],"mem":null},
{"id":"n-6aeec4f9","guard":[["hasAny",["applicationvndstardivisionimpress","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stardivision.impress uses .sdd ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-72e4d60a","guard":[["hasAny",["applicationvndnatobindingdataobjectxml","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.nato.bindingdataobject+xml uses .bdo ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-7aab6b92","guard":[["has","applicationvndmshtmlhelp"]],"pyramid":["render.template",{"lit":["The media type application/vnd.",{"slot":0},"-",{"slot":1}," uses .chm files."]},["sense.unit"],["sense.lastWord"]],"mem":null},
{"id":"n-80bf819d","guard":[["hasAny",["applicationvndibmrightsmanagement","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.ibm.rights-management uses .irm ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-8f502a56","guard":[["has","imagexportablegraymap"]],"pyramid":["render.template",{"lit":["The media type image/",{"slot":0},"-portable-",{"slot":1}," uses .pgm files."]},["sense.roman"],["sense.lastWord"]],"mem":null},
{"id":"n-9027d162","guard":[["hasAny",["applicationvndstardivisionimpress","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stardivision.impress uses .sdd ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-90d87f26","guard":[["hasAny",["applicationvndnatobindingdataobjectxml","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.nato.bindingdataobject+xml uses .bdo ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-9adedf15","guard":[["hasAny",["applicationvndstepmaniastepchart","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stepmania.stepchart uses .sm ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9d6f3b1e","guard":[["hasAny",["applicationvndintergeo","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.intergeo uses .i2g ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9ee6ad79","guard":[["hasAny",["applicationvndstepmaniastepchart","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stepmania.stepchart uses .sm ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-b0b65672","guard":[["hasAny",["applicationvndopenbloxgamexml","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openblox.game+xml uses .obgx ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-b53eb09e","guard":[["has","imagexportablepixmap"]],"pyramid":["render.template",{"lit":["The media type image/",{"slot":0},"-portable-",{"slot":1}," uses .ppm files."]},["sense.roman"],["sense.lastWord"]],"mem":null},
{"id":"n-bd0ade2c","guard":[["hasAny",["applicationvndepsonquickanime","invert case","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.epson.quickanime uses .qam ",{"slot":0},"."]},["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-bf4a7a5d","guard":[["hasAny",["applicationvndibmrightsmanagement","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.ibm.rights-management uses .irm ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-c14ace8d","guard":[["has","textxsetext"]],"pyramid":["render.template",{"lit":["The media type text/",{"slot":0},"-",{"slot":1}," uses .etx files."]},["sense.roman"],["sense.lastWord"]],"mem":null},
{"id":"n-d50f9e22","guard":[["hasAny",["applicationvndepsonquickanime","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.epson.quickanime uses .qam ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-d6827b20","guard":[["hasAny",["applicationvndintergeo","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.intergeo uses .i2g ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-f183b3a2","guard":[["hasAny",["applicationvndopenbloxgamexml","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openblox.game+xml uses .obgx ",{"slot":0},"."]},["aggregate.shortest",["sense.content"]]],"mem":null},
{"id":"n-09f4f464","guard":[["hasAny",["applicationxwaissource","no vowels","remove vowels","separate by","split","split by","without vowels"]]],"pyramid":["render.list",["transform.split",["transform.noVowels",["sense.lastWord"]],["sense.roman"]]],"mem":null},
{"id":"n-0b88ada3","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmldocument","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-12dc4ebf","guard":[["hasAny",["applicationvndstepmaniastepchart","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stepmania.stepchart uses .sm ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-19dbec80","guard":[["hasAny",["abbreviate","abbreviation","acronym","applicationntriples","no vowels","remove vowels","short form","without vowels"]]],"pyramid":["render.str",["transform.noVowels",["transform.acronym",["sense.after",{"lit":"type"}]]]],"mem":null},
{"id":"n-1b9cd46c","guard":[["hasAny",["applicationxwaissource","no vowels","remove vowels","separate by","split","split by","without vowels"]]],"pyramid":["render.lines",["transform.split",["transform.noVowels",["sense.lastWord"]],["sense.roman"]]],"mem":null},
{"id":"n-37baa301","guard":[["hasAny",["applicationvndepsonquickanime","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.epson.quickanime uses .qam ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-3c8965a2","guard":[["hasAny",["applicationvndibmrightsmanagement","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.ibm.rights-management uses .irm ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-541bc946","guard":[["hasAny",["applicationvndllamagraphicslifebalancedesktop","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-55333d92","guard":[["hasAny",["applicationvndepsonquickanime","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.epson.quickanime uses .qam ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-62f634df","guard":[["hasAny",["applicationvndstardivisionimpress","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stardivision.impress uses .sdd ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-65f7daf5","guard":[["hasAny",["applicationvndstepmaniastepchart","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stepmania.stepchart uses .sm ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-67c63cd4","guard":[["hasAny",["applicationvndintergeo","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.intergeo uses .i2g ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-6f02789e","guard":[["hasAny",["applicationvndyamahaopenscoreformat","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.yamaha.openscoreformat uses .osf ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-73b0efe6","guard":[["hasAny",["applicationvndopenbloxgamexml","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openblox.game+xml uses .obgx ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-75ba5a7c","guard":[["hasAny",["applicationvndllamagraphicslifebalancedesktop","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-787f41c1","guard":[["hasAny",["applicationntriples","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-88b88232","guard":[["hasAny",["applicationntriples","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]],"mem":null},
{"id":"n-893a1044","guard":[["hasAny",["applicationntriples","from position","items from to"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-92f3face","guard":[["hasAny",["applicationvndosgisubsystem","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.osgi.subsystem uses .esa ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-9db1cb65","guard":[["hasAny",["applicationxwaissource","no vowels","remove vowels","separate by","split","split by","without vowels"]]],"pyramid":["render.and",["transform.split",["transform.noVowels",["sense.lastWord"]],["sense.roman"]]],"mem":null},
{"id":"n-b3f62e8f","guard":[["hasAny",["applicationvndintergeo","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.intergeo uses .i2g ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b4f96324","guard":[["hasAny",["applicationvndopenxmlformatsofficedocumentwordprocessingmldocument","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b889e122","guard":[["hasAny",["applicationntriples","from position","items from to"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]],"mem":null},
{"id":"n-bc392af7","guard":[["hasAny",["applicationvndnatobindingdataobjectxml","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.nato.bindingdataobject+xml uses .bdo ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-c3cafab5","guard":[["hasAny",["applicationvndibmrightsmanagement","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.ibm.rights-management uses .irm ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-cf5e90ae","guard":[["hasAny",["applicationvndosgisubsystem","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.osgi.subsystem uses .esa ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-dfbf291f","guard":[["hasAny",["applicationvndopenbloxgamexml","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.openblox.game+xml uses .obgx ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ed144366","guard":[["hasAny",["applicationvndyamahaopenscoreformat","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.yamaha.openscoreformat uses .osf ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fa7e2bab","guard":[["hasAny",["applicationvndstardivisionimpress","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.stardivision.impress uses .sdd ",{"slot":0},"."]},["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-fc39197e","guard":[["hasAny",["applicationvndnatobindingdataobjectxml","each word","split into words"]]],"pyramid":["render.template",{"lit":["The media type application/vnd.nato.bindingdataobject+xml uses .bdo ",{"slot":0},"."]},["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-2018f9de","guard":[["hasAny",["item number","nth","position","textxcomponent"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/",{"slot":1},"-component uses .htc files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"]],"mem":null},
{"id":"n-4b650e93","guard":[["hasAny",["applicationp2poverlayxml","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type application/",{"slot":1},"-overlay+xml uses .relo files."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.numeral"]],"mem":null},
{"id":"n-4e4c1f9f","guard":[["hasAny",["applicationxcdlink","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type application/",{"slot":1},"-cdlink uses .vcd files."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.roman"]],"mem":null},
{"id":"n-58f87e33","guard":[["hasAny",["imagexportablegraymap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-graymap uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"]],"mem":null},
{"id":"n-7dd2de98","guard":[["hasAny",["applicationvndfujitsuoasys2","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type application/vnd.fujitsu.",{"slot":1}," uses .oa2 files."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.numeral"]],"mem":null},
{"id":"n-7e6680f9","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type application/vnd.",{"slot":1},".decision-model+xml uses .1km files."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.numeral"]],"mem":null},
{"id":"n-988a2393","guard":[["hasAny",["applicationxwaissource","no vowels","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The media type application/",{"slot":0},"-wais-",{"slot":1}," uses .",{"slot":2}," files."]},["sense.roman"],["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-9a4313cc","guard":[["hasAny",["applicationvndfujitsuoasys2","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.fujitsu.",{"slot":1}," uses .oa2 files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.numeral"]],"mem":null},
{"id":"n-9e4ecba3","guard":[["hasAny",["item number","nth","position","textxcomponent"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type text/",{"slot":1},"-component uses .htc files."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.roman"]],"mem":null},
{"id":"n-a99d0e0b","guard":[["hasAny",["applicationxcdlink","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-cdlink uses .vcd files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"]],"mem":null},
{"id":"n-ab0b1f65","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.",{"slot":1},".decision-model+xml uses .1km files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.numeral"]],"mem":null},
{"id":"n-b0333371","guard":[["hasAny",["item number","nth","position","textxsetext"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/",{"slot":1},"-setext uses .etx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"]],"mem":null},
{"id":"n-d38f9b43","guard":[["hasAny",["imagexportablepixmap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-pixmap uses .ppm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"]],"mem":null},
{"id":"n-f903a280","guard":[["hasAny",["applicationp2poverlayxml","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-overlay+xml uses .relo files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.numeral"]],"mem":null},
{"id":"n-03c4abc6","guard":[["hasAny",["imagexportablegraymap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["sense.lastWord"]],"mem":null},
{"id":"n-2324b582","guard":[["hasAny",["applicationxmsshortcut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type application/",{"slot":1},"-",{"slot":2},"-shortcut uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.roman"],["sense.unit"]],"mem":null},
{"id":"n-27df189e","guard":[["hasAny",["imagexportablepixmap","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .ppm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["sense.lastWord"]],"mem":null},
{"id":"n-44be2ae6","guard":[["hasAny",["applicationxmsshortcut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-",{"slot":2},"-shortcut uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["sense.unit"]],"mem":null},
{"id":"n-738e83f4","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.",{"slot":1},"-powerpoint.addin.macroenabled.",{"slot":2}," uses .ppam files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["sense.numeral"]],"mem":null},
{"id":"n-77d6345d","guard":[["hasAny",["item number","nth","position","textxsetext"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/",{"slot":1},"-",{"slot":2}," uses .etx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["sense.lastWord"]],"mem":null},
{"id":"n-b68959b3","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.",{"slot":1},"-powerpoint.slideshow.macroenabled.",{"slot":2}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["sense.numeral"]],"mem":null},
{"id":"n-de23a0cb","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," type application/vnd.",{"slot":1},"-powerpoint.slideshow.macroenabled.",{"slot":2}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.unit"],["sense.numeral"]],"mem":null},
{"id":"n-e5f0fd3c","guard":[["hasAny",["applicationxwaissource","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-",{"slot":2}," uses .src files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["sense.lastWord"]],"mem":null},
{"id":"n-199434b8","guard":[["hasAny",["imagexportablepixmap","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .ppm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-2731b013","guard":[["hasAny",["capitalise","capitalize","capitalize each word","item number","nth","position","textxsetext","title case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/",{"slot":1},"-",{"slot":2}," uses .etx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-28997f9e","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.",{"slot":1},"-powerpoint.addin.macroenabled.",{"slot":2}," uses .ppam files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["transform.swapCase",["sense.numeral"]]],"mem":null},
{"id":"n-6ac2325b","guard":[["hasAny",["applicationxwaissource","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-source uses .",{"slot":2}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-7d1296e5","guard":[["hasAny",["imagexportablegraymap","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-9d46db90","guard":[["hasAny",["capitalise","capitalize","capitalize each word","imagexportablegraymap","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-aa36de34","guard":[["hasAny",["invert case","item number","nth","position","swap case","textxsetext","toggle case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/",{"slot":1},"-",{"slot":2}," uses .etx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-c83acf59","guard":[["hasAny",["capitalise","capitalize","capitalize each word","imagexportablepixmap","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .ppm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-f38391f9","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.",{"slot":1},"-powerpoint.addin.macroenabled.",{"slot":2}," uses .ppam files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["transform.title",["sense.numeral"]]],"mem":null},
{"id":"n-0ca0ba33","guard":[["hasAny",["applicationxmsshortcut","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-ms-shortcut uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"]],"mem":null},
{"id":"n-0dfe1882","guard":[["hasAny",["each word","item number","nth","position","split into words","textxsetext","words"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/",{"slot":1},"-",{"slot":2}," uses .etx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-1f38a0a1","guard":[["hasAny",["each word","imagexportablepixmap","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .ppm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-5c72c0d5","guard":[["hasAny",["applicationxwaissource","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["sense.lastWord"],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-5e5a9899","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","element","item number","join","joined with","nth","position","separated by"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.",{"slot":1},"-powerpoint.addin.macroenabled.",{"slot":2}," uses .ppam files."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.join",["sense.units"],["sense.numeral"]],["sense.lastWord"]],"mem":null},
{"id":"n-7090b36a","guard":[["hasAny",["each word","imagexportablepixmap","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .ppm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-7a8d3613","guard":[["hasAny",["applicationvndfujitsuoasys2","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.fujitsu.",{"slot":2}," uses .oa2 files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.numeral"]],"mem":null},
{"id":"n-8abb5f65","guard":[["hasAny",["applicationxcdlink","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-cdlink uses .vcd files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"]],"mem":null},
{"id":"n-bdd061fe","guard":[["hasAny",["each word","item number","nth","position","split into words","textxsetext","words"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," text/",{"slot":1},"-",{"slot":2}," uses .etx files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e2cde06a","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},".decision-model+xml uses .1km files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.numeral"]],"mem":null},
{"id":"n-e9035407","guard":[["hasAny",["each word","imagexportablegraymap","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-f05b3e0b","guard":[["hasAny",["applicationp2poverlayxml","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-overlay+xml uses .relo files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.numeral"]],"mem":null},
{"id":"n-f2e64047","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.ms-powerpoint.slideshow.macroenabled.",{"slot":2}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.numeral"]],"mem":null},
{"id":"n-f534cfd6","guard":[["hasAny",["item number","nth","position","textxcomponent"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," text/",{"slot":2},"-component uses .htc files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"]],"mem":null},
{"id":"n-fa99bf48","guard":[["hasAny",["each word","imagexportablegraymap","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-0915ee62","guard":[["hasAny",["applicationxwaissource","invert case","item number","no vowels","nth","position","remove vowels","swap case","toggle case","without vowels"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.swapCase",["sense.lastWord"]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-21ef064e","guard":[["hasAny",["applicationp2poverlayxml","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-overlay+xml uses .relo files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.numeral"]]],"mem":null},
{"id":"n-2478703e","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},".decision-model+xml uses .1km files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.numeral"]]],"mem":null},
{"id":"n-34bad8b1","guard":[["hasAny",["applicationvndfujitsuoasys2","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.fujitsu.",{"slot":2}," uses .oa2 files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.numeral"]]],"mem":null},
{"id":"n-38ab4d4e","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["sense.numeral"]],"mem":null},
{"id":"n-431508cf","guard":[["hasAny",["applicationp2poverlayxml","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-overlay+xml uses .relo files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.noVowels",["sense.numeral"]]],"mem":null},
{"id":"n-6d9a7f17","guard":[["hasAny",["applicationxwaissource","capitalise","capitalize","capitalize each word","item number","no vowels","nth","position","remove vowels","title case","without vowels"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.title",["sense.lastWord"]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-afe7fa45","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.",{"slot":1},"-powerpoint.addin.macroenabled.",{"slot":2}," uses .ppam files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.split",["sense.unit"],["sense.numeral"]]],["sense.lastWord"]],"mem":null},
{"id":"n-b1d208cc","guard":[["hasAny",["applicationxmsshortcut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-",{"slot":3},"-shortcut uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["sense.unit"]],"mem":null},
{"id":"n-b986f6dd","guard":[["hasAny",["applicationvndmspowerpointaddinmacroenabled12","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/vnd.",{"slot":1},"-powerpoint.addin.macroenabled.",{"slot":2}," uses .ppam files."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.split",["sense.unit"],["sense.numeral"]]],["sense.lastWord"]],"mem":null},
{"id":"n-f16f89a4","guard":[["hasAny",["imagexportablegraymap","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.and",["transform.split",["sense.lastWord"],["sense.roman"]]]],"mem":null},
{"id":"n-f8147d85","guard":[["hasAny",["imagexportablegraymap","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," image/",{"slot":1},"-portable-",{"slot":2}," uses .pgm files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.list",["transform.split",["sense.lastWord"],["sense.roman"]]]],"mem":null},
{"id":"n-29942375","guard":[["hasAny",["applicationxmsshortcut","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-",{"slot":3},"-shortcut uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.swapCase",["sense.unit"]]],"mem":null},
{"id":"n-3cb7f142","guard":[["hasAny",["applicationxmsshortcut","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-",{"slot":3},"-shortcut uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["transform.title",["sense.unit"]]],"mem":null},
{"id":"n-762dae68","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.swapCase",["sense.unit"]],["sense.numeral"]],"mem":null},
{"id":"n-904a65b2","guard":[["hasAny",["applicationxmsshortcut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-",{"slot":3},"-shortcut uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.list",["sense.units"]]],"mem":null},
{"id":"n-99ed87af","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["transform.title",["sense.numeral"]]],"mem":null},
{"id":"n-a7cec9bc","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","capitalise","capitalize","capitalize each word","element","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.title",["sense.unit"]],["sense.numeral"]],"mem":null},
{"id":"n-bb7e96d4","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","no vowels","nth","position","remove vowels","without vowels"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["transform.noVowels",["sense.numeral"]]],"mem":null},
{"id":"n-c4ed62f5","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["transform.swapCase",["sense.numeral"]]],"mem":null},
{"id":"n-cd1095b8","guard":[["hasAny",["applicationxwaissource","each word","item number","no vowels","nth","position","remove vowels","split into words","without vowels","words"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.and",["transform.words",["sense.lastWord"]]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-e367207b","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["sense.units"]],["sense.numeral"]],"mem":null},
{"id":"n-f5ef8a1f","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["sense.units"]],["sense.numeral"]],"mem":null},
{"id":"n-f6d87d5f","guard":[["hasAny",["applicationxwaissource","each word","item number","no vowels","nth","position","remove vowels","split into words","without vowels","words"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.list",["transform.words",["sense.lastWord"]]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-f99c7500","guard":[["hasAny",["applicationxmsshortcut","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-",{"slot":3},"-shortcut uses .lnk files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.and",["sense.units"]]],"mem":null},
{"id":"n-0975feeb","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["render.and",["transform.words",["sense.numeral"]]]],"mem":null},
{"id":"n-28e9866a","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","join","joined with","nth","position","separated by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["transform.join",["sense.units"],["sense.numeral"]],["sense.numeral"]],"mem":null},
{"id":"n-3459fab7","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},".decision-model+xml uses .1km files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.split",["sense.numeral"],["sense.lastWord"]]]],"mem":null},
{"id":"n-3ebbd9e9","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","delete","element","item number","nth","position","remove","strip out","without"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["transform.remove",["sense.numeral"],["sense.lastWord"]]],"mem":null},
{"id":"n-42bec761","guard":[["hasAny",["applicationxwaissource","item number","no vowels","nth","position","remove vowels","separate by","split","split by","without vowels"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.and",["transform.split",["sense.lastWord"],["sense.roman"]]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-54d0583a","guard":[["hasAny",["applicationvndfujitsuoasys2","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.fujitsu.",{"slot":2}," uses .oa2 files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.split",["sense.numeral"],["sense.lastWord"]]]],"mem":null},
{"id":"n-6270022b","guard":[["hasAny",["applicationvndfujitsuoasys2","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.fujitsu.",{"slot":2}," uses .oa2 files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.split",["sense.numeral"],["sense.lastWord"]]]],"mem":null},
{"id":"n-682d5a25","guard":[["hasAny",["applicationp2poverlayxml","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-overlay+xml uses .relo files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.split",["sense.numeral"],["sense.lastWord"]]]],"mem":null},
{"id":"n-7ff7c184","guard":[["hasAny",["applicationp2poverlayxml","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/",{"slot":2},"-overlay+xml uses .relo files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.split",["sense.numeral"],["sense.lastWord"]]]],"mem":null},
{"id":"n-a92ae9de","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","each word","element","item number","nth","position","split into words","words"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["render.list",["transform.words",["sense.numeral"]]]],"mem":null},
{"id":"n-b6b6ac56","guard":[["hasAny",["applicationxwaissource","item number","no vowels","nth","position","remove vowels","separate by","split","split by","without vowels"]]],"pyramid":["render.template",{"lit":["The media ",{"slot":0}," application/",{"slot":1},"-wais-",{"slot":2}," uses .",{"slot":3}," files."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.roman"],["render.list",["transform.split",["sense.lastWord"],["sense.roman"]]],["transform.noVowels",["sense.lastWord"]]],"mem":null},
{"id":"n-d787e7a5","guard":[["hasAny",["applicationvnd1000mindsdecisionmodelxml","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},".decision-model+xml uses .1km files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.split",["sense.numeral"],["sense.lastWord"]]]],"mem":null},
{"id":"n-2a89c035","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["render.list",["transform.split",["sense.numeral"],["sense.lastWord"]]]],"mem":null},
{"id":"n-5cc2734c","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.split",["sense.unit"],["sense.numeral"]]],["sense.numeral"]],"mem":null},
{"id":"n-98d8d122","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.split",["sense.unit"],["sense.numeral"]]],["sense.numeral"]],"mem":null},
{"id":"n-abc9a39a","guard":[["hasAny",["applicationvndmspowerpointslideshowmacroenabled12","element","item number","nth","position","separate by","split","split by"]]],"pyramid":["render.template",{"lit":["The ",{"slot":0}," ",{"slot":1}," application/vnd.",{"slot":2},"-powerpoint.slideshow.macroenabled.",{"slot":3}," uses .ppsm files."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":4}],["sense.unit"],["render.and",["transform.split",["sense.numeral"],["sense.lastWord"]]]],"mem":null},
{"id":"n-7043d380","guard":[["hasAny",["applicationcalendarxml","applicationntriples","applicationsrgsxml","applicationvnddenovofcselayoutlink","applicationvndgeogebrafile","applicationvndgrooveaccount","applicationvndgroovetooltemplate","applicationvndhpjlyt","applicationvndlotusapproach","applicationvndmshtmlhelp","applicationvndoasisopendocumentformulatemplate","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate","applicationvndpocketlearn","applicationvndproteusmagazine","applicationvndstardivisioncalc","applicationvndsunxmldrawtemplate","applicationxcdlink","applicationxmsshortcut","applicationxwaissource","files","imagevndfastbidsheet","imagexportablegraymap","imagexportablepixmap","modelvndopengex","textvndfmiflexstor","textxcomponent","textxsetext"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type image/vnd.fastbidsheet use":"The media type image/vnd.fastbidsheet uses .fbs files.","give the extension for application/vnd.yamaha.openscoreformat files":"The media type application/vnd.yamaha.openscoreformat uses .osf files.","what file extension does the media type application/x-cdlink use":"The media type application/x-cdlink uses .vcd files.","give the extension for application/vnd.osgi.subsystem files":"The media type application/vnd.osgi.subsystem uses .esa files.","what file extension does the media type application/x-ms-shortcut use":"The media type application/x-ms-shortcut uses .lnk files.","which extension goes with the MIME type application/vnd.denovo.fcselayout-link":"The media type application/vnd.denovo.fcselayout-link uses .fe_launch files.","which extension goes with the MIME type application/calendar+xml":"The media type application/calendar+xml uses .xcs files.","what file extension does the media type application/vnd.stardivision.calc use":"The media type application/vnd.stardivision.calc uses .sdc files.","give the extension for application/vnd.openblox.game+xml files":"The media type application/vnd.openblox.game+xml uses .obgx files.","which extension goes with the MIME type text/vnd.fmi.flexstor":"The media type text/vnd.fmi.flexstor uses .flx files.","what file extension does the media type application/vnd.proteus.magazine use":"The media type application/vnd.proteus.magazine uses .mgz files.","which extension goes with the MIME type application/x-wais-source":"The media type application/x-wais-source uses .src files.","what file extension does the media type application/vnd.oasis.opendocument.formula-template use":"The media type application/vnd.oasis.opendocument.formula-template uses .odft files.","give the extension for application/vnd.openxmlformats-officedocument.wordprocessingml.document files":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx files.","what file extension does the media type application/vnd.openxmlformats-officedocument.presentationml.slideshow use":"The media type application/vnd.openxmlformats-officedocument.presentationml.slideshow uses .ppsx files.","what file extension does the media type text/x-component use":"The media type text/x-component uses .htc files.","which extension goes with the MIME type application/vnd.sun.xml.draw.template":"The media type application/vnd.sun.xml.draw.template uses .std files.","give the extension for application/vnd.llamagraphics.life-balance.desktop files":"The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd files.","which extension goes with the MIME type text/x-setext":"The media type text/x-setext uses .etx files.","which extension goes with the MIME type image/x-portable-pixmap":"The media type image/x-portable-pixmap uses .ppm files.","which extension goes with the MIME type application/srgs+xml":"The media type application/srgs+xml uses .grxml files.","give the extension for application/vnd.ibm.rights-management files":"The media type application/vnd.ibm.rights-management uses .irm files.","give the extension for application/vnd.stepmania.stepchart files":"The media type application/vnd.stepmania.stepchart uses .sm files.","what file extension does the media type application/vnd.lotus-approach use":"The media type application/vnd.lotus-approach uses .apr files.","which extension goes with the MIME type application/vnd.pocketlearn":"The media type application/vnd.pocketlearn uses .plf files.","give the extension for application/vnd.stardivision.impress files":"The media type application/vnd.stardivision.impress uses .sdd files.","which extension goes with the MIME type application/vnd.groove-account":"The media type application/vnd.groove-account uses .gac files.","which extension goes with the MIME type application/vnd.openxmlformats-officedocument.spreadsheetml.template":"The media type application/vnd.openxmlformats-officedocument.spreadsheetml.template uses .xltx files.","which extension goes with the MIME type application/vnd.geogebra.file":"The media type application/vnd.geogebra.file uses .ggb files.","give the extension for application/vnd.epson.quickanime files":"The media type application/vnd.epson.quickanime uses .qam files.","what file extension does the media type model/vnd.opengex use":"The media type model/vnd.opengex uses .ogex files.","which extension goes with the MIME type application/vnd.openxmlformats-officedocument.wordprocessingml.template":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.template uses .dotx files.","what file extension does the media type application/n-triples use":"The media type application/n-triples uses .nt files.","which extension goes with the MIME type application/vnd.ms-htmlhelp":"The media type application/vnd.ms-htmlhelp uses .chm files.","what file extension does the media type application/vnd.groove-tool-template use":"The media type application/vnd.groove-tool-template uses .tpl files.","give the extension for application/vnd.intergeo files":"The media type application/vnd.intergeo uses .i2g files.","which extension goes with the MIME type application/vnd.hp-jlyt":"The media type application/vnd.hp-jlyt uses .jlt files.","which extension goes with the MIME type image/x-portable-graymap":"The media type image/x-portable-graymap uses .pgm files.","give the extension for application/vnd.nato.bindingdataobject+xml files":"The media type application/vnd.nato.bindingdataobject+xml uses .bdo files."}}},
{"id":"n-09c9bc04","guard":[["has","applicationvndgrooveaccount"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.groove-account":"The media type application/vnd.groove-account uses .gac files."}}},
{"id":"n-0e24bf19","guard":[["has","applicationvndgroovetooltemplate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.groove-tool-template use":"The media type application/vnd.groove-tool-template uses .tpl files."}}},
{"id":"n-1155f7a5","guard":[["has","applicationvndstepmaniastepchart"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.stepmania.stepchart files":"The media type application/vnd.stepmania.stepchart uses .sm files."}}},
{"id":"n-14175b51","guard":[["has","textxcomponent"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type text/x-component use":"The media type text/x-component uses .htc files."}}},
{"id":"n-21cb01b8","guard":[["has","applicationxcdlink"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/x-cdlink use":"The media type application/x-cdlink uses .vcd files."}}},
{"id":"n-270c6665","guard":[["has","applicationvndopenxmlformatsofficedocumentpresentationmlslideshow"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.openxmlformats-officedocument.presentationml.slideshow use":"The media type application/vnd.openxmlformats-officedocument.presentationml.slideshow uses .ppsx files."}}},
{"id":"n-31643fe6","guard":[["has","applicationvndlotusapproach"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.lotus-approach use":"The media type application/vnd.lotus-approach uses .apr files."}}},
{"id":"n-3cebf45e","guard":[["has","applicationvndsunxmldrawtemplate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.sun.xml.draw.template":"The media type application/vnd.sun.xml.draw.template uses .std files."}}},
{"id":"n-41fa8974","guard":[["has","applicationvndoasisopendocumentformulatemplate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.oasis.opendocument.formula-template use":"The media type application/vnd.oasis.opendocument.formula-template uses .odft files."}}},
{"id":"n-482346e4","guard":[["has","textvndfmiflexstor"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type text/vnd.fmi.flexstor":"The media type text/vnd.fmi.flexstor uses .flx files."}}},
{"id":"n-497e5bef","guard":[["has","applicationntriples"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/n-triples use":"The media type application/n-triples uses .nt files."}}},
{"id":"n-4ca86782","guard":[["has","imagexportablepixmap"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type image/x-portable-pixmap":"The media type image/x-portable-pixmap uses .ppm files."}}},
{"id":"n-4fa78f55","guard":[["has","applicationvndproteusmagazine"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.proteus.magazine use":"The media type application/vnd.proteus.magazine uses .mgz files."}}},
{"id":"n-56dfeb3d","guard":[["has","applicationvndyamahaopenscoreformat"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.yamaha.openscoreformat files":"The media type application/vnd.yamaha.openscoreformat uses .osf files."}}},
{"id":"n-57f41674","guard":[["has","applicationvndnatobindingdataobjectxml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.nato.bindingdataobject+xml files":"The media type application/vnd.nato.bindingdataobject+xml uses .bdo files."}}},
{"id":"n-5e12543d","guard":[["has","applicationvndstardivisionimpress"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.stardivision.impress files":"The media type application/vnd.stardivision.impress uses .sdd files."}}},
{"id":"n-5fd72a98","guard":[["has","applicationcalendarxml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/calendar+xml":"The media type application/calendar+xml uses .xcs files."}}},
{"id":"n-63cd88a6","guard":[["has","applicationxwaissource"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/x-wais-source":"The media type application/x-wais-source uses .src files."}}},
{"id":"n-68a28d34","guard":[["has","applicationvndhpjlyt"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.hp-jlyt":"The media type application/vnd.hp-jlyt uses .jlt files."}}},
{"id":"n-769d8bde","guard":[["has","applicationvndibmrightsmanagement"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.ibm.rights-management files":"The media type application/vnd.ibm.rights-management uses .irm files."}}},
{"id":"n-7c319a84","guard":[["has","applicationvndmshtmlhelp"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.ms-htmlhelp":"The media type application/vnd.ms-htmlhelp uses .chm files."}}},
{"id":"n-7e32ebb4","guard":[["has","applicationvndopenbloxgamexml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.openblox.game+xml files":"The media type application/vnd.openblox.game+xml uses .obgx files."}}},
{"id":"n-7f52b971","guard":[["has","applicationvndllamagraphicslifebalancedesktop"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.llamagraphics.life-balance.desktop files":"The media type application/vnd.llamagraphics.life-balance.desktop uses .lbd files."}}},
{"id":"n-93c359a5","guard":[["has","imagevndfastbidsheet"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type image/vnd.fastbidsheet use":"The media type image/vnd.fastbidsheet uses .fbs files."}}},
{"id":"n-952b7c26","guard":[["has","applicationvndopenxmlformatsofficedocumentspreadsheetmltemplate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.openxmlformats-officedocument.spreadsheetml.template":"The media type application/vnd.openxmlformats-officedocument.spreadsheetml.template uses .xltx files."}}},
{"id":"n-9ba7a75d","guard":[["has","imagexportablegraymap"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type image/x-portable-graymap":"The media type image/x-portable-graymap uses .pgm files."}}},
{"id":"n-a01e740e","guard":[["has","applicationvndopenxmlformatsofficedocumentwordprocessingmltemplate"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.openxmlformats-officedocument.wordprocessingml.template":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.template uses .dotx files."}}},
{"id":"n-b3348641","guard":[["has","applicationvndgeogebrafile"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.geogebra.file":"The media type application/vnd.geogebra.file uses .ggb files."}}},
{"id":"n-b70293f5","guard":[["has","applicationvndpocketlearn"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.pocketlearn":"The media type application/vnd.pocketlearn uses .plf files."}}},
{"id":"n-b99b3cc8","guard":[["has","applicationvnddenovofcselayoutlink"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/vnd.denovo.fcselayout-link":"The media type application/vnd.denovo.fcselayout-link uses .fe_launch files."}}},
{"id":"n-bf71e94b","guard":[["has","applicationvndepsonquickanime"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.epson.quickanime files":"The media type application/vnd.epson.quickanime uses .qam files."}}},
{"id":"n-c88e3b95","guard":[["has","applicationsrgsxml"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type application/srgs+xml":"The media type application/srgs+xml uses .grxml files."}}},
{"id":"n-d8875e8a","guard":[["has","applicationvndopenxmlformatsofficedocumentwordprocessingmldocument"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.openxmlformats-officedocument.wordprocessingml.document files":"The media type application/vnd.openxmlformats-officedocument.wordprocessingml.document uses .docx files."}}},
{"id":"n-dcf64810","guard":[["has","applicationxmsshortcut"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/x-ms-shortcut use":"The media type application/x-ms-shortcut uses .lnk files."}}},
{"id":"n-de93de9d","guard":[["has","textxsetext"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which extension goes with the MIME type text/x-setext":"The media type text/x-setext uses .etx files."}}},
{"id":"n-e31d0684","guard":[["has","applicationvndstardivisioncalc"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type application/vnd.stardivision.calc use":"The media type application/vnd.stardivision.calc uses .sdc files."}}},
{"id":"n-e3230af0","guard":[["has","applicationvndosgisubsystem"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.osgi.subsystem files":"The media type application/vnd.osgi.subsystem uses .esa files."}}},
{"id":"n-e35caa6c","guard":[["has","applicationvndintergeo"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"give the extension for application/vnd.intergeo files":"The media type application/vnd.intergeo uses .i2g files."}}},
{"id":"n-e3e4d4e0","guard":[["has","modelvndopengex"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"what file extension does the media type model/vnd.opengex use":"The media type model/vnd.opengex uses .ogex files."}}}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"what file extension does the media type image/vnd.fastbidsheet use","expect":{"contains":["fbs"],"notRefusal":true}},{"q":"give the extension for application/vnd.yamaha.openscoreformat files","expect":{"contains":["osf"],"notRefusal":true}},{"q":"what file extension does the media type application/x-cdlink use","expect":{"contains":["vcd"],"notRefusal":true}},{"q":"give the extension for application/vnd.osgi.subsystem files","expect":{"contains":["esa"],"notRefusal":true}},{"q":"which extension goes with the MIME type application/vnd.ms-powerpoint.addin.macroenabled.12","expect":{"contains":["ppam"],"notRefusal":true}},{"q":"what file extension does the media type application/x-ms-shortcut use","expect":{"contains":["lnk"],"notRefusal":true}},{"q":"which extension goes with the MIME type application/vnd.denovo.fcselayout-link","expect":{"contains":["fe_launch"],"notRefusal":true}},{"q":"which extension goes with the MIME type application/calendar+xml","expect":{"contains":["xcs"],"notRefusal":true}},{"q":"what file extension does the media type application/vnd.stardivision.calc use","expect":{"contains":["sdc"],"notRefusal":true}},{"q":"give the extension for application/vnd.openblox.game+xml files","expect":{"contains":["obgx"],"notRefusal":true}},{"q":"which extension goes with the MIME type text/vnd.fmi.flexstor","expect":{"contains":["flx"],"notRefusal":true}},{"q":"what file extension does the media type application/vnd.proteus.magazine use","expect":{"contains":["mgz"],"notRefusal":true}},{"q":"which extension goes with the MIME type application/x-wais-source","expect":{"contains":["src"],"notRefusal":true}},{"q":"what file extension does the media type application/vnd.oasis.opendocument.formula-template use","expect":{"contains":["odft"],"notRefusal":true}},{"q":"give the extension for application/vnd.openxmlformats-officedocument.wordprocessingml.document files","expect":{"contains":["docx"],"notRefusal":true}},{"q":"what file extension does the media type application/p2p-overlay+xml use","expect":{"contains":["relo"],"notRefusal":true}},{"q":"what file extension does the media type application/vnd.openxmlformats-officedocument.presentationml.slideshow use","expect":{"contains":["ppsx"],"notRefusal":true}},{"q":"what file extension does the media type text/x-component use","expect":{"contains":["htc"],"notRefusal":true}},{"q":"which extension goes with the MIME type application/vnd.sun.xml.draw.template","expect":{"contains":["std"],"notRefusal":true}},{"q":"give the extension for application/vnd.llamagraphics.life-balance.desktop files","expect":{"contains":["lbd"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
