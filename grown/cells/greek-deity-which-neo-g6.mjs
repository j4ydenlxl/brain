// greek-deity-which-neo-g6.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the
// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.
export const meta = Object.freeze({"id":"greek-deity-which-neo-g6","class":"greek-deity-which","generation":6,"lane":"neo","grownFrom":["pick a Greek deity from Chronos, Mars or Lakshmi","among Venus, Ganesha or Ares, which one is a Greek deity","which of these is a Greek deity: Saturn, Demeter or Vesta","which of these is a Greek deity: Horus, Athena or Vulcan","which of these is a Greek deity: Uranus, Horus or Ganesha","which of these is a Greek deity: Hypnos, Osiris or Ganesha","pick a Greek deity from Diana, Phanes or Mars","pick a Greek deity from Freya, Odin or Tartarus","pick a Greek deity from Thalassa, Diana or Loki","which of these is a Greek deity: Thanatos, Shiva or Loki","which of these is a Greek deity: Vulcan, Aether or Loki","pick a Greek deity from Dionysus, Loki or Set","which of these is a Greek deity: Minerva, Poseidon or Horus","among Ganesha, Gaia or Baldur, which one is a Greek deity","among Hades, Venus or Isis, which one is a Greek deity","pick a Greek deity from Horus, Hephaestus or Brahma","among Freya, Hera or Ra, which one is a Greek deity","among Loki, Zeus or Minerva, which one is a Greek deity","which of these is a Greek deity: Ganesha, Mars or Artemis","pick a Greek deity from Ganesha, Apollo or Set"],"version":1});

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
{"id":"n-503fc9c7","guard":[["has","deity"]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Chronos, Mars or Lakshmi":"Chronos is a Greek deity.","among Venus, Ganesha or Ares, which one is a Greek deity":"Ares is a Greek deity.","which of these is a Greek deity: Saturn, Demeter or Vesta":"Demeter is a Greek deity.","which of these is a Greek deity: Horus, Athena or Vulcan":"Athena is a Greek deity.","which of these is a Greek deity: Uranus, Horus or Ganesha":"Uranus is a Greek deity.","which of these is a Greek deity: Hypnos, Osiris or Ganesha":"Hypnos is a Greek deity.","pick a Greek deity from Diana, Phanes or Mars":"Phanes is a Greek deity.","pick a Greek deity from Freya, Odin or Tartarus":"Tartarus is a Greek deity.","pick a Greek deity from Thalassa, Diana or Loki":"Thalassa is a Greek deity.","which of these is a Greek deity: Thanatos, Shiva or Loki":"Thanatos is a Greek deity.","which of these is a Greek deity: Vulcan, Aether or Loki":"Aether is a Greek deity.","pick a Greek deity from Dionysus, Loki or Set":"Dionysus is a Greek deity.","which of these is a Greek deity: Minerva, Poseidon or Horus":"Poseidon is a Greek deity.","among Ganesha, Gaia or Baldur, which one is a Greek deity":"Gaia is a Greek deity.","among Hades, Venus or Isis, which one is a Greek deity":"Hades is a Greek deity.","pick a Greek deity from Horus, Hephaestus or Brahma":"Hephaestus is a Greek deity.","among Freya, Hera or Ra, which one is a Greek deity":"Hera is a Greek deity.","among Loki, Zeus or Minerva, which one is a Greek deity":"Zeus is a Greek deity.","which of these is a Greek deity: Ganesha, Mars or Artemis":"Artemis is a Greek deity.","pick a Greek deity from Ganesha, Apollo or Set":"Apollo is a Greek deity.","among Tyr, Janus or Eros, which one is a Greek deity":"Eros is a Greek deity.","pick a Greek deity from Vulcan, Baldur or Aphrodite":"Aphrodite is a Greek deity.","among Vesta, Hermes or Horus, which one is a Greek deity":"Hermes is a Greek deity.","among Isis, Erebus or Saturn, which one is a Greek deity":"Erebus is a Greek deity.","which of these is a Greek deity: Venus, Chaos or Vesta":"Chaos is a Greek deity."}}},
{"id":"n-e19ef728","guard":[["has","deity"],["has","or"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Chronos, Mars or Lakshmi":"Chronos is a Greek deity.","among Venus, Ganesha or Ares, which one is a Greek deity":"Ares is a Greek deity.","which of these is a Greek deity: Saturn, Demeter or Vesta":"Demeter is a Greek deity.","which of these is a Greek deity: Horus, Athena or Vulcan":"Athena is a Greek deity.","which of these is a Greek deity: Uranus, Horus or Ganesha":"Uranus is a Greek deity.","which of these is a Greek deity: Hypnos, Osiris or Ganesha":"Hypnos is a Greek deity.","pick a Greek deity from Diana, Phanes or Mars":"Phanes is a Greek deity.","pick a Greek deity from Freya, Odin or Tartarus":"Tartarus is a Greek deity.","pick a Greek deity from Thalassa, Diana or Loki":"Thalassa is a Greek deity.","which of these is a Greek deity: Thanatos, Shiva or Loki":"Thanatos is a Greek deity.","which of these is a Greek deity: Vulcan, Aether or Loki":"Aether is a Greek deity.","pick a Greek deity from Dionysus, Loki or Set":"Dionysus is a Greek deity.","which of these is a Greek deity: Minerva, Poseidon or Horus":"Poseidon is a Greek deity.","among Ganesha, Gaia or Baldur, which one is a Greek deity":"Gaia is a Greek deity.","among Hades, Venus or Isis, which one is a Greek deity":"Hades is a Greek deity.","pick a Greek deity from Horus, Hephaestus or Brahma":"Hephaestus is a Greek deity.","among Freya, Hera or Ra, which one is a Greek deity":"Hera is a Greek deity.","among Loki, Zeus or Minerva, which one is a Greek deity":"Zeus is a Greek deity.","which of these is a Greek deity: Ganesha, Mars or Artemis":"Artemis is a Greek deity.","pick a Greek deity from Ganesha, Apollo or Set":"Apollo is a Greek deity.","among Tyr, Janus or Eros, which one is a Greek deity":"Eros is a Greek deity.","pick a Greek deity from Vulcan, Baldur or Aphrodite":"Aphrodite is a Greek deity.","among Vesta, Hermes or Horus, which one is a Greek deity":"Hermes is a Greek deity.","among Isis, Erebus or Saturn, which one is a Greek deity":"Erebus is a Greek deity.","which of these is a Greek deity: Venus, Chaos or Vesta":"Chaos is a Greek deity."}}},
{"id":"n-8cdc374c","guard":[["has","deity"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"deity"}]]],"mem":{"table":{"from Chronos, Mars or Lakshmi":"Chronos is a Greek deity.","Saturn, Demeter or Vesta":"Demeter is a Greek deity.","Horus, Athena or Vulcan":"Athena is a Greek deity.","Uranus, Horus or Ganesha":"Uranus is a Greek deity.","Hypnos, Osiris or Ganesha":"Hypnos is a Greek deity.","from Diana, Phanes or Mars":"Phanes is a Greek deity.","from Freya, Odin or Tartarus":"Tartarus is a Greek deity.","from Thalassa, Diana or Loki":"Thalassa is a Greek deity.","Thanatos, Shiva or Loki":"Thanatos is a Greek deity.","Vulcan, Aether or Loki":"Aether is a Greek deity.","from Dionysus, Loki or Set":"Dionysus is a Greek deity.","Minerva, Poseidon or Horus":"Poseidon is a Greek deity.","from Horus, Hephaestus or Brahma":"Hephaestus is a Greek deity.","Ganesha, Mars or Artemis":"Artemis is a Greek deity.","from Ganesha, Apollo or Set":"Apollo is a Greek deity.","from Vulcan, Baldur or Aphrodite":"Aphrodite is a Greek deity.","Venus, Chaos or Vesta":"Chaos is a Greek deity."}}},
{"id":"n-9e886aba","guard":[["hasAny",["a to z","alphabetical","alphabetize","brahma","diana","dionysus","longest","longest one","longest word","mars","odin","poseidon","saturn","shiva","vesta","vulcan"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.words"]]]],"mem":null},
{"id":"n-27b6061e","guard":[["hasAny",["a to z","alphabetical","alphabetize","brahma","diana","dionysus","each word","longest","longest one","longest word","mars","odin","poseidon","saturn","shiva","split into words","vesta","vulcan"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["transform.words",["sense.text"]]]]],"mem":null},
{"id":"n-b7bcfc56","guard":[["hasAny",["aphrodite","chronos","diana","dionysus","first n","horus","hypnos","longest","longest one","longest word","odin","saturn","shiva","take"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":10}]]],"mem":null},
{"id":"n-7aced11c","guard":[["hasAny",["aphrodite","chronos","diana","dionysus","from position","horus","hypnos","items from to","longest","longest one","longest word","odin","saturn","shiva","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":3},{"lit":10}]]],"mem":null},
{"id":"n-9e15e486","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","hermes","longest","longest one","longest word","odin","poseidon","saturn","shiva"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-bdaf89e8","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","hermes","longest","longest one","longest word","odin","poseidon","saturn","shiva"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["sense.words"]]],"mem":null},
{"id":"n-1117b0c3","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","each word","hermes","longest","longest one","longest word","odin","poseidon","saturn","shiva","split into words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.text"]]]],"mem":null},
{"id":"n-74a82a1f","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","hermes","invert case","longest","longest one","longest word","odin","poseidon","saturn","shiva","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.content"]]]],"mem":null},
{"id":"n-8b020fca","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","hermes","invert case","longest","longest one","longest word","odin","poseidon","saturn","shiva","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-98e88dc4","guard":[["hasAny",["aphrodite","athena","brahma","capitalise","capitalize","capitalize each word","chronos","diana","dionysus","hermes","longest","longest one","longest word","odin","poseidon","saturn","shiva","title case"]],["has","or"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.words"]]]],"mem":null},
{"id":"n-db4affb3","guard":[["hasAny",["aphrodite","athena","brahma","capitalise","capitalize","capitalize each word","chronos","diana","dionysus","hermes","longest","longest one","longest word","odin","poseidon","saturn","shiva","title case"]],["has","or"]],"pyramid":["render.str",["transform.title",["aggregate.longest",["sense.content"]]]],"mem":null},
{"id":"n-79ca44d4","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","longest","longest one","longest word","normalise","normalize","odin","poseidon","saturn","shiva","simplify the text","vesta"]],["has","or"]],"pyramid":["render.str",["transform.norm",["aggregate.longest",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-b17fbd57","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","each word","hermes","invert case","longest","longest one","longest word","odin","poseidon","saturn","shiva","split into words","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.swapCase",["sense.text"]]]]],"mem":null},
{"id":"n-2937f8fe","guard":[["hasAny",["brahma","chaos","demeter","diana","dionysus","from position","items from to","longest","longest one","longest word","mars","odin","poseidon","slice","vulcan"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-6af8bad1","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","from position","hermes","items from to","longest","longest one","longest word","odin","poseidon","saturn","shiva","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-7decd538","guard":[["hasAny",["aphrodite","athena","brahma","chronos","diana","dionysus","from position","hermes","items from to","longest","longest one","longest word","odin","poseidon","saturn","shiva","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-ab98c6b8","guard":[["hasAny",["aphrodite","athena","brahma","chronos","demeter","diana","dionysus","from position","hypnos","items from to","longest","longest one","longest word","odin","poseidon","shiva","slice","uranus"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":4},{"lit":10}]]],"mem":null},
{"id":"n-ac00ce8b","guard":[["hasAny",["aether","ares","athena","brahma","chaos","demeter","diana","dionysus","eros","from position","items from to","longest","longest one","longest word","mars","poseidon","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-e616e96c","guard":[["hasAny",["aether","aphrodite","artemis","backwards","brahma","demeter","diana","dionysus","hermes","longest","longest one","longest word","odin","poseidon","reverse order","reversed","shiva"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.words"]]]],"mem":null},
{"id":"n-4de21ba9","guard":[["hasAny",["aether","aphrodite","artemis","backwards","brahma","demeter","diana","dionysus","each word","hermes","longest","longest one","longest word","odin","poseidon","reverse order","reversed","shiva","split into words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.words",["sense.text"]]]]],"mem":null},
{"id":"n-135030c0","guard":[["hasAny",["athena","brahma","chronos","diana","dionysus","from position","hera","hermes","items from to","longest","longest one","longest word","poseidon","saturn","shiva","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-4454ab47","guard":[["hasAny",["athena","chronos","dionysus","from position","hera","hermes","hypnos","items from to","longest","longest one","longest word","poseidon","saturn","shiva","slice","thalassa","uranus"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-3b0feae4","guard":[["hasAny",["aphrodite","athena","brahma","chronos","demeter","diana","dionysus","each word","longest","longest one","longest word","odin","poseidon","shiva","split into words","words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"greek"}]]]],"mem":null},
{"id":"n-75725382","guard":[["hasAny",["athena","brahma","chronos","diana","dionysus","first n","hermes","longest","longest one","longest word","poseidon","saturn","shiva","take"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-a37f9df1","guard":[["hasAny",["athena","chronos","dionysus","first n","hermes","hypnos","longest","longest one","longest word","poseidon","saturn","shiva","take","thalassa","uranus"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-dc87d5a4","guard":[["hasAny",["aphrodite","athena","brahma","chronos","demeter","diana","dionysus","from position","items from to","longest","longest one","longest word","odin","poseidon","shiva","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-9a7f28e7","guard":[["hasAny",["aether","ares","athena","chaos","chronos","demeter","dionysus","eros","item number","nth","poseidon","position","thalassa"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":4}]],"mem":null},
{"id":"n-2136fa83","guard":[["hasAny",["a to z","alphabetical","alphabetize","aphrodite","backwards","brahma","demeter","diana","dionysus","hermes","longest","longest one","longest word","odin","poseidon","reverse order","reversed","shiva"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.sortStrs",["sense.content"]]]]],"mem":null},
{"id":"n-c2075777","guard":[["hasAny",["aether","ares","athena","capitalise","capitalize","capitalize each word","chaos","chronos","demeter","dionysus","eros","item number","nth","poseidon","position","thalassa","title case"]],["has","or"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-c36f3306","guard":[["hasAny",["a to z","alphabetical","alphabetize","aphrodite","backwards","brahma","demeter","diana","dionysus","hermes","longest","longest one","longest word","odin","poseidon","reverse order","reversed","shiva"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.sortStrs",["sense.words"]]]]],"mem":null},
{"id":"n-cf85f98e","guard":[["hasAny",["aether","ares","athena","chaos","chronos","demeter","dionysus","eros","invert case","item number","nth","poseidon","position","swap case","thalassa","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-45596070","guard":[["has","deity"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"of"}]]],"mem":{"table":{"these is a Greek deity: Saturn, Demeter or Vesta":"Demeter is a Greek deity.","these is a Greek deity: Horus, Athena or Vulcan":"Athena is a Greek deity.","these is a Greek deity: Uranus, Horus or Ganesha":"Uranus is a Greek deity.","these is a Greek deity: Hypnos, Osiris or Ganesha":"Hypnos is a Greek deity.","these is a Greek deity: Thanatos, Shiva or Loki":"Thanatos is a Greek deity.","these is a Greek deity: Vulcan, Aether or Loki":"Aether is a Greek deity.","these is a Greek deity: Minerva, Poseidon or Horus":"Poseidon is a Greek deity.","these is a Greek deity: Ganesha, Mars or Artemis":"Artemis is a Greek deity.","these is a Greek deity: Venus, Chaos or Vesta":"Chaos is a Greek deity."}}},
{"id":"n-bdd4932d","guard":[["hasAny",["a to z","alphabetical","alphabetize","artemis","chaos","demeter","each word","longest","longest one","longest word","odin","poseidon","shiva","split into words","vulcan"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["transform.words",["sense.subject"]]]]],"mem":null},
{"id":"n-8c7bf835","guard":[["has","deity"]],"pyramid":["render.str",["memory.lookup",["sense.after",{"lit":"from"}]]],"mem":{"table":{"Chronos, Mars or Lakshmi":"Chronos is a Greek deity.","Diana, Phanes or Mars":"Phanes is a Greek deity.","Freya, Odin or Tartarus":"Tartarus is a Greek deity.","Thalassa, Diana or Loki":"Thalassa is a Greek deity.","Dionysus, Loki or Set":"Dionysus is a Greek deity.","Horus, Hephaestus or Brahma":"Hephaestus is a Greek deity.","Ganesha, Apollo or Set":"Apollo is a Greek deity.","Vulcan, Baldur or Aphrodite":"Aphrodite is a Greek deity."}}},
{"id":"n-d47c1b3b","guard":[["hasAny",["erebus","gaia","hera","hermes","hypnos","item number","nth","position","shiva","uranus","zeus"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-195e4d6c","guard":[["hasAny",["aether","apollo","athena","backwards","brahma","chaos","demeter","item number","nth","phanes","poseidon","position","reverse order","reversed"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-2e012352","guard":[["hasAny",["capitalise","capitalize","capitalize each word","erebus","gaia","hera","hermes","hypnos","item number","nth","position","shiva","title case","uranus","zeus"]],["has","which"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-332e4c81","guard":[["hasAny",["aether","apollo","athena","backwards","brahma","chaos","demeter","item number","nth","phanes","poseidon","position","reverse order","reversed"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":2}]],"mem":null},
{"id":"n-49c40014","guard":[["hasAny",["erebus","gaia","hera","hermes","hypnos","invert case","item number","nth","position","shiva","swap case","toggle case","uranus","zeus"]],["has","which"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-60738242","guard":[["hasAny",["a to z","alphabetical","alphabetize","artemis","loki","longest","longest one","longest word","minerva","vesta","vulcan"]]],"pyramid":["render.str",["aggregate.longest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-089dea26","guard":[["hasAny",["a to z","alphabetical","alphabetize","apollo","artemis","chaos","chronos","item number","nth","position","vulcan"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":2}]],"mem":null},
{"id":"n-5593d254","guard":[["hasAny",["aphrodite","brahma","diana","each word","freya","loki","longest","longest one","longest word","mars","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"from"}]]]],"mem":null},
{"id":"n-6232d56b","guard":[["hasAny",["aether","aphrodite","artemis","backwards","demeter","each word","longest","longest one","longest word","odin","poseidon","reverse order","reversed","shiva","split into words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.words",["sense.subject"]]]]],"mem":null},
{"id":"n-d67845f1","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","item number","longest","longest one","longest word","nth","odin","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-db9529b4","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","item number","longest","longest one","longest word","nth","odin","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7cbfedd0","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","item number","longest","longest one","longest word","nth","odin","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-14acabc7","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","item number","longest","longest one","longest word","lower case","lowercase","nth","odin","position","small letters"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.lower",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2f61eb99","guard":[["hasAny",["aphrodite","brahma","capitalise","capitalize","capitalize each word","chronos","diana","dionysus","item number","longest","longest one","longest word","nth","odin","position","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.title",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5d7adf32","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","invert case","item number","longest","longest one","longest word","nth","odin","position","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-a7802626","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","item number","longest","longest one","longest word","nth","odin","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b0773bd7","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","item number","longest","longest one","longest word","nth","odin","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b47386f4","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","item number","longest","longest one","longest word","nth","odin","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-dd368332","guard":[["hasAny",["all caps","aphrodite","brahma","capital letters","capitals","chronos","diana","dionysus","item number","longest","longest one","longest word","nth","odin","position","upper case","uppercase"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.upper",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-528ea7e2","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","each word","item number","longest","longest one","longest word","nth","odin","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f9c92340","guard":[["hasAny",["aphrodite","brahma","chronos","diana","dionysus","each word","item number","longest","longest one","longest word","nth","odin","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-77c73a56","guard":[["hasAny",["aphrodite","athena","demeter","each word","longest","longest one","longest word","odin","poseidon","shiva","split into words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-1265bd87","guard":[["hasAny",["backwards","chronos","dionysus","hypnos","item number","nth","position","reverse order","reversed","shiva","thalassa","uranus"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":4}]],"mem":null},
{"id":"n-2b8195ce","guard":[["hasAny",["aphrodite","athena","demeter","each word","invert case","longest","longest one","longest word","odin","poseidon","shiva","split into words","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.swapCase",["sense.subject"]]]]],"mem":null},
{"id":"n-37b9b65e","guard":[["hasAny",["backwards","chronos","dionysus","hypnos","item number","nth","position","reverse order","reversed","shiva","thalassa","uranus"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-4eaece3d","guard":[["hasAny",["demeter","first n","horus","hypnos","longest","longest one","longest word","shiva","take","top"]]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-69ccea2b","guard":[["hasAny",["aphrodite","athena","demeter","each word","longest","longest one","longest word","lower case","lowercase","odin","poseidon","shiva","small letters","split into words"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.lower",["sense.subject"]]]]],"mem":null},
{"id":"n-a85ab3d5","guard":[["hasAny",["aphrodite","athena","capitalise","capitalize","capitalize each word","demeter","each word","longest","longest one","longest word","odin","poseidon","shiva","split into words","title case"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.title",["sense.subject"]]]]],"mem":null},
{"id":"n-b37dc2b9","guard":[["hasAny",["all caps","aphrodite","athena","capital letters","capitals","demeter","each word","longest","longest one","longest word","odin","poseidon","shiva","split into words","upper case","uppercase"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["transform.upper",["sense.subject"]]]]],"mem":null},
{"id":"n-b88e1de3","guard":[["hasAny",["athena","consonant count","erebus","gaia","hera","hermes","how many consonants","item number","nth","number of consonants","position","zeus"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-d057eb56","guard":[["hasAny",["artemis","element","how many vowels","item number","minerva","nth","number of vowels","position","vesta","vowel count","vulcan"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f481d16","guard":[["hasAny",["artemis","change to","erebus","gaia","hera","hermes","replace","substitute","swap","zeus"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-c613542b","guard":[["hasAny",["aphrodite","apollo","artemis","brahma","from position","items from to","longest","longest one","longest word","odin","phanes","slice"]]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-ee5ef3b0","guard":[["hasAny",["ares","erebus","eros","from position","gaia","hypnos","items from to","shortest","shortest one","shortest word","slice","zeus"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":4}]]],"mem":null},
{"id":"n-09ce8ae3","guard":[["hasAny",["capitalise","capitalize","capitalize each word","erebus","gaia","hera","hermes","title case","zeus"]],["has","among"]],"pyramid":["render.str",["transform.title",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-31762f88","guard":[["hasAny",["artemis","backwards","demeter","loki","longest","longest one","longest word","minerva","reverse","reverse order","reversed"]]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["sense.list"]]]],"mem":null},
{"id":"n-42dd5788","guard":[["hasAny",["erebus","gaia","hera","hermes","lower case","lowercase","small letters","zeus"]],["has","among"]],"pyramid":["render.str",["transform.lower",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-4e073ce8","guard":[["hasAny",["element","item number","minerva","nth","position","vesta","vulcan"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":2}]],"mem":null},
{"id":"n-67ef877a","guard":[["hasAny",["all caps","capital letters","capitals","erebus","gaia","hera","hermes","upper case","uppercase","zeus"]],["has","among"]],"pyramid":["render.str",["transform.upper",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-789e8297","guard":[["hasAny",["each word","erebus","gaia","hera","hermes","split into words","zeus"]],["has","among"]],"pyramid":["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-a12f98be","guard":[["hasAny",["erebus","gaia","hera","hermes","invert case","swap case","toggle case","zeus"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-07462abd","guard":[["hasAny",["erebus","first n","hermes","hypnos","longest","longest one","longest word","shiva","take","uranus"]],["has","which"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-3401de95","guard":[["hasAny",["consonant count","erebus","gaia","hera","hermes","how many consonants","item number","minerva","nth","number of consonants","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.consonants",["sense.subject"]]]],"mem":null},
{"id":"n-4652ae36","guard":[["hasAny",["capitalise","capitalize","capitalize each word","erebus","gaia","hera","hermes","invert case","swap case","title case","toggle case","zeus"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.wordAt",{"lit":3}]]]],"mem":null},
{"id":"n-4f2a4f7c","guard":[["hasAny",["consonant count","erebus","gaia","hera","hermes","how many consonants","item number","nth","number of consonants","position","zeus"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-57d31dee","guard":[["hasAny",["all caps","capital letters","capitals","element","item number","minerva","nth","position","upper case","uppercase","vesta","vulcan"]]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-61c47af2","guard":[["hasAny",["element","item number","lower case","lowercase","minerva","nth","position","small letters","vesta","vulcan"]]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-790a48e0","guard":[["hasAny",["a to z","alphabetical","alphabetize","brahma","gaia","hades","hermes","hypnos","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-7a94f39f","guard":[["hasAny",["element","invert case","item number","minerva","nth","position","swap case","toggle case","vesta","vulcan"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-a53222e0","guard":[["hasAny",["aphrodite","each word","hypnos","item number","nth","odin","position","shiva","split into words","uranus"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.subject"]],{"lit":1}]],"mem":null},
{"id":"n-b11eeadb","guard":[["hasAny",["aether","athena","chaos","demeter","how many words","item number","nth","number of words","poseidon","position","word count"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-c0df52cf","guard":[["hasAny",["consonant count","erebus","gaia","hera","hermes","how many consonants","item number","minerva","nth","number of consonants","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.consonants",["sense.subject"]]]],"mem":null},
{"id":"n-dbe99db8","guard":[["hasAny",["erebus","gaia","hera","hermes","minerva","normalise","normalize","simplify the text"]],["has","among"]],"pyramid":["render.str",["transform.norm",["sense.wordAt",{"lit":3}],{"lit":2}]],"mem":null},
{"id":"n-e5d5d4db","guard":[["hasAny",["a to z","alphabetical","alphabetize","artemis","element","item number","nth","position","vesta","vulcan"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.list"]],{"lit":1}]],"mem":null},
{"id":"n-eda4cf66","guard":[["hasAny",["backwards","erebus","gaia","hera","hermes","item number","nth","position","reverse order","reversed","zeus"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":5}]],"mem":null},
{"id":"n-f9d921cc","guard":[["hasAny",["a to z","alphabetical","alphabetize","hera","item number","nth","phanes","poseidon","position","shiva","uranus"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":5}]],"mem":null},
{"id":"n-119742ea","guard":[["hasAny",["baldur","delete","erebus","freya","hermes","remove","strip out","without","zeus"]],["has","among"]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":3}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-4517b89b","guard":[["hasAny",["change to","erebus","gaia","hera","hermes","replace","substitute","swap","zeus"]],["has","among"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.wordAt",{"lit":3}]]],"mem":null},
{"id":"n-7c3a9294","guard":[["hasAny",["erebus","gaia","hera","hermes","item number","nth","position","zeus"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["sense.lastWord"]],"mem":null},
{"id":"n-0075ee99","guard":[["hasAny",["aether","athena","chaos","demeter","item number","nth","poseidon","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-622db839","guard":[["hasAny",["baldur","element","erebus","freya","hermes","item number","nth","position","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-bca5c8e5","guard":[["hasAny",["aether","athena","chaos","demeter","item number","nth","poseidon","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-e873ff73","guard":[["hasAny",["baldur","element","erebus","freya","hermes","item number","nth","position","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-0783eb18","guard":[["hasAny",["baldur","element","erebus","freya","hermes","item number","lower case","lowercase","nth","position","small letters","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-5b633aa7","guard":[["hasAny",["all caps","baldur","capital letters","capitals","element","erebus","freya","hermes","item number","nth","position","upper case","uppercase","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-5bae4ec9","guard":[["hasAny",["baldur","element","erebus","freya","hermes","item number","nth","position","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-a27f10c4","guard":[["hasAny",["baldur","element","erebus","freya","hermes","item number","nth","position","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-a2ae26e4","guard":[["hasAny",["baldur","capitalise","capitalize","capitalize each word","element","erebus","freya","hermes","item number","nth","position","title case","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-e29f03d5","guard":[["hasAny",["baldur","element","erebus","freya","hermes","invert case","item number","nth","position","swap case","toggle case","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-384b7950","guard":[["hasAny",["baldur","each word","element","erebus","freya","hermes","item number","nth","position","split into words","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-5a9e8c37","guard":[["hasAny",["baldur","capitalise","capitalize","capitalize each word","element","erebus","freya","hermes","item number","nth","position","title case","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-5e3ae6dc","guard":[["hasAny",["baldur","element","erebus","freya","hermes","item number","lower case","lowercase","nth","position","small letters","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-6f9d1f85","guard":[["hasAny",["baldur","element","erebus","freya","hermes","invert case","item number","nth","position","swap case","toggle case","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-812f7f2d","guard":[["hasAny",["all caps","baldur","capital letters","capitals","element","erebus","freya","hermes","item number","nth","position","upper case","uppercase","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-9ebde0d8","guard":[["hasAny",["baldur","element","erebus","freya","hermes","item number","lower case","lowercase","nth","position","small letters","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-ef83bf3d","guard":[["hasAny",["baldur","each word","element","erebus","freya","hermes","item number","nth","position","split into words","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-12f5f3bd","guard":[["hasAny",["baldur","each word","element","erebus","freya","hermes","item number","nth","position","split into words","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-21a5a6f1","guard":[["hasAny",["element","item number","minerva","nth","position","vesta","vulcan"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.list"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-6fb36af2","guard":[["hasAny",["baldur","each word","element","erebus","freya","hermes","item number","nth","position","split into words","zeus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-b76f5974","guard":[["hasAny",["aether","athena","chaos","demeter","item number","nth","poseidon","position"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-16542dd0","guard":[["hasAny",["aether","athena","chaos","demeter","first n","item number","nth","poseidon","position","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-7447cbaa","guard":[["hasAny",["aether","athena","chaos","demeter","first n","item number","nth","poseidon","position","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-67623817","guard":[["hasAny",["athena","demeter","longest","longest one","longest word","minerva","shiva"]]],"pyramid":["render.str",["aggregate.longest",["sense.list"]]],"mem":null},
{"id":"n-2e6ca640","guard":[["hasAny",["athena","demeter","longest","longest one","longest word","lower case","lowercase","minerva","shiva","small letters"]]],"pyramid":["render.str",["transform.lower",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-c8438560","guard":[["hasAny",["athena","demeter","invert case","longest","longest one","longest word","minerva","shiva","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-cbb21d57","guard":[["hasAny",["apollo","artemis","brahma","item number","nth","phanes","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":5}]],"mem":null},
{"id":"n-d8567f8f","guard":[["hasAny",["all caps","athena","capital letters","capitals","demeter","longest","longest one","longest word","minerva","shiva","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-57e1563d","guard":[["hasAny",["delete","demeter","horus","longest","longest one","longest word","remove","shiva","strip out","without"]]],"pyramid":["render.str",["transform.remove",["aggregate.longest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-84e1e89a","guard":[["hasAny",["apollo","artemis","brahma","invert case","item number","nth","phanes","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-8ee94192","guard":[["hasAny",["athena","demeter","each word","longest","longest one","longest word","minerva","shiva","split into words","words"]]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"of"}]]]],"mem":null},
{"id":"n-9ef18448","guard":[["hasAny",["athena","demeter","each word","longest","longest one","longest word","poseidon","shiva","split into words","words"]],["has","which"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.after",{"lit":"is"}]]]],"mem":null},
{"id":"n-a4f14171","guard":[["hasAny",["a to z","alphabetical","alphabetize","gaia","hades","hermes","hypnos","item number","nth","position"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":5}]],"mem":null},
{"id":"n-d0d514c1","guard":[["hasAny",["apollo","artemis","brahma","capitalise","capitalize","capitalize each word","item number","nth","phanes","position","title case"]]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":5}]]],"mem":null},
{"id":"n-a2e024ed","guard":[["hasAny",["athena","demeter","item number","longest","longest one","longest word","nth","poseidon","position","shiva"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-b38fe762","guard":[["hasAny",["athena","demeter","item number","longest","longest one","longest word","nth","poseidon","position","shiva"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1d32c85a","guard":[["hasAny",["athena","demeter","item number","longest","longest one","longest word","nth","poseidon","position","shiva"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b295c786","guard":[["hasAny",["athena","demeter","item number","longest","longest one","longest word","nth","poseidon","position","shiva"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e1751a1e","guard":[["hasAny",["athena","chaos","demeter","item number","nth","poseidon","position","shortest","shortest one","shortest word"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-eed37865","guard":[["hasAny",["athena","demeter","element","item number","longest","longest one","longest word","minerva","nth","position","shiva"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.list"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-cd41aee0","guard":[["hasAny",["athena","demeter","first n","item number","longest","longest one","longest word","nth","poseidon","position","shiva","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d54f1bb8","guard":[["hasAny",["athena","demeter","first n","item number","longest","longest one","longest word","nth","poseidon","position","shiva","take"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-281dbd25","guard":[["hasAny",["aphrodite","artemis","capitalise","capitalize","capitalize each word","odin","title case"]],["has","or"]],"pyramid":["render.str",["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-3e07c7e3","guard":[["hasAny",["all caps","aphrodite","artemis","capital letters","capitals","odin","upper case","uppercase"]],["has","or"]],"pyramid":["render.str",["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-4a419a46","guard":[["hasAny",["aphrodite","artemis","lower case","lowercase","odin","small letters"]],["has","or"]],"pyramid":["render.str",["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-a8e3d6f1","guard":[["hasAny",["aphrodite","artemis","invert case","odin","swap case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-e6ed347b","guard":[["hasAny",["aphrodite","artemis","each word","odin","split into words"]],["has","or"]],"pyramid":["render.list",["transform.words",["sense.lastWord"]]],"mem":null},
{"id":"n-191450c6","guard":[["hasAny",["aphrodite","artemis","capitalise","capitalize","capitalize each word","invert case","odin","swap case","title case","toggle case"]],["has","or"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.lastWord"]]]],"mem":null},
{"id":"n-7cec3bea","guard":[["hasAny",["element","hypnos","item number","nth","position","shiva","uranus"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":1}]],"mem":null},
{"id":"n-070be0ee","guard":[["hasAny",["hades","how many vowels","hypnos","item number","nth","number of vowels","position","uranus","vowel count"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a9e7cfb","guard":[["hasAny",["aphrodite","ares","character count","eros","how many characters","item number","length","nth","number of characters","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.chars",["sense.subject"]]]],"mem":null},
{"id":"n-3c40800a","guard":[["hasAny",["element","hypnos","invert case","item number","nth","position","shiva","swap case","toggle case","uranus"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-458a7d74","guard":[["hasAny",["a to z","alphabetical","alphabetize","element","item number","minerva","nth","position","shiva","uranus"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.list"]],{"lit":3}]],"mem":null},
{"id":"n-49cbdb65","guard":[["hasAny",["alphabetize the letters","aphrodite","artemis","delete","freya","letters in order","remove","sort the letters","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-4e88dfb1","guard":[["hasAny",["a to z","alphabetical","alphabetize","item number","nth","odin","position","thalassa","zeus"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],["sense.wordCount"]]],"mem":null},
{"id":"n-51386bbd","guard":[["hasAny",["chronos","dionysus","how many items","item number","nth","number of items","position","thalassa"]],["has","pick"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.countStrs",["sense.content"]]]],"mem":null},
{"id":"n-7aa231f5","guard":[["hasAny",["aphrodite","artemis","delete","freya","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"deity"}]]],"mem":null},
{"id":"n-7bcf2db7","guard":[["hasAny",["aphrodite","artemis","delete","freya","lower case","lowercase","remove","small letters","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.lower",["sense.lastWord"]],["sense.lastWord"]]],"mem":null},
{"id":"n-81dbfeb0","guard":[["hasAny",["add the digits","aphrodite","digit sum","hades","item number","nth","odin","position","sum of the digits"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-a0c8728d","guard":[["hasAny",["all caps","capital letters","capitals","element","hypnos","item number","nth","position","shiva","upper case","uppercase","uranus"]]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-a73f37bd","guard":[["hasAny",["hades","how many vowels","hypnos","item number","nth","number of vowels","position","shiva","vowel count"]],["has","which"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-b5241938","guard":[["hasAny",["a to z","alphabetical","alphabetize","ares","demeter","dionysus","item number","nth","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":3}]],"mem":null},
{"id":"n-c9312e1c","guard":[["hasAny",["a to z","alphabetical","alphabetize","backwards","demeter","longest","longest one","longest word","minerva","reverse","reverse order","reversed","shiva"]]],"pyramid":["render.str",["aggregate.longest",["transform.reverseStrs",["transform.sortStrs",["sense.list"]]]]],"mem":null},
{"id":"n-e79b3193","guard":[["hasAny",["element","hypnos","item number","lower case","lowercase","nth","position","shiva","small letters","uranus"]]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["sense.list"],{"lit":1}]]],"mem":null},
{"id":"n-fe61fcba","guard":[["hasAny",["aphrodite","ares","character count","eros","how many characters","item number","length","nth","number of characters","position"]],["has","or"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-3a08d4ca","guard":[["hasAny",["aphrodite","artemis","change to","odin","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.after",{"lit":"greek"}],["sense.text"]]],"mem":null},
{"id":"n-5262b90b","guard":[["hasAny",["erebus","from position","hera","hermes","items from to","longest","longest one","longest word","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-57e8a05e","guard":[["hasAny",["from position","gaia","hades","hera","items from to","shortest","shortest one","shortest word","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-61fa5eaf","guard":[["hasAny",["apollo","athena","chaos","from position","items from to","shortest","shortest one","shortest word","slice"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-8decb17d","guard":[["hasAny",["from position","gaia","hades","hera","items from to","shortest","shortest one","shortest word","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-b5064a85","guard":[["hasAny",["from position","hermes","isis","items from to","longest","longest one","longest word","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":3}]]],"mem":null},
{"id":"n-d5697eaf","guard":[["hasAny",["from position","hermes","isis","items from to","longest","longest one","longest word","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":2},{"lit":5}]]],"mem":null},
{"id":"n-060408db","guard":[["hasAny",["hypnos","item number","nth","position","shiva","uranus"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-8be708cc","guard":[["hasAny",["hypnos","item number","nth","position","shiva","uranus"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-96662fdc","guard":[["hasAny",["apollo","brahma","item number","nth","phanes","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-b102be96","guard":[["hasAny",["apollo","brahma","item number","nth","phanes","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-35a58b28","guard":[["hasAny",["athena","demeter","item number","longest","longest one","longest word","nth","poseidon","position","shortest","shortest one","shortest word"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3bfeb819","guard":[["hasAny",["apollo","brahma","item number","nth","phanes","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["sense.wordAt",{"lit":3}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-264c0d88","guard":[["hasAny",["element","hypnos","item number","nth","position","shiva","uranus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.list"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3f5724e7","guard":[["hasAny",["hypnos","item number","nth","position","shiva","uranus"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-44316357","guard":[["hasAny",["apollo","brahma","capitalise","capitalize","capitalize each word","item number","nth","phanes","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.title",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4c8f62ef","guard":[["hasAny",["apollo","brahma","item number","nth","phanes","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-542b114f","guard":[["hasAny",["apollo","brahma","item number","lower case","lowercase","nth","phanes","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.lower",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-6e120c5d","guard":[["hasAny",["apollo","brahma","invert case","item number","nth","phanes","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.swapCase",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-8ee7c561","guard":[["hasAny",["chronos","dionysus","item number","nth","position","thalassa"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-984b68bd","guard":[["hasAny",["apollo","brahma","item number","nth","phanes","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":4}]],"mem":null},
{"id":"n-aede11e6","guard":[["hasAny",["all caps","apollo","brahma","capital letters","capitals","item number","nth","phanes","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.upper",["sense.wordAt",{"lit":3}]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4ff51f97","guard":[["hasAny",["apollo","brahma","each word","item number","nth","phanes","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.list",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-72370334","guard":[["hasAny",["first n","hypnos","item number","nth","position","shiva","take","uranus"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-81843944","guard":[["hasAny",["element","first n","hypnos","item number","nth","position","shiva","take","top","uranus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-b0d933fd","guard":[["hasAny",["first n","hypnos","item number","nth","position","shiva","take","uranus"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-dd9996a0","guard":[["hasAny",["apollo","brahma","each word","item number","nth","phanes","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["render.and",["transform.words",["sense.wordAt",{"lit":3}]]],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f22cce86","guard":[["hasAny",["element","first n","hypnos","item number","nth","position","shiva","take","top","uranus"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.takeStrs",["sense.list"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-062a524a","guard":[["hasAny",["aphrodite","lower case","lowercase","odin","small letters"]],["has","pick"]],"pyramid":["render.str",["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-2db6bb30","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","odin","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["sense.subject"]]],"mem":null},
{"id":"n-4fdda60b","guard":[["hasAny",["aphrodite","each word","odin","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-866a48c0","guard":[["hasAny",["aphrodite","each word","odin","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-9377b6af","guard":[["hasAny",["aphrodite","invert case","odin","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["sense.subject"]]],"mem":null},
{"id":"n-ccdd2ef5","guard":[["hasAny",["all caps","aphrodite","capital letters","capitals","odin","upper case","uppercase"]],["has","pick"]],"pyramid":["render.str",["transform.upper",["sense.subject"]]],"mem":null},
{"id":"n-ce015c28","guard":[["hasAny",["aphrodite","odin","reverse the words","reverse word order","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["sense.subject"]]],"mem":null},
{"id":"n-e5f5de0a","guard":[["hasAny",["aphrodite","each word","odin","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["sense.subject"]]],"mem":null},
{"id":"n-1ce88e2a","guard":[["hasAny",["ares","eros","item number","nth","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],{"lit":5}]],"mem":null},
{"id":"n-2d087609","guard":[["hasAny",["aphrodite","each word","odin","shortest","shortest one","shortest word","split into words"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-3f4ed31a","guard":[["hasAny",["aphrodite","invert case","odin","reverse the words","reverse word order","swap case","toggle case","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-460ebd57","guard":[["hasAny",["a to z","alphabetical","alphabetize","aphrodite","each word","odin","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-51b1ecad","guard":[["hasAny",["aphrodite","each word","invert case","odin","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-5394ef4c","guard":[["hasAny",["aphrodite","backwards","each word","odin","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-53d6f647","guard":[["hasAny",["aphrodite","odin"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-6457c7a3","guard":[["hasAny",["aphrodite","normalise","normalize","odin","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":2}]],"mem":null},
{"id":"n-68457895","guard":[["hasAny",["aphrodite","each word","invert case","odin","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-69eab361","guard":[["hasAny",["all caps","aphrodite","capital letters","capitals","each word","odin","split into words","upper case","uppercase"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-7939977a","guard":[["hasAny",["aphrodite","each word","invert case","odin","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.swapCase",["sense.subject"]]]],"mem":null},
{"id":"n-88167e0d","guard":[["hasAny",["aphrodite","normalise","normalize","odin","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":3}]],"mem":null},
{"id":"n-8f46b518","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","invert case","odin","swap case","title case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-9574be18","guard":[["hasAny",["aphrodite","each word","lower case","lowercase","odin","small letters","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-95d6572b","guard":[["hasAny",["all caps","aphrodite","capital letters","capitals","each word","odin","split into words","upper case","uppercase"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-99d35f3d","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","each word","odin","split into words","title case"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-a1930f5b","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","each word","odin","split into words","title case"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-a2a9db59","guard":[["hasAny",["a to z","alphabetical","alphabetize","chaos","hypnos","shortest","shortest one","shortest word"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.list"]]]],"mem":null},
{"id":"n-aca195e4","guard":[["hasAny",["a to z","alphabetical","alphabetize","aphrodite","each word","odin","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-ad01134b","guard":[["hasAny",["all caps","aphrodite","capital letters","capitals","each word","odin","split into words","upper case","uppercase"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-bbdc5d01","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","each word","odin","split into words","title case"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-c0032b10","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","odin","reverse the words","reverse word order","title case","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.title",["sense.subject"]]]],"mem":null},
{"id":"n-d033c5a9","guard":[["hasAny",["a to z","alphabetical","alphabetize","aphrodite","each word","odin","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.sortStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-d1908f8d","guard":[["hasAny",["all caps","aphrodite","capital letters","capitals","odin","reverse the words","reverse word order","upper case","uppercase","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.upper",["sense.subject"]]]],"mem":null},
{"id":"n-dafbb698","guard":[["hasAny",["aphrodite","each word","lower case","lowercase","odin","small letters","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-e505b826","guard":[["hasAny",["aphrodite","normalise","normalize","odin","simplify the text"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],{"lit":1}]],"mem":null},
{"id":"n-e5fe5c59","guard":[["hasAny",["aphrodite","backwards","each word","odin","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-eb0fe0fb","guard":[["hasAny",["aphrodite","backwards","each word","odin","reverse order","reversed","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.reverseStrs",["transform.words",["sense.subject"]]]],"mem":null},
{"id":"n-ee2ba75b","guard":[["hasAny",["aphrodite","lower case","lowercase","odin","reverse the words","reverse word order","small letters","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.lower",["transform.reverseWords",["sense.subject"]]]],"mem":null},
{"id":"n-f3f1df3a","guard":[["hasAny",["aphrodite","each word","lower case","lowercase","odin","small letters","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.lower",["sense.subject"]]]],"mem":null},
{"id":"n-01260ea5","guard":[["hasAny",["aphrodite","digit count","how many digits","number of digits","odin"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-02517b98","guard":[["hasAny",["aphrodite","invert case","normalise","normalize","odin","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-05c454e0","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","normalise","normalize","odin","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-10af4a66","guard":[["hasAny",["first n","gaia","hera","shortest","shortest one","shortest word","take"]],["has","among"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.words"],{"lit":3}]]],"mem":null},
{"id":"n-10c37cb1","guard":[["hasAny",["a to z","alphabetical","alphabetize","erebus","eros","item number","nth","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.content"]],{"lit":3}]],"mem":null},
{"id":"n-12b18dcd","guard":[["hasAny",["aphrodite","digit count","how many digits","number of digits","odin"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-1643f368","guard":[["hasAny",["aphrodite","copies","digit count","how many digits","number of digits","odin","say it times"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-1c76bf3e","guard":[["hasAny",["aphrodite","each word","normalise","normalize","odin","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-1d5ad98d","guard":[["hasAny",["ares","first n","gaia","shortest","shortest one","shortest word","take"]],["has","among"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":4}]]],"mem":null},
{"id":"n-1dad4b42","guard":[["hasAny",["aphrodite","delete","freya","lower case","lowercase","remove","small letters","strip out","without"]]],"pyramid":["render.str",["transform.remove",["transform.lower",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-233a3a96","guard":[["hasAny",["aphrodite","digit count","how many digits","number of digits","odin"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-234d8754","guard":[["hasAny",["aphrodite","artemis","separate by","split","split by"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-23be065f","guard":[["hasAny",["aphrodite","each word","lower case","lowercase","odin","shortest","shortest one","shortest word","small letters","split into words"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.lower",["sense.subject"]]]]],"mem":null},
{"id":"n-26ef78e5","guard":[["hasAny",["aether","character count","how many characters","item number","length","nth","number of characters","position","thalassa"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.chars",["sense.lastWord"]]]],"mem":null},
{"id":"n-26f7a16d","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","normalise","normalize","odin","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-33ad9168","guard":[["hasAny",["aphrodite","each word","joined with","odin","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.lastWord"]]],"mem":null},
{"id":"n-35501409","guard":[["hasAny",["ares","eros","invert case","item number","nth","position","swap case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-376d0ced","guard":[["hasAny",["aphrodite","digit count","how many digits","number of digits","odin"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-3c752e63","guard":[["hasAny",["aphrodite","change to","odin","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.subject"]]],"mem":null},
{"id":"n-3f638eda","guard":[["hasAny",["aphrodite","each word","first n","odin","split into words","take"]],["has","pick"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-3f6bf818","guard":[["hasAny",["erebus","first n","hermes","longest","longest one","longest word","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-3ffec19f","guard":[["hasAny",["each word","erebus","hermes","longest","longest one","longest word","split into words","words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"is"}]]]],"mem":null},
{"id":"n-425da6ae","guard":[["hasAny",["aphrodite","artemis","separate by","split","split by"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-43f715f0","guard":[["hasAny",["aphrodite","invert case","normalise","normalize","odin","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":1}]]],"mem":null},
{"id":"n-46a9c59b","guard":[["hasAny",["each word","erebus","hermes","longest","longest one","longest word","split into words","words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"greek"}]]]],"mem":null},
{"id":"n-475d1c18","guard":[["hasAny",["aphrodite","each word","invert case","odin","shortest","shortest one","shortest word","split into words","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.swapCase",["sense.subject"]]]]],"mem":null},
{"id":"n-480aa4d9","guard":[["hasAny",["aphrodite","copies","digit count","how many digits","number of digits","odin","say it times"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-48fc9b8d","guard":[["hasAny",["aphrodite","how many words","number of words","odin","word count"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-4b5b0752","guard":[["hasAny",["aphrodite","how many words","number of words","odin","word count"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-4d27eb77","guard":[["hasAny",["erebus","first n","hermes","longest","longest one","longest word","take"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.takeStrs",["sense.words"],{"lit":3}]]],"mem":null},
{"id":"n-50aa1fde","guard":[["hasAny",["aphrodite","normalise","normalize","odin","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.reverseWords",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-53cbf233","guard":[["hasAny",["aphrodite","each word","first n","odin","split into words","take"]],["has","pick"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-550a64ce","guard":[["hasAny",["aphrodite","each word","first n","odin","split into words","take"]],["has","pick"]],"pyramid":["render.lines",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-57b6084b","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","each word","odin","shortest","shortest one","shortest word","split into words","title case"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.title",["sense.subject"]]]]],"mem":null},
{"id":"n-57cbd662","guard":[["hasAny",["first n","gaia","hera","shortest","shortest one","shortest word","take"]],["has","among"]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.content"],{"lit":3}]]],"mem":null},
{"id":"n-5ab7fd4e","guard":[["hasAny",["aphrodite","artemis","separate by","shortest","shortest one","shortest word","split","split by"]],["has","or"]],"pyramid":["render.and",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-66381fc9","guard":[["hasAny",["aphrodite","each word","joined with","odin","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.subject"]]],"mem":null},
{"id":"n-6980d9d5","guard":[["hasAny",["all caps","aphrodite","capital letters","capitals","each word","odin","shortest","shortest one","shortest word","split into words","upper case","uppercase"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.words",["transform.upper",["sense.subject"]]]]],"mem":null},
{"id":"n-6c8fefea","guard":[["hasAny",["aphrodite","how many words","number of words","odin","word count"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-72dfdfe8","guard":[["hasAny",["aphrodite","freya","from position","items from to","slice"]],["has","pick"]],"pyramid":["render.list",["transform.sliceStrs",["sense.words"],["sense.wordCount"],{"lit":10}]],"mem":null},
{"id":"n-74e420d6","guard":[["hasAny",["alphabetize the letters","aphrodite","delete","freya","letters in order","remove","sort the letters","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.subject"],["transform.sortLetters",["sense.lastWord"]]]],"mem":null},
{"id":"n-7c059fcd","guard":[["hasAny",["aphrodite","artemis","delete","remove","strip out","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7c7e2cf5","guard":[["hasAny",["aphrodite","each word","first n","odin","split into words","take"]],["has","pick"]],"pyramid":["render.and",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-7ddcf463","guard":[["hasAny",["aphrodite","artemis","separate by","split","split by"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-7e2f6fb1","guard":[["hasAny",["ares","each word","eros","item number","nth","position","split into words"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["transform.words",["sense.text"]],{"lit":5}]],"mem":null},
{"id":"n-8eff0da0","guard":[["hasAny",["aphrodite","each word","first n","odin","split into words","take"]],["has","pick"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-9482c824","guard":[["hasAny",["aphrodite","how many words","number of words","odin","word count"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-95ef6972","guard":[["hasAny",["aphrodite","each word","normalise","normalize","odin","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.and",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-9a6de2b6","guard":[["hasAny",["aphrodite","each word","first n","odin","split into words","take"]],["has","pick"]],"pyramid":["render.list",["transform.takeStrs",["transform.words",["sense.subject"]],{"lit":3}]],"mem":null},
{"id":"n-9a9f4e5c","guard":[["hasAny",["aphrodite","artemis","delete","remove","shortest","shortest one","shortest word","strip out","without"]],["has","or"]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-9b232bdf","guard":[["hasAny",["aphrodite","digit count","how many digits","number of digits","odin"]],["has","pick"]],"pyramid":["render.and",["iterate.repeat",["sense.lastWord"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-9ecdffed","guard":[["hasAny",["aphrodite","invert case","normalise","normalize","odin","simplify the text","swap case","toggle case"]],["has","pick"]],"pyramid":["render.str",["transform.swapCase",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-9fedfd20","guard":[["hasAny",["aphrodite","how many words","number of words","odin","word count"]],["has","pick"]],"pyramid":["render.lines",["iterate.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-a35a8510","guard":[["hasAny",["aphrodite","how many words","normalise","normalize","number of words","odin","simplify the text","word count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-a571a4f1","guard":[["hasAny",["aphrodite","copies","how many words","number of words","odin","say it times","word count"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.subject"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-a70d0aea","guard":[["hasAny",["aphrodite","normalise","normalize","odin","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["transform.reverseWords",["sense.subject"]],{"lit":1}]],"mem":null},
{"id":"n-aa1a914d","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","normalise","normalize","odin","simplify the text","title case"]],["has","pick"]],"pyramid":["render.str",["transform.title",["transform.norm",["sense.subject"],{"lit":1}]]],"mem":null},
{"id":"n-afc1f1a2","guard":[["hasAny",["aphrodite","each word","normalise","normalize","odin","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-b049448f","guard":[["hasAny",["ares","capitalise","capitalize","capitalize each word","eros","item number","nth","position","title case"]],["has","among"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.words"],{"lit":5}]]],"mem":null},
{"id":"n-b9836d3c","guard":[["hasAny",["each word","erebus","hermes","longest","longest one","longest word","split into words","words"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.words",["sense.before",{"lit":"deity"}]]]],"mem":null},
{"id":"n-c0af1bcc","guard":[["hasAny",["aphrodite","how many words","number of words","odin","word count"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-c1284132","guard":[["hasAny",["aphrodite","each word","normalise","normalize","odin","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.norm",["sense.subject"],{"lit":2}]]],"mem":null},
{"id":"n-c6d7a8c0","guard":[["hasAny",["aphrodite","each word","normalise","normalize","odin","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.lines",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-ca5583e2","guard":[["hasAny",["aphrodite","normalise","normalize","odin","reverse the words","reverse word order","simplify the text","words backwards"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["transform.reverseWords",["sense.subject"]],{"lit":2}]],"mem":null},
{"id":"n-d4abbb10","guard":[["hasAny",["aphrodite","each word","normalise","normalize","odin","simplify the text","split into words"]],["has","pick"]],"pyramid":["render.list",["transform.words",["transform.norm",["sense.subject"],{"lit":3}]]],"mem":null},
{"id":"n-dd779ed4","guard":[["hasAny",["ares","backwards","eros","item number","nth","position","reverse order","reversed"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.content"]],{"lit":4}]],"mem":null},
{"id":"n-e1524c4d","guard":[["hasAny",["aphrodite","artemis","separate by","shortest","shortest one","shortest word","split","split by"]],["has","or"]],"pyramid":["render.list",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-e5b6f5a8","guard":[["hasAny",["aphrodite","each word","joined with","odin","separated by","split into words"]],["has","pick"]],"pyramid":["render.str",["transform.join",["transform.words",["sense.subject"]],["sense.text"]]],"mem":null},
{"id":"n-ed014985","guard":[["hasAny",["aphrodite","delete","freya","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"from"}]]],"mem":null},
{"id":"n-edc52610","guard":[["hasAny",["aphrodite","copies","how many words","number of words","odin","say it times","word count"]],["has","pick"]],"pyramid":["render.str",["transform.repeat",["sense.lastWord"],["aggregate.words",["sense.subject"]]]],"mem":null},
{"id":"n-f513bf10","guard":[["hasAny",["a to z","alphabetical","alphabetize","erebus","eros","item number","nth","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":4}]],"mem":null},
{"id":"n-f5a8be7d","guard":[["hasAny",["aphrodite","artemis","separate by","shortest","shortest one","shortest word","split","split by"]],["has","or"]],"pyramid":["render.lines",["transform.split",["sense.lastWord"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-f8028adc","guard":[["hasAny",["aphrodite","delete","freya","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.after",{"lit":"greek"}]]],"mem":null},
{"id":"n-fa02938f","guard":[["hasAny",["artemis","how many vowels","normalise","normalize","number of vowels","odin","simplify the text","vowel count"]],["has","or"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-fbdf13e4","guard":[["hasAny",["aphrodite","digit count","how many digits","number of digits","odin"]],["has","pick"]],"pyramid":["render.list",["iterate.repeat",["sense.subject"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-04c6688e","guard":[["hasAny",["athena","chaos","from position","items from to","shortest","shortest one","shortest word","slice"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.list"],{"lit":2},["sense.wordCount"]]]],"mem":null},
{"id":"n-1c818d64","guard":[["hasAny",["ares","eros","from position","items from to","longest","longest one","longest word","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":4},{"lit":5}]]],"mem":null},
{"id":"n-2c1937b9","guard":[["hasAny",["aphrodite","artemis","change to","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":2}],["sense.lastWord"]]],"mem":null},
{"id":"n-46a70a80","guard":[["hasAny",["aphrodite","change to","odin","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.after",{"lit":"greek"}],["sense.text"]]],"mem":null},
{"id":"n-5ba62ecb","guard":[["hasAny",["ares","eros","item number","nth","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["sense.lastWord"]],"mem":null},
{"id":"n-732ba034","guard":[["hasAny",["artemis","change to","hades","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b1eb2ea8","guard":[["hasAny",["aphrodite","artemis","change to","replace","substitute","swap"]],["has","or"]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.wordAt",{"lit":2}],["sense.text"]]],"mem":null},
{"id":"n-b465cc53","guard":[["hasAny",["aphrodite","artemis","separate by","shortest","shortest one","shortest word","split","split by"]],["has","or"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-b8eeae71","guard":[["hasAny",["aphrodite","change to","freya","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.after",{"lit":"deity"}],["sense.text"]]],"mem":null},
{"id":"n-bf5a8678","guard":[["hasAny",["aphrodite","artemis","longest","longest one","longest word","separate by","split","split by"]],["has","or"]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.lastWord"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-cdc6406b","guard":[["hasAny",["athena","chaos","from position","items from to","shortest","shortest one","shortest word","slice"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":4},["sense.wordCount"]]]],"mem":null},
{"id":"n-fac735ab","guard":[["hasAny",["ares","from position","gaia","items from to","shortest","shortest one","shortest word","slice"]],["has","among"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":2},{"lit":4}]]],"mem":null},
{"id":"n-4aa47c2f","guard":[["hasAny",["element","erebus","hermes","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.words"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-d4c0fd2f","guard":[["hasAny",["ares","element","eros","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-e19fa5c7","guard":[["hasAny",["element","erebus","hermes","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-0ebf132f","guard":[["hasAny",["ares","element","eros","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.words"],{"lit":5}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-517a6310","guard":[["hasAny",["ares","element","eros","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-e4bf5f63","guard":[["hasAny",["aphrodite","item number","nth","odin","position"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-eda02552","guard":[["hasAny",["ares","element","eros","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-20ab8e7a","guard":[["hasAny",["aphrodite","capitalise","capitalize","capitalize each word","item number","nth","odin","position","title case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-266d9264","guard":[["hasAny",["all caps","ares","capital letters","capitals","element","eros","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-28611f67","guard":[["hasAny",["ares","element","eros","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-3f8bb9c6","guard":[["hasAny",["ares","capitalise","capitalize","capitalize each word","element","eros","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-4861dfe4","guard":[["hasAny",["ares","element","eros","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-4b25ffff","guard":[["hasAny",["aphrodite","invert case","item number","nth","odin","position","swap case","toggle case"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4f2cddfb","guard":[["hasAny",["ares","element","eros","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-6fd3c2fd","guard":[["hasAny",["hypnos","item number","nth","position","shortest","shortest one","shortest word","uranus"]],["has","which"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":3}],["aggregate.shortest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-96250b15","guard":[["hasAny",["aphrodite","item number","lower case","lowercase","nth","odin","position","small letters"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f80b84e6","guard":[["hasAny",["all caps","aphrodite","capital letters","capitals","item number","nth","odin","position","upper case","uppercase"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-404f1b77","guard":[["hasAny",["aphrodite","each word","item number","nth","odin","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-5fbe59b2","guard":[["hasAny",["ares","each word","element","eros","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-ac582721","guard":[["hasAny",["ares","each word","element","eros","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-e5293899","guard":[["hasAny",["aphrodite","each word","item number","nth","odin","position","split into words"]],["has","pick"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-05aa8b23","guard":[["hasAny",["among","deity","greek","loki","minerva","one","zeus"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among Loki, Zeus or Minerva, which one is a Greek deity":"Zeus is a Greek deity."}}},
{"id":"n-090f63d3","guard":[["hasAny",["deity","greek","horus","minerva","poseidon"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Minerva, Poseidon or Horus":"Poseidon is a Greek deity."}}},
{"id":"n-0a3fdfb7","guard":[["hasAny",["chronos","lakshmi"]],["has","pick"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Chronos, Mars or Lakshmi":"Chronos is a Greek deity."}}},
{"id":"n-12296471","guard":[["hasAny",["deity","demeter","greek","saturn","vesta"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Saturn, Demeter or Vesta":"Demeter is a Greek deity."}}},
{"id":"n-123c5e1a","guard":[["hasAny",["baldur","gaia"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among Ganesha, Gaia or Baldur, which one is a Greek deity":"Gaia is a Greek deity."}}},
{"id":"n-1793b0d9","guard":[["hasAny",["hypnos","shortest","shortest one","shortest word"]]],"pyramid":["render.str",["aggregate.shortest",["sense.list"]]],"mem":null},
{"id":"n-1a8793ec","guard":[["hasAny",["brahma","deity","greek","hephaestus","horus","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Horus, Hephaestus or Brahma":"Hephaestus is a Greek deity."}}},
{"id":"n-25dd8be7","guard":[["hasAny",["deity","diana","greek","loki","pick","thalassa"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Thalassa, Diana or Loki":"Thalassa is a Greek deity."}}},
{"id":"n-2c8f0340","guard":[["hasAny",["athena","deity","greek","horus","vulcan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Horus, Athena or Vulcan":"Athena is a Greek deity."}}},
{"id":"n-315fa0c3","guard":[["hasAny",["deity","ganesha","greek","hypnos","osiris"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Hypnos, Osiris or Ganesha":"Hypnos is a Greek deity."}}},
{"id":"n-3199f76b","guard":[["has","hades"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among Hades, Venus or Isis, which one is a Greek deity":"Hades is a Greek deity."}}},
{"id":"n-33b58a37","guard":[["hasAny",["erebus","saturn"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among Isis, Erebus or Saturn, which one is a Greek deity":"Erebus is a Greek deity."}}},
{"id":"n-34a91039","guard":[["hasAny",["chronos","deity","greek","lakshmi","mars","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Chronos, Mars or Lakshmi":"Chronos is a Greek deity."}}},
{"id":"n-3818a429","guard":[["hasAny",["among","deity","greek","hermes","horus","one","vesta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among Vesta, Hermes or Horus, which one is a Greek deity":"Hermes is a Greek deity."}}},
{"id":"n-3a1a977a","guard":[["hasAny",["apollo","deity","ganesha","greek","pick","set"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Ganesha, Apollo or Set":"Apollo is a Greek deity."}}},
{"id":"n-3a4d0b6e","guard":[["hasAny",["brahma","deity","greek","hephaestus","horus","pick"]],["has","pick"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Horus, Hephaestus or Brahma":"Hephaestus is a Greek deity."}}},
{"id":"n-3ac07987","guard":[["hasAny",["deity","greek","horus","minerva","poseidon"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Minerva, Poseidon or Horus":"Poseidon is a Greek deity."}}},
{"id":"n-3b1d3b52","guard":[["hasAny",["deity","demeter","greek","saturn","vesta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Saturn, Demeter or Vesta":"Demeter is a Greek deity."}}},
{"id":"n-40c08582","guard":[["hasAny",["deity","ganesha","greek","hypnos","osiris"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Hypnos, Osiris or Ganesha":"Hypnos is a Greek deity."}}},
{"id":"n-4667c83c","guard":[["hasAny",["among","deity","freya","greek","hera","one","ra"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among Freya, Hera or Ra, which one is a Greek deity":"Hera is a Greek deity."}}},
{"id":"n-47adbd99","guard":[["hasAny",["chaos","deity","greek","venus","vesta"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Venus, Chaos or Vesta":"Chaos is a Greek deity."}}},
{"id":"n-4a0c6e1e","guard":[["has","ares"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among Venus, Ganesha or Ares, which one is a Greek deity":"Ares is a Greek deity."}}},
{"id":"n-53e0a650","guard":[["hasAny",["deity","ganesha","greek","horus","uranus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Uranus, Horus or Ganesha":"Uranus is a Greek deity."}}},
{"id":"n-561bd46c","guard":[["hasAny",["deity","freya","greek","odin","pick","tartarus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Freya, Odin or Tartarus":"Tartarus is a Greek deity."}}},
{"id":"n-61559360","guard":[["hasAny",["among","deity","greek","hermes","horus","one","vesta"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among Vesta, Hermes or Horus, which one is a Greek deity":"Hermes is a Greek deity."}}},
{"id":"n-624d90cf","guard":[["hasAny",["aether","deity","greek","loki","vulcan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Vulcan, Aether or Loki":"Aether is a Greek deity."}}},
{"id":"n-66901265","guard":[["hasAny",["among","baldur","deity","gaia","ganesha","greek","one"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among Ganesha, Gaia or Baldur, which one is a Greek deity":"Gaia is a Greek deity."}}},
{"id":"n-66caa0ca","guard":[["hasAny",["among","deity","greek","hades","isis","one","venus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among Hades, Venus or Isis, which one is a Greek deity":"Hades is a Greek deity."}}},
{"id":"n-68a84c01","guard":[["hasAny",["deity","greek","loki","shiva","thanatos"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Thanatos, Shiva or Loki":"Thanatos is a Greek deity."}}},
{"id":"n-74be2923","guard":[["hasAny",["artemis","deity","ganesha","greek","mars"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Ganesha, Mars or Artemis":"Artemis is a Greek deity."}}},
{"id":"n-759f56b9","guard":[["has","thalassa"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Thalassa, Diana or Loki":"Thalassa is a Greek deity."}}},
{"id":"n-798875b6","guard":[["hasAny",["artemis","deity","ganesha","greek","mars"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Ganesha, Mars or Artemis":"Artemis is a Greek deity."}}},
{"id":"n-7c74fd33","guard":[["hasAny",["among","ares","deity","ganesha","greek","one","venus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among Venus, Ganesha or Ares, which one is a Greek deity":"Ares is a Greek deity."}}},
{"id":"n-82de3d16","guard":[["hasAny",["deity","greek","loki","shiva","thanatos"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Thanatos, Shiva or Loki":"Thanatos is a Greek deity."}}},
{"id":"n-86c441b3","guard":[["hasAny",["apollo","ganesha"]],["has","pick"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Ganesha, Apollo or Set":"Apollo is a Greek deity."}}},
{"id":"n-8ecced84","guard":[["hasAny",["among","deity","erebus","greek","isis","one","saturn"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among Isis, Erebus or Saturn, which one is a Greek deity":"Erebus is a Greek deity."}}},
{"id":"n-94e0cf50","guard":[["hasAny",["chaos","deity","greek","venus","vesta"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Venus, Chaos or Vesta":"Chaos is a Greek deity."}}},
{"id":"n-a7eced16","guard":[["hasAny",["among","deity","greek","loki","minerva","one","zeus"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among Loki, Zeus or Minerva, which one is a Greek deity":"Zeus is a Greek deity."}}},
{"id":"n-a87ceb95","guard":[["hasAny",["deity","freya","greek","odin","pick","tartarus"]],["has","pick"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Freya, Odin or Tartarus":"Tartarus is a Greek deity."}}},
{"id":"n-b109e487","guard":[["hasAny",["among","deity","eros","greek","janus","one","tyr"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among Tyr, Janus or Eros, which one is a Greek deity":"Eros is a Greek deity."}}},
{"id":"n-b4c495da","guard":[["hasAny",["aether","deity","greek","loki","vulcan"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Vulcan, Aether or Loki":"Aether is a Greek deity."}}},
{"id":"n-bbc6bdc0","guard":[["hasAny",["aphrodite","baldur","deity","greek","pick","vulcan"]],["has","pick"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Vulcan, Baldur or Aphrodite":"Aphrodite is a Greek deity."}}},
{"id":"n-c0be51f0","guard":[["hasAny",["deity","dionysus","greek","loki","pick","set"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Dionysus, Loki or Set":"Dionysus is a Greek deity."}}},
{"id":"n-ca2abf64","guard":[["has","phanes"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Diana, Phanes or Mars":"Phanes is a Greek deity."}}},
{"id":"n-d07f3ca1","guard":[["hasAny",["athena","deity","greek","horus","vulcan"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Horus, Athena or Vulcan":"Athena is a Greek deity."}}},
{"id":"n-dbeacb51","guard":[["hasAny",["aphrodite","baldur","deity","greek","pick","vulcan"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Vulcan, Baldur or Aphrodite":"Aphrodite is a Greek deity."}}},
{"id":"n-f272d3f7","guard":[["hasAny",["deity","ganesha","greek","horus","uranus"]],["has","which"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"which of these is a Greek deity: Uranus, Horus or Ganesha":"Uranus is a Greek deity."}}},
{"id":"n-f30d2b41","guard":[["hasAny",["among","deity","eros","greek","janus","one","tyr"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"among Tyr, Janus or Eros, which one is a Greek deity":"Eros is a Greek deity."}}},
{"id":"n-f7c0e680","guard":[["hasAny",["deity","diana","greek","mars","phanes","pick"]]],"pyramid":["render.str",["memory.lookup",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Diana, Phanes or Mars":"Phanes is a Greek deity."}}},
{"id":"n-f9c6e9fd","guard":[["has","dionysus"]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"pick a Greek deity from Dionysus, Loki or Set":"Dionysus is a Greek deity."}}},
{"id":"n-fc704a13","guard":[["hasAny",["among","deity","freya","greek","hera","one","ra"]]],"pyramid":["render.str",["memory.nearest",["sense.text"]]],"mem":{"table":{"among Freya, Hera or Ra, which one is a Greek deity":"Hera is a Greek deity."}}},
{"id":"n-07938791","guard":[["hasAny",["hypnos","invert case","shortest","shortest one","shortest word","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-1fd0af83","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hades","title case"]],["has","among"]],"pyramid":["render.str",["transform.title",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-53541662","guard":[["hasAny",["a to z","alphabetical","alphabetize","chaos","shortest","shortest one","shortest word"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sortStrs",["sense.content"]]]],"mem":null},
{"id":"n-646aba22","guard":[["hasAny",["all caps","capital letters","capitals","hypnos","shortest","shortest one","shortest word","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-7a157015","guard":[["hasAny",["hypnos","lower case","lowercase","shortest","shortest one","shortest word","small letters"]]],"pyramid":["render.str",["transform.lower",["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-7ffcf43d","guard":[["hasAny",["alphabetize the letters","hades","letters in order","sort the letters"]],["has","among"]],"pyramid":["render.str",["transform.sortLetters",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-846b8711","guard":[["hasAny",["artemis","element","item number","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],{"lit":3}]],"mem":null},
{"id":"n-86847476","guard":[["hasAny",["each word","hades","split into words"]],["has","among"]],"pyramid":["render.list",["transform.words",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-96af3d4a","guard":[["hasAny",["all caps","capital letters","capitals","hades","upper case","uppercase"]],["has","among"]],"pyramid":["render.str",["transform.upper",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-981abfb0","guard":[["hasAny",["hades","item number","nth","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-be72a4a0","guard":[["hasAny",["hades","lower case","lowercase","small letters"]],["has","among"]],"pyramid":["render.str",["transform.lower",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-c072f1ca","guard":[["hasAny",["hades","invert case","swap case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-02f16de2","guard":[["hasAny",["hades","normalise","normalize","simplify the text"]]],"pyramid":["render.str",["transform.norm",["sense.wordAt",{"lit":2}],{"lit":2}]],"mem":null},
{"id":"n-08007833","guard":[["hasAny",["character count","how many characters","item number","length","nth","number of characters","position","thalassa"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.chars",["sense.subject"]]]],"mem":null},
{"id":"n-09338383","guard":[["hasAny",["aphrodite","delete","remove","shortest","shortest one","shortest word","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-12e642ab","guard":[["hasAny",["divisor count","hades","how many factors","item number","nth","number of divisors","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-1592a201","guard":[["hasAny",["aphrodite","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-1597f5a1","guard":[["hasAny",["aphrodite","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-2142d693","guard":[["hasAny",["add the digits","digit sum","element","hades","item number","nth","position","sum of the digits"]]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-428c068a","guard":[["hasAny",["aphrodite","delete","remove","strip out","without"]],["has","pick"]],"pyramid":["render.str",["transform.remove",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-4b886e7b","guard":[["hasAny",["artemis","capitalise","capitalize","capitalize each word","delete","remove","strip out","title case","without"]]],"pyramid":["render.str",["transform.remove",["transform.title",["sense.lastWord"]],["sense.subject"]]],"mem":null},
{"id":"n-50b53405","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"deity"}]],"mem":null},
{"id":"n-53473533","guard":[["hasAny",["a to z","alphabetical","alphabetize","element","hypnos","item number","nth","position"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.list"]],{"lit":2}]],"mem":null},
{"id":"n-55d9d3c8","guard":[["hasAny",["artemis","from position","items from to","slice"]]],"pyramid":["render.and",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-58eb3421","guard":[["hasAny",["a to z","alphabetical","alphabetize","element","item number","nth","position","sort","uranus"]]],"pyramid":["render.str",["transform.nthStr",["transform.sortStrs",["sense.words"]],{"lit":10}]],"mem":null},
{"id":"n-59781cdf","guard":[["hasAny",["abbreviate","acronym","artemis","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["transform.acronym",["sense.subject"]]]],"mem":null},
{"id":"n-5a56e8b7","guard":[["hasAny",["aether","consonant count","element","how many consonants","item number","nth","number of consonants","position"]]],"pyramid":["render.str",["transform.nthStr",["sense.list"],["aggregate.consonants",["sense.lastWord"]]]],"mem":null},
{"id":"n-5f5ffe12","guard":[["hasAny",["digit count","hades","how many digits","item number","nth","number of digits","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-630994bb","guard":[["hasAny",["add the digits","artemis","digit sum","normalise","normalize","simplify the text","sum of the digits"]]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.digitSum",["sense.wordCount"]]]],"mem":null},
{"id":"n-636ff1cb","guard":[["hasAny",["how many vowels","normalise","normalize","number of vowels","odin","simplify the text","vowel count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.subject"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-6e27865d","guard":[["hasAny",["hades","how many vowels","item number","nth","number of vowels","position","vowel count"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.vowels",["sense.lastWord"]]]],"mem":null},
{"id":"n-6f55047b","guard":[["hasAny",["delete","hypnos","remove","shortest","shortest one","shortest word","strip out","without"]]],"pyramid":["render.str",["transform.remove",["aggregate.shortest",["sense.list"]],["sense.lastWord"]]],"mem":null},
{"id":"n-73a12337","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],{"lit":"greek"}]],"mem":null},
{"id":"n-747dcf9e","guard":[["hasAny",["artemis","element","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.str",["transform.lower",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-7b000aca","guard":[["hasAny",["alphabetize the letters","hades","invert case","letters in order","sort the letters","swap case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.sortLetters",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-89576e52","guard":[["hasAny",["alphabetize the letters","hades","letters in order","lower case","lowercase","small letters","sort the letters"]],["has","among"]],"pyramid":["render.str",["transform.lower",["transform.sortLetters",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-8f11d71b","guard":[["hasAny",["artemis","from position","items from to","slice"]]],"pyramid":["render.list",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-9831eaf4","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hades","invert case","swap case","title case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.title",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-9a8fb4b7","guard":[["hasAny",["aphrodite","separate by","split","split by"]],["has","pick"]],"pyramid":["render.lines",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-a526865a","guard":[["hasAny",["artemis","element","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-a740007c","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.text"]]],"mem":null},
{"id":"n-a8e9acac","guard":[["hasAny",["hades","invert case","item number","nth","position","swap case","toggle case"]],["has","among"]],"pyramid":["render.str",["transform.swapCase",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-ab6a8d63","guard":[["hasAny",["how many vowels","normalise","normalize","number of vowels","odin","simplify the text","vowel count"]],["has","pick"]],"pyramid":["render.str",["transform.norm",["sense.lastWord"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-b37c654e","guard":[["hasAny",["aphrodite","separate by","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-b5768bf4","guard":[["hasAny",["aphrodite","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.and",["transform.split",["sense.subject"],["aggregate.shortest",["sense.words"]]]],"mem":null},
{"id":"n-b86644af","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","hades","letters in order","sort the letters","title case"]],["has","among"]],"pyramid":["render.str",["transform.title",["transform.sortLetters",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-c5ae6d04","guard":[["hasAny",["backwards","element","hades","item number","nth","position","reverse order","reversed"]]],"pyramid":["render.str",["transform.nthStr",["transform.reverseStrs",["sense.words"]],{"lit":10}]],"mem":null},
{"id":"n-d2b3a658","guard":[["hasAny",["artemis","delete","longest","longest one","longest word","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.longest",["sense.list"]]]],"mem":null},
{"id":"n-d3271817","guard":[["hasAny",["artemis","from position","items from to","slice"]]],"pyramid":["render.lines",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]],"mem":null},
{"id":"n-e05a31aa","guard":[["hasAny",["digit count","hades","how many digits","item number","nth","number of digits","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["aggregate.digitCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-e43983b5","guard":[["hasAny",["hades","how many vowels","item number","nth","number of vowels","position","vowel count"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.content"],["aggregate.vowels",["sense.subject"]]]],"mem":null},
{"id":"n-e61c06f0","guard":[["hasAny",["artemis","delete","remove","shortest","shortest one","shortest word","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["aggregate.shortest",["sense.list"]]]],"mem":null},
{"id":"n-e6dba864","guard":[["hasAny",["alphabetize the letters","capitalise","capitalize","capitalize each word","hades","letters in order","sort the letters","title case"]],["has","among"]],"pyramid":["render.str",["transform.sortLetters",["transform.title",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-e81a1643","guard":[["hasAny",["artemis","delete","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.lastWord"],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-ea1698a0","guard":[["hasAny",["all caps","alphabetize the letters","capital letters","capitals","hades","letters in order","sort the letters","upper case","uppercase"]],["has","among"]],"pyramid":["render.str",["transform.upper",["transform.sortLetters",["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-eba9b5e4","guard":[["hasAny",["first n","hypnos","shortest","shortest one","shortest word","take","top"]]],"pyramid":["render.str",["aggregate.shortest",["transform.takeStrs",["sense.list"],{"lit":2}]]],"mem":null},
{"id":"n-f19a5380","guard":[["hasAny",["aphrodite","separate by","split","split by"]],["has","pick"]],"pyramid":["render.list",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-f4eccd40","guard":[["hasAny",["capitalise","capitalize","capitalize each word","hades","item number","nth","position","title case"]],["has","among"]],"pyramid":["render.str",["transform.title",["transform.nthStr",["sense.content"],{"lit":2}]]],"mem":null},
{"id":"n-f7812dd9","guard":[["hasAny",["all caps","artemis","capital letters","capitals","element","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.str",["transform.upper",["transform.nthStr",["sense.list"],{"lit":3}]]],"mem":null},
{"id":"n-fc2c7d3d","guard":[["hasAny",["divisor count","hades","how many factors","item number","nth","number of divisors","position"]],["has","among"]],"pyramid":["render.str",["transform.nthStr",["sense.words"],["compute.divisorCount",["sense.wordCount"]]]],"mem":null},
{"id":"n-0449241d","guard":[["hasAny",["change to","hades","replace","substitute","swap"]],["has","among"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.lastWord"],["sense.wordAt",{"lit":2}]]],"mem":null},
{"id":"n-0f12a57e","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.after",{"lit":"greek"}]]],"mem":null},
{"id":"n-1e818319","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-26688d78","guard":[["hasAny",["element","hades","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hades is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-2ad3b340","guard":[["hasAny",["ares","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Ares is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-36594f0d","guard":[["hasAny",["artemis","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}]],"mem":null},
{"id":"n-44b73c02","guard":[["hasAny",["element","eros","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Eros is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-4b045d63","guard":[["hasAny",["element","erebus","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Erebus is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-657a23f4","guard":[["hasAny",["artemis","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-65f793d6","guard":[["hasAny",["aphrodite","change to","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":2}],["sense.lastWord"]]],"mem":null},
{"id":"n-6cd99b65","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.after",{"lit":"deity"}]]],"mem":null},
{"id":"n-71d3015c","guard":[["hasAny",["baldur","element","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Gaia is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-7abff3b9","guard":[["hasAny",["artemis","from position","items from to","longest","longest one","longest word","slice"]]],"pyramid":["render.str",["aggregate.longest",["transform.sliceStrs",["sense.words"],{"lit":10},["sense.wordCount"]]]],"mem":null},
{"id":"n-7b7d8cfb","guard":[["hasAny",["artemis","from position","items from to","shortest","shortest one","shortest word","slice"]]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":5},["sense.wordCount"]]]],"mem":null},
{"id":"n-855b90db","guard":[["hasAny",["aphrodite","change to","replace","substitute","swap"]],["has","pick"]],"pyramid":["render.str",["transform.replace",["sense.subject"],["sense.wordAt",{"lit":2}],["sense.text"]]],"mem":null},
{"id":"n-913e1dd1","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.before",{"lit":"greek"}]]],"mem":null},
{"id":"n-9b2b046f","guard":[["hasAny",["element","freya","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hera is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-a58972f8","guard":[["hasAny",["aphrodite","separate by","shortest","shortest one","shortest word","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.shortest",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-b2bcb179","guard":[["hasAny",["element","hermes","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Hermes is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-bef6374e","guard":[["hasAny",["element","item number","nth","position","zeus"]]],"pyramid":["render.template",{"lit":["Zeus is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-ca9809aa","guard":[["hasAny",["delete","hades","remove","strip out","without"]]],"pyramid":["render.str",["transform.remove",["sense.wordAt",{"lit":2}],["sense.after",{"lit":"is"}]]],"mem":null},
{"id":"n-cc9b2a55","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.before",{"lit":"deity"}]]],"mem":null},
{"id":"n-d3a7fae9","guard":[["hasAny",["from position","hypnos","items from to","shortest","shortest one","shortest word","slice"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},["sense.wordCount"]]]],"mem":null},
{"id":"n-d8f08656","guard":[["hasAny",["from position","hypnos","items from to","shortest","shortest one","shortest word","slice"]],["has","which"]],"pyramid":["render.str",["aggregate.shortest",["transform.sliceStrs",["sense.content"],{"lit":3},{"lit":5}]]],"mem":null},
{"id":"n-e3e5fe43","guard":[["hasAny",["hades","item number","nth","position"]],["has","among"]],"pyramid":["render.template",{"lit":[{"slot":0}," is a Greek ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["sense.lastWord"]],"mem":null},
{"id":"n-e7e30cc9","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.wordAt",{"lit":1}]]],"mem":null},
{"id":"n-f5d0bbd7","guard":[["hasAny",["artemis","change to","replace","substitute","swap"]]],"pyramid":["render.str",["transform.replace",["sense.lastWord"],["sense.subject"],["sense.before",{"lit":"is"}]]],"mem":null},
{"id":"n-f88356c2","guard":[["hasAny",["aphrodite","longest","longest one","longest word","separate by","split","split by"]],["has","pick"]],"pyramid":["render.str",["aggregate.longest",["transform.split",["sense.subject"],["sense.wordAt",{"lit":2}]]]],"mem":null},
{"id":"n-6b0ccdd3","guard":[["hasAny",["chaos","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]]],"mem":null},
{"id":"n-b15158ef","guard":[["hasAny",["chaos","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":["Chaos is a ",{"slot":0}," ",{"slot":1},"."]},["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-195950e8","guard":[["hasAny",["item number","nth","poseidon","position"]]],"pyramid":["render.template",{"lit":["Poseidon is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-232a18af","guard":[["hasAny",["item number","nth","position","thalassa"]],["has","pick"]],"pyramid":["render.template",{"lit":["Thalassa is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-2758fd33","guard":[["hasAny",["artemis","item number","nth","position"]]],"pyramid":["render.template",{"lit":["Artemis is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-31cc71a8","guard":[["hasAny",["item number","nth","phanes","position"]]],"pyramid":["render.template",{"lit":["Phanes is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-3c92ae3b","guard":[["hasAny",["athena","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Athena is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-454a680c","guard":[["hasAny",["item number","nth","position","uranus"]]],"pyramid":["render.template",{"lit":["Uranus is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-49ca7ed1","guard":[["hasAny",["aphrodite","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["Aphrodite is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-4ec6600f","guard":[["hasAny",["demeter","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Demeter is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-576f520d","guard":[["hasAny",["aether","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Aether is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-5b637142","guard":[["hasAny",["item number","nth","position","shiva"]],["has","which"]],"pyramid":["render.template",{"lit":["Thanatos is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d0bc5e2f","guard":[["hasAny",["hypnos","item number","nth","position"]],["has","which"]],"pyramid":["render.template",{"lit":["Hypnos is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e1cf8c43","guard":[["hasAny",["chronos","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["Chronos is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e7958cf1","guard":[["hasAny",["apollo","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["Apollo is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-e7fee2a0","guard":[["hasAny",["element","hades","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," deity."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}]],"mem":null},
{"id":"n-e92bba0e","guard":[["hasAny",["item number","nth","odin","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["Tartarus is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-f50ec30c","guard":[["hasAny",["dionysus","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["Dionysus is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-fde5d93a","guard":[["hasAny",["brahma","item number","nth","position"]],["has","pick"]],"pyramid":["render.template",{"lit":["Hephaestus is a ",{"slot":0}," ",{"slot":1},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.content"],{"lit":3}]],"mem":null},
{"id":"n-1ce28b69","guard":[["hasAny",["element","hades","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.lastWord"]],"mem":null},
{"id":"n-4a457946","guard":[["hasAny",["artemis","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d30a1c22","guard":[["hasAny",["element","hades","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["sense.subject"]],"mem":null},
{"id":"n-07fb22c8","guard":[["hasAny",["all caps","artemis","capital letters","capitals","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.upper",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-1982ee7a","guard":[["hasAny",["artemis","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.swapCase",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-24ecaed6","guard":[["hasAny",["artemis","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["render.list",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-2c1435eb","guard":[["hasAny",["element","hades","invert case","item number","nth","position","swap case","toggle case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.swapCase",["sense.lastWord"]]],"mem":null},
{"id":"n-358f58cf","guard":[["hasAny",["artemis","capitalise","capitalize","capitalize each word","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.title",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-35d0dc04","guard":[["hasAny",["element","hades","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.subject"]]],"mem":null},
{"id":"n-37c4b208","guard":[["hasAny",["artemis","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.lower",["sense.lastWord"]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-3d902443","guard":[["hasAny",["capitalise","capitalize","capitalize each word","element","hades","item number","nth","position","title case"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.title",["sense.lastWord"]]],"mem":null},
{"id":"n-7e861e66","guard":[["hasAny",["element","hades","item number","lower case","lowercase","nth","position","small letters"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.lower",["sense.lastWord"]]],"mem":null},
{"id":"n-867aa7da","guard":[["hasAny",["chaos","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":4}],["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d26f1046","guard":[["hasAny",["chaos","element","item number","longest","longest one","longest word","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.list"],{"lit":2}],["aggregate.longest",["sense.content"]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-d48b0aa1","guard":[["hasAny",["artemis","first n","item number","nth","position","take"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["sense.lastWord"],["render.and",["transform.takeStrs",["sense.content"],{"lit":1}]],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-f7e2b9d4","guard":[["hasAny",["all caps","capital letters","capitals","element","hades","item number","nth","position","upper case","uppercase"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["transform.upper",["sense.lastWord"]]],"mem":null},
{"id":"n-38ab8cf7","guard":[["hasAny",["each word","element","hades","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["render.and",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-4c888e93","guard":[["hasAny",["artemis","item number","nth","position"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":5}],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-59de54a2","guard":[["hasAny",["each word","element","hades","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["transform.nthStr",["sense.content"],{"lit":2}],["transform.nthStr",["sense.words"],{"lit":10}],["render.list",["transform.words",["sense.lastWord"]]]],"mem":null},
{"id":"n-a65f4d98","guard":[["hasAny",["artemis","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.and",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null},
{"id":"n-e127b346","guard":[["hasAny",["artemis","each word","item number","nth","position","split into words"]]],"pyramid":["render.template",{"lit":[{"slot":0}," is a ",{"slot":1}," ",{"slot":2},"."]},["render.list",["transform.words",["sense.lastWord"]]],["transform.nthStr",["sense.content"],{"lit":1}],["transform.nthStr",["sense.content"],{"lit":2}]],"mem":null}
];
const RUN = makeColony(COLONY);
export const examples = [{"q":"pick a Greek deity from Chronos, Mars or Lakshmi","expect":{"contains":["Chronos"],"notContains":["Lakshmi","Mars"],"notRefusal":true}},{"q":"among Venus, Ganesha or Ares, which one is a Greek deity","expect":{"contains":["Ares"],"notContains":["Ganesha","Venus"],"notRefusal":true}},{"q":"which of these is a Greek deity: Saturn, Demeter or Vesta","expect":{"contains":["Demeter"],"notContains":["Saturn","Vesta"],"notRefusal":true}},{"q":"which of these is a Greek deity: Horus, Athena or Vulcan","expect":{"contains":["Athena"],"notContains":["Vulcan","Horus"],"notRefusal":true}},{"q":"which of these is a Greek deity: Uranus, Horus or Ganesha","expect":{"contains":["Uranus"],"notContains":["Horus","Ganesha"],"notRefusal":true}},{"q":"which of these is a Greek deity: Hypnos, Osiris or Ganesha","expect":{"contains":["Hypnos"],"notContains":["Ganesha","Osiris"],"notRefusal":true}},{"q":"pick a Greek deity from Diana, Phanes or Mars","expect":{"contains":["Phanes"],"notContains":["Mars","Diana"],"notRefusal":true}},{"q":"pick a Greek deity from Freya, Odin or Tartarus","expect":{"contains":["Tartarus"],"notContains":["Freya","Odin"],"notRefusal":true}},{"q":"pick a Greek deity from Thalassa, Diana or Loki","expect":{"contains":["Thalassa"],"notContains":["Diana","Loki"],"notRefusal":true}},{"q":"which of these is a Greek deity: Thanatos, Shiva or Loki","expect":{"contains":["Thanatos"],"notContains":["Shiva","Loki"],"notRefusal":true}},{"q":"which of these is a Greek deity: Vulcan, Aether or Loki","expect":{"contains":["Aether"],"notContains":["Loki","Vulcan"],"notRefusal":true}},{"q":"pick a Greek deity from Dionysus, Loki or Set","expect":{"contains":["Dionysus"],"notContains":["Set","Loki"],"notRefusal":true}},{"q":"which of these is a Greek deity: Minerva, Poseidon or Horus","expect":{"contains":["Poseidon"],"notContains":["Minerva","Horus"],"notRefusal":true}},{"q":"among Ganesha, Gaia or Baldur, which one is a Greek deity","expect":{"contains":["Gaia"],"notContains":["Ganesha","Baldur"],"notRefusal":true}},{"q":"among Hades, Venus or Isis, which one is a Greek deity","expect":{"contains":["Hades"],"notContains":["Venus","Isis"],"notRefusal":true}},{"q":"pick a Greek deity from Horus, Hephaestus or Brahma","expect":{"contains":["Hephaestus"],"notContains":["Brahma","Horus"],"notRefusal":true}},{"q":"among Freya, Hera or Ra, which one is a Greek deity","expect":{"contains":["Hera"],"notContains":["Freya"],"notRefusal":true}},{"q":"among Loki, Zeus or Minerva, which one is a Greek deity","expect":{"contains":["Zeus"],"notContains":["Minerva","Loki"],"notRefusal":true}},{"q":"which of these is a Greek deity: Ganesha, Mars or Artemis","expect":{"contains":["Artemis"],"notContains":["Ganesha","Mars"],"notRefusal":true}},{"q":"pick a Greek deity from Ganesha, Apollo or Set","expect":{"contains":["Apollo"],"notContains":["Set","Ganesha"],"notRefusal":true}}];
export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });
/** The answer of the first cell of the colony that answers q, or null. */
export function answer(q) { return RUN.answer(String(q ?? '')); }
/** Whether a cell of the colony answers q. */
export function can(q) { return answer(q) !== null; }
