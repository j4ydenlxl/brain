// cells/fhrr.mjs: THE PHASOR QUANTUM. Fourier Holographic Reduced Representations.
//
// His question was "what if AI was quantum, instead of tokens qubits are like quantum
// tokens". The honest, buildable form of that on this machine is a phasor hypervector:
// every dimension is a phase on the unit circle, so a signal is a vector of D unit
// complex amplitudes. Superposition is complex addition (the parts interfere, they do
// not overwrite). Binding is phase addition, which is a diagonal unitary operator, so it
// has an EXACT inverse: phase subtraction. Reading a value back out of a superposition is
// interference, the real part of the normalised inner product. This is the same algebra a
// quantum register uses for amplitudes minus the one thing hardware would add: entangled
// amplitudes that cannot be written as a product of per-dimension states. Everything here
// is a product state, held in classical memory, measured without collapse.
//
// Representation: Float32Array of D phases in radians, wrapped into [0, TAU).
//   bind(a, b)     = wrap(a + b)              unitary, exact inverse
//   unbind(a, b)   = wrap(a - b)              exact: unbind(bind(a, b), b) === a
//   bundle(list)   = arg(sum of e^{i phase})  superposition, magnitude kept separately
//   sim(a, b)      = mean cos(a - b)          interference, 1 when identical
//   power(a, k)    = wrap(a * k)              fractional binding, k real, encodes continua
//   permute(a, k)  = roll                     sequence and role shifts
//   resonate(...)  = alternating projection   factorises a product back into its factors
//
// The bipolar hv in core/signal.mjs is the special case where every phase is 0 or pi.
// phv keeps the whole circle, which is what buys continuous quantities (a price, a
// position, a time) as an exact algebraic operation rather than a quantised bucket.
//
// Nothing in core/primitives.mjs is touched. core/signal.mjs gained the kind name and
// three case labels; see notes/fhrr.md for the exact lines.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';

export const TAU = Math.PI * 2;
export const D = S.D; // 8192, the same dimension the bipolar hv uses

// ---------------------------------------------------------------- construction
export const wrap = (x) => { const y = x - TAU * Math.floor(x / TAU); return y === TAU ? 0 : y; };

export function phvRandom(rng, d = D) {
  const p = new Float32Array(d);
  for (let i = 0; i < d; i++) p[i] = (rng.u32() / 4294967296) * TAU;
  return p;
}
export function phvFromSeed(label, d = D) { return phvRandom(new RNG('phv:' + label), d); }
export function phvZero(d = D) { return new Float32Array(d); } // the identity of bind

// ---------------------------------------------------------------- scalar reference
// Kept exported so the wasm kernels can be graded lane for lane against them.
export const scalar = {
  bind(a, b) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = wrap(a[i] + b[i]); return o; },
  unbind(a, b) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = wrap(a[i] - b[i]); return o; },
  sim(a, b) { const n = a.length; let s = 0; for (let i = 0; i < n; i++) s += Math.cos(a[i] - b[i]); return s / n; },
};

// ---------------------------------------------------------------- wasm SIMD kernels
// Node ships WebAssembly SIMD and this repo has zero dependencies, so this file carries its
// own assembler for three f32x4 kernels: bind, unbind and sim. sim needs a cosine, which
// wasm has no instruction for, so the kernel range reduces to t in [-1/2, 1/2] with
// f32x4.nearest and evaluates the Taylor series of cos(TAU t) to u^9 by Horner. That is an
// approximation, so the kernel is adopted for sim ONLY if it is both faster than the JS
// loop and within TOL of it on a calibration sample. calibration below prints both numbers.
const I32 = 0x7f, F32 = 0x7d, V128 = 0x7b;
const uleb = (n) => { const o = []; do { let b = n & 0x7f; n >>>= 7; if (n) b |= 0x80; o.push(b); } while (n); return o; };
const sleb = (n) => { const o = []; for (;;) { let b = n & 0x7f; n >>= 7; const done = (n === 0 && !(b & 0x40)) || (n === -1 && (b & 0x40)); if (!done) b |= 0x80; o.push(b); if (done) return o; } };
const str = (s) => { const b = [...Buffer.from(s, 'utf8')]; return [...uleb(b.length), ...b]; };
const section = (id, bytes) => [id, ...uleb(bytes.length), ...bytes];
const wvec = (items) => [...uleb(items.length), ...items.flat()];

const get = (i) => [0x20, ...uleb(i)], set = (i) => [0x21, ...uleb(i)], tee = (i) => [0x22, ...uleb(i)];
const i32 = (v) => [0x41, ...sleb(v)];
const f32c = (x) => { const b = new Uint8Array(4); new DataView(b.buffer).setFloat32(0, x, true); return [0x43, ...b]; };
const ADD = [0x6a], GE_U = [0x4f], FADDS = [0x92];
const BLOCK = [0x02, 0x40], LOOP = [0x03, 0x40], END = [0x0b];
const br = (d) => [0x0c, ...uleb(d)], brIf = (d) => [0x0d, ...uleb(d)];
const v = (code) => [0xfd, ...uleb(code)];
const VLOAD = [...v(0), 0, 0], VSTORE = [...v(11), 0, 0];
const SPLATF = v(19), LANEF = (k) => [...v(31), k];
const FLOOR4 = v(104), NEAREST4 = v(106), FADD4 = v(228), FSUB4 = v(229), FMUL4 = v(230);

function func(params, results, locals, body) {
  const type = [0x60, ...wvec(params.map(p => [p])), ...wvec(results.map(r => [r]))];
  const decl = wvec(locals.map(([count, t]) => [...uleb(count), t]));
  const code = [...decl, ...body.flat(), ...END];
  return { type, code: [...uleb(code.length), ...code] };
}

// wrapping add / sub over f32x4: out = s - TAU * floor(s / TAU), with s = a + b or a - b.
// params a=0 b=1 out=2 nBytes=3; locals 4 i, 5 tau, 6 invTau, 7 s
function wrapFn(op) {
  return func([I32, I32, I32, I32], [], [[1, I32], [3, V128]], [
    f32c(TAU), SPLATF, set(5), f32c(1 / TAU), SPLATF, set(6), i32(0), set(4),
    BLOCK, LOOP,
      get(4), get(3), GE_U, brIf(1),
      get(2), get(4), ADD,
      get(0), get(4), ADD, VLOAD, get(1), get(4), ADD, VLOAD, op, tee(7),
      get(7), get(6), FMUL4, FLOOR4, get(5), FMUL4, FSUB4,
      VSTORE,
      get(4), i32(16), ADD, set(4),
      br(0),
    END, END,
  ]);
}
// cos Taylor coefficients in t where the angle is TAU * t: c_k = (-1)^k (TAU)^{2k} / (2k)!
const COS_C = (() => { const c = []; let f = 1, p = 1; for (let k = 0; k <= 9; k++) { if (k > 0) { f *= (2 * k - 1) * (2 * k); p *= TAU * TAU; } c.push(((k % 2) ? -1 : 1) * p / f); } return c; })();
// sim(a=0, b=1, nBytes=2) -> f32 sum of cos(a - b); locals 3 i, 4 acc, 5 t, 6 u, 7 p, 8 invTau, 9..18 coefficients
const simFn = func([I32, I32, I32], [F32], [[1, I32], [15, V128]], [
  f32c(1 / TAU), SPLATF, set(8),
  ...COS_C.map((c, k) => [...f32c(c), ...SPLATF, ...set(9 + k)]),
  f32c(0), SPLATF, set(4), i32(0), set(3),
  BLOCK, LOOP,
    get(3), get(2), GE_U, brIf(1),
    get(0), get(3), ADD, VLOAD, get(1), get(3), ADD, VLOAD, FSUB4, get(8), FMUL4, set(5),
    get(5), get(5), NEAREST4, FSUB4, set(5),
    get(5), get(5), FMUL4, set(6),
    get(18), set(7),
    ...[8, 7, 6, 5, 4, 3, 2, 1, 0].map(k => [...get(7), ...get(6), ...FMUL4, ...get(9 + k), ...FADD4, ...set(7)]),
    get(4), get(7), FADD4, set(4),
    get(3), i32(16), ADD, set(3),
    br(0),
  END, END,
  get(4), LANEF(0), get(4), LANEF(1), FADDS, get(4), LANEF(2), FADDS, get(4), LANEF(3), FADDS,
]);

const fns = [wrapFn(FADD4), wrapFn(FSUB4), simFn];
const names = ['bind', 'unbind', 'sim'];
const PAGES = 48; // 3 MiB, grown on demand
export const moduleBytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  ...section(1, wvec(fns.map(f => f.type))),
  ...section(3, wvec(fns.map((_, i) => uleb(i)))),
  ...section(5, wvec([[0x00, ...uleb(PAGES)]])),
  ...section(7, wvec([...names.map((n, i) => [...str(n), 0x00, ...uleb(i)]), [...str('mem'), 0x02, 0x00]])),
  ...section(10, wvec(fns.map(f => f.code))),
]);

let inst = null, mem = null, f32view = null, why = '';
try {
  inst = new WebAssembly.Instance(new WebAssembly.Module(moduleBytes), {});
  mem = inst.exports.mem; f32view = new Float32Array(mem.buffer);
} catch (e) { inst = null; why = String((e && e.message) || e); }
export const wasmAvailable = inst !== null;
export const wasmUnavailableReason = why;

const PAGE = 65536;
function ensure(bytes) { if (mem.buffer.byteLength < bytes) { mem.grow(Math.ceil((bytes - mem.buffer.byteLength) / PAGE)); f32view = new Float32Array(mem.buffer); } }
export const fits = (n) => wasmAvailable && n > 0 && n % 4 === 0;

export function bindWasm(a, b) {
  const n = a.length, bytes = n * 4;
  ensure(bytes * 3);
  f32view.set(a, 0); f32view.set(b, n);
  inst.exports.bind(0, bytes, 2 * bytes, bytes);
  return new Float32Array(mem.buffer.slice(2 * bytes, 3 * bytes));
}
export function unbindWasm(a, b) {
  const n = a.length, bytes = n * 4;
  ensure(bytes * 3);
  f32view.set(a, 0); f32view.set(b, n);
  inst.exports.unbind(0, bytes, 2 * bytes, bytes);
  return new Float32Array(mem.buffer.slice(2 * bytes, 3 * bytes));
}
export function simWasm(a, b) {
  const n = a.length, bytes = n * 4;
  ensure(bytes * 2);
  f32view.set(a, 0); f32view.set(b, n);
  return inst.exports.sim(0, bytes, bytes) / n;
}

// calibration: agreement and speed against the scalar loops, measured here, on this host.
// Nothing is adopted on belief; the numbers this returns are what bench/fhrr.mjs prints.
export const TOL = 1e-6;
export function calibrate({ d = D, trials = 8, reps = 40, seed = 'fhrr:calibrate' } = {}) {
  const out = { available: wasmAvailable, reason: wasmUnavailableReason, d, bindMaxErr: null, simMaxErr: null, jsBindNs: null, wasmBindNs: null, jsSimNs: null, wasmSimNs: null, useBind: false, useSim: false };
  if (!wasmAvailable || !fits(d)) return out;
  const rng = new RNG(seed);
  const A = [], B = [];
  for (let i = 0; i < trials; i++) { A.push(phvRandom(rng, d)); B.push(phvRandom(rng, d)); }
  let bindErr = 0, simErr = 0;
  for (let i = 0; i < trials; i++) {
    const js = scalar.bind(A[i], B[i]), wa = bindWasm(A[i], B[i]);
    for (let k = 0; k < d; k++) { let e = Math.abs(js[k] - wa[k]); if (e > Math.PI) e = Math.abs(e - TAU); if (e > bindErr) bindErr = e; }
    const ju = scalar.unbind(A[i], B[i]), wu = unbindWasm(A[i], B[i]);
    for (let k = 0; k < d; k++) { let e = Math.abs(ju[k] - wu[k]); if (e > Math.PI) e = Math.abs(e - TAU); if (e > bindErr) bindErr = e; }
    simErr = Math.max(simErr, Math.abs(scalar.sim(A[i], B[i]) - simWasm(A[i], B[i])));
  }
  const time = (fn) => { fn(); const t0 = process.hrtime.bigint(); for (let r = 0; r < reps; r++) for (let i = 0; i < trials; i++) fn(i); return Number(process.hrtime.bigint() - t0) / (reps * trials); };
  out.bindMaxErr = bindErr; out.simMaxErr = simErr;
  out.jsBindNs = time((i = 0) => scalar.bind(A[i], B[i]));
  out.wasmBindNs = time((i = 0) => bindWasm(A[i], B[i]));
  out.jsSimNs = time((i = 0) => scalar.sim(A[i], B[i]));
  out.wasmSimNs = time((i = 0) => simWasm(A[i], B[i]));
  out.useBind = bindErr <= TOL && out.wasmBindNs < out.jsBindNs;
  out.useSim = simErr <= TOL && out.wasmSimNs < out.jsSimNs;
  return out;
}
// The calibration runs 8 trials of 8192 lanes through four timed loops. tools/footprint-probe
// measured it at 23.9 MB of rss and 74 ms charged to every import of this module, paid by a
// `brain help` and by every tool that only registers the phasor cell kinds, so it is deferred
// to the first phasor bind, unbind or sim. It still runs exactly once, on the same seed, and
// it still decides adoption from measured error and measured time, never from belief.
let cal_ = null;
export function calibration() { return (cal_ ??= calibrate()); }
// BRAIN_FHRR_CAL_EAGER=1 calibrates at import: the behaviour this file had before the
// calibration was deferred, kept so bench/footprint.mjs can measure both arms in one run.
if (process.env.BRAIN_FHRR_CAL_EAGER === '1') calibration();
// CAL keeps its name and its shape for bench/fhrr.mjs and test/fhrr.test.mjs: reading any
// property of it runs the calibration once. A process that never touches a phasor vector
// never pays for it.
export const CAL = new Proxy({}, {
  get: (_t, k) => calibration()[k],
  has: (_t, k) => k in calibration(),
  ownKeys: () => Reflect.ownKeys(calibration()),
  getOwnPropertyDescriptor: (_t, k) => {
    const d = Object.getOwnPropertyDescriptor(calibration(), k);
    return d ? { ...d, configurable: true } : undefined;
  },
});

// ---------------------------------------------------------------- the algebra
export function bind(a, b) { return (calibration().useBind && fits(a.length) && a.length === b.length) ? bindWasm(a, b) : scalar.bind(a, b); }
export function unbind(a, b) { return (calibration().useBind && fits(a.length) && a.length === b.length) ? unbindWasm(a, b) : scalar.unbind(a, b); }
export function sim(a, b) { return (calibration().useSim && fits(a.length) && a.length === b.length) ? simWasm(a, b) : scalar.sim(a, b); }
export function inverse(a) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = wrap(-a[i]); return o; }
export function bindMany(list) { let o = list[0]; for (let i = 1; i < list.length; i++) o = bind(o, list[i]); return o; }

// bundle: complex addition, then the phase is kept and the magnitude is returned beside it.
// The magnitude per dimension is the confidence that the superposition survived: k
// quasi-orthogonal members leave a resultant of about sqrt(k) out of k.
export function bundleFull(list, weights = null, d = null) {
  const n = d ?? (list.length ? list[0].length : D);
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let k = 0; k < list.length; k++) {
    const p = list[k], w = weights ? weights[k] : 1;
    for (let i = 0; i < n; i++) { re[i] += w * Math.cos(p[i]); im[i] += w * Math.sin(p[i]); }
  }
  const phases = new Float32Array(n), mag = new Float32Array(n);
  for (let i = 0; i < n; i++) { phases[i] = wrap(Math.atan2(im[i], re[i])); mag[i] = Math.hypot(re[i], im[i]); }
  return { phases, mag, count: list.length };
}
export function bundle(list, weights = null) { return bundleFull(list, weights).phases; }

export function permute(a, k = 1) {
  const n = a.length, o = new Float32Array(n), s = ((k % n) + n) % n;
  for (let i = 0; i < n; i++) o[(i + s) % n] = a[i];
  return o;
}
export function unpermute(a, k = 1) { return permute(a, -k); }

// power: FRACTIONAL BINDING. phases * k, k any real. power(a, 1) is a, power(a, 0) is the
// identity, power(a, -1) is the inverse, and power(a, 2.5) is a bind of a with itself two
// and a half times. sim(power(a, x), power(a, y)) is a kernel in |x - y|: this is how a
// continuous quantity (a price, a coordinate, a delay) enters the algebra without buckets.
export function power(a, k) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = wrap(a[i] * k); return o; }
export function encodeNumber(base, x) { return power(base, x); }
export function encodeVector(bases, xs) {
  const parts = []; for (let i = 0; i < xs.length; i++) parts.push(power(bases[i], xs[i]));
  return bindMany(parts);
}

// ---------------------------------------------------------------- codebook (cleanup memory)
export class PhasorCodebook {
  constructor(d = D, names = []) { this.d = d; this.items = new Map(); for (const n of names) this.get(n); }
  get(name) { let v = this.items.get(name); if (!v) { v = phvFromSeed(name + '#' + this.d, this.d); this.items.set(name, v); } return v; }
  set(name, v) { this.items.set(name, v); return v; }
  has(name) { return this.items.has(name); }
  get size() { return this.items.size; }
  names() { return [...this.items.keys()]; }
  vectors() { return [...this.items.values()]; }
  nearest(v, k = 1) {
    const scored = [];
    for (const [name, u] of this.items) scored.push([name, sim(u, v)]);
    scored.sort((a, b) => b[1] - a[1]);
    return k === 1 ? (scored[0] ?? null) : scored.slice(0, k);
  }
  serialize() { return { d: this.d, items: [...this.items].map(([n, v]) => [n, Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString('base64')]) }; }
  static from(o) {
    const c = new PhasorCodebook(o.d);
    for (const [n, b] of o.items) { const buf = Buffer.from(b, 'base64'); c.items.set(n, new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))); }
    return c;
  }
}

// ---------------------------------------------------------------- superposition memory
// Writes key-bound values into one complex accumulator and reads any one back by
// unbinding its key. The accumulator is kept as re/im so a write is exact addition and
// nothing is lost to repeated re-wrapping.
export class PhasorMemory {
  constructor(d = D) { this.d = d; this.re = new Float64Array(d); this.im = new Float64Array(d); this.n = 0; }
  write(keyPhv, valuePhv, w = 1) {
    const b = scalar.bind(keyPhv, valuePhv);
    for (let i = 0; i < this.d; i++) { this.re[i] += w * Math.cos(b[i]); this.im[i] += w * Math.sin(b[i]); }
    this.n++;
    return this;
  }
  phases() { const p = new Float32Array(this.d); for (let i = 0; i < this.d; i++) p[i] = wrap(Math.atan2(this.im[i], this.re[i])); return p; }
  magnitude() { let s = 0; for (let i = 0; i < this.d; i++) s += Math.hypot(this.re[i], this.im[i]); return this.n ? s / (this.d * this.n) : 0; }
  read(keyPhv) { return unbind(this.phases(), keyPhv); }
  readNamed(keyPhv, codebook) { return codebook.nearest(this.read(keyPhv)); }
  serialize() { return { d: this.d, n: this.n, re: Buffer.from(this.re.buffer).toString('base64'), im: Buffer.from(this.im.buffer).toString('base64') }; }
  static from(o) {
    const m = new PhasorMemory(o.d); m.n = o.n;
    const r = Buffer.from(o.re, 'base64'), i = Buffer.from(o.im, 'base64');
    m.re = new Float64Array(r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength));
    m.im = new Float64Array(i.buffer.slice(i.byteOffset, i.byteOffset + i.byteLength));
    return m;
  }
}

// ---------------------------------------------------------------- resonator network
// A product x1 (*) x2 (*) x3 of unknown factors drawn from known codebooks cannot be read
// by cleanup: there are 64^3 candidate products and only one is right. A resonator instead
// holds one superposed estimate per factor and alternates: divide the product by the other
// estimates, project the residue onto that factor's codebook, renormalise to unit phases,
// repeat. The estimates collapse onto one codeword each, or the run reports that they did
// not. Costs are per iteration, not per combination.
function complexOf(p) {
  const n = p.length, re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < n; i++) { re[i] = Math.cos(p[i]); im[i] = Math.sin(p[i]); }
  return { re, im };
}
export function resonate(product, codebooks, { iters = 200, threshold = 0.9, restarts = 16, seed = 'fhrr:resonate' } = {}) {
  let best = null;
  for (let r = 0; r < Math.max(1, restarts); r++) {
    const out = resonateOnce(product, codebooks, { iters, threshold, seed: seed + '#' + r, random: r > 0 });
    out.restarts = r + 1;
    if (!best || out.fit > best.fit) best = out;
    if (best.ok) break;
  }
  return best;
}
// One descent. The first run starts from the superposition of every codeword (the unbiased
// state); a restart starts from random phases, which is what breaks a spurious fixed point.
export function resonateOnce(product, codebooks, { iters = 100, threshold = 0.9, seed = 'fhrr:resonate', random = false } = {}) {
  const d = product.length, F = codebooks.length;
  const books = codebooks.map(list => list.map(complexOf));
  const P = complexOf(product);
  const rng0 = new RNG(seed + ':init');
  const est = books.map((book, f) => {
    const re = new Float64Array(d), im = new Float64Array(d);
    if (random) { for (let i = 0; i < d; i++) { const a = (rng0.u32() / 4294967296) * TAU; re[i] = Math.cos(a); im[i] = Math.sin(a); } }
    else for (const c of book) for (let i = 0; i < d; i++) { re[i] += c.re[i]; im[i] += c.im[i]; }
    return normalise(re, im, d, rng0);
  });
  let last = null, stable = 0, used = 0;
  for (let it = 1; it <= iters; it++) {
    used = it;
    // A = product of every estimate (all unit magnitude, so dividing by one is multiplying
    // by its conjugate); residue for factor f is product * conj(A) * est_f.
    const Are = new Float64Array(d).fill(1), Aim = new Float64Array(d);
    for (const e of est) for (let i = 0; i < d; i++) { const r = Are[i] * e.re[i] - Aim[i] * e.im[i], m = Are[i] * e.im[i] + Aim[i] * e.re[i]; Are[i] = r; Aim[i] = m; }
    const next = [];
    for (let f = 0; f < F; f++) {
      const e = est[f], yre = new Float64Array(d), yim = new Float64Array(d);
      for (let i = 0; i < d; i++) {
        // q = P * conj(A)
        const qr = P.re[i] * Are[i] + P.im[i] * Aim[i], qi = P.im[i] * Are[i] - P.re[i] * Aim[i];
        // y = q * e_f
        yre[i] = qr * e.re[i] - qi * e.im[i];
        yim[i] = qr * e.im[i] + qi * e.re[i];
      }
      const book = books[f], nre = new Float64Array(d), nim = new Float64Array(d);
      for (const c of book) {
        let a = 0;
        for (let i = 0; i < d; i++) a += c.re[i] * yre[i] + c.im[i] * yim[i];
        a /= d;
        for (let i = 0; i < d; i++) { nre[i] += a * c.re[i]; nim[i] += a * c.im[i]; }
      }
      next.push(normalise(nre, nim, d, new RNG(seed + ':' + f + ':' + it)));
    }
    for (let f = 0; f < F; f++) est[f] = next[f];
    // Stopping is decided by the answer, not by stillness: a stable state that does not
    // rebuild the product is a spurious fixed point and the loop keeps going, then restarts.
    const idx = est.map((e, f) => argmaxBook(books[f], e, d));
    const key = idx.join(',');
    if (key === last) {
      stable++;
      if (stable >= 2 && sim(bindMany(idx.map((m, f) => codebooks[f][m])), product) >= threshold) break;
      if (stable >= 8) break;
    } else { stable = 0; last = key; }
  }
  const factors = est.map((e, f) => argmaxBook(books[f], e, d));
  const chosen = factors.map((m, f) => codebooks[f][m]);
  const recomposed = bindMany(chosen);
  const fit = sim(recomposed, product);
  return { factors, fit, iters: used, ok: fit >= threshold };
}
export function normalise(re, im, d, rng) {
  const nre = new Float64Array(d), nim = new Float64Array(d);
  for (let i = 0; i < d; i++) {
    const m = Math.hypot(re[i], im[i]);
    if (m > 1e-12) { nre[i] = re[i] / m; nim[i] = im[i] / m; }
    else { const a = (rng.u32() / 4294967296) * TAU; nre[i] = Math.cos(a); nim[i] = Math.sin(a); } // a dead dimension is repopulated, never left at zero
  }
  return { re: nre, im: nim };
}
function argmaxBook(book, e, d) {
  let best = -Infinity, bi = 0;
  for (let m = 0; m < book.length; m++) {
    const c = book[m]; let a = 0;
    for (let i = 0; i < d; i++) a += c.re[i] * e.re[i] + c.im[i] * e.im[i];
    if (a > best) { best = a; bi = m; }
  }
  return bi;
}

// ---------------------------------------------------------------- cell kinds
const first = (m) => (m.length ? m[m.length - 1].sig : null);
const sigs = (m) => m.map(it => it.sig);

defineKind('phv.encode', {
  doc: 'Encodes a num or a vec into a phasor hypervector by fractional binding of seeded bases.',
  ports: { in: [{ name: 'in', kinds: ['num', 'vec'] }], out: [{ name: 'phv', kinds: ['phv'] }] },
  defaults: { base: 'phv.encode', d: D, scale: 1 },
  init: (p) => ({ bases: [phvFromSeed(p.base + ':0', p.d)] }),
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    const { base, d, scale } = cell.params;
    if (s.kind === 'num') return [{ kind: 'phv', data: power(cell.state.bases[0], S.ratToNumber(s.data) * scale) }];
    const xs = s.data;
    while (cell.state.bases.length < xs.length) cell.state.bases.push(phvFromSeed(base + ':' + cell.state.bases.length, d));
    return [{ kind: 'phv', data: encodeVector(cell.state.bases, Array.from(xs, x => x * scale)) }];
  },
  serialize: (s) => ({ bases: s.bases.map(b => S.dataToJSON('phv', b)) }),
  deserialize: (j) => ({ bases: j.bases.map(b => S.dataFromJSON('phv', b)) }),
});

defineKind('phv.bind', {
  doc: 'Binds every phasor received this tick: phase addition, a unitary with an exact inverse.',
  ports: { in: [{ name: 'in', kinds: ['phv'] }], out: [{ name: 'out', kinds: ['phv'] }] },
  compute: (ins) => { const l = sigs(ins[0]); return [l.length ? { kind: 'phv', data: bindMany(l.map(s => s.data)) } : null]; },
});

defineKind('phv.unbind', {
  doc: 'Exact unbinding: out = a minus b in phase. unbind(bind(a, b), b) is a to float32 precision.',
  ports: { in: [{ name: 'a', kinds: ['phv'] }, { name: 'b', kinds: ['phv'] }], out: [{ name: 'out', kinds: ['phv'] }] },
  init: () => ({ a: null, b: null }),
  compute: (ins, cell) => {
    const a = first(ins[0]), b = first(ins[1]);
    if (a) cell.state.a = a.data;
    if (b) cell.state.b = b.data;
    if (!cell.state.a || !cell.state.b) return [null];
    return [{ kind: 'phv', data: unbind(cell.state.a, cell.state.b) }];
  },
  serialize: (s) => ({ a: s.a && S.dataToJSON('phv', s.a), b: s.b && S.dataToJSON('phv', s.b) }),
  deserialize: (j) => ({ a: j.a && S.dataFromJSON('phv', j.a), b: j.b && S.dataFromJSON('phv', j.b) }),
});

defineKind('phv.bundle', {
  doc: 'Superposes every phasor received this tick by complex addition, weighted by edge weight.',
  ports: { in: [{ name: 'in', kinds: ['phv'] }], out: [{ name: 'out', kinds: ['phv'] }, { name: 'confidence', kinds: ['num'] }] },
  compute: (ins) => {
    const m = ins[0]; if (!m.length) return [null, null];
    const r = bundleFull(m.map(it => it.sig.data), m.map(it => Math.max(0, it.w)));
    let s = 0; for (let i = 0; i < r.mag.length; i++) s += r.mag[i];
    const denom = m.reduce((a, it) => a + Math.max(0, it.w), 0) || 1;
    return [{ kind: 'phv', data: r.phases }, { kind: 'num', data: S.flt(s / (r.mag.length * denom)) }];
  },
});

defineKind('phv.sim', {
  doc: 'Interference between the two most recent phasors: the mean cosine of their phase difference.',
  ports: { in: [{ name: 'a', kinds: ['phv'] }, { name: 'b', kinds: ['phv'] }], out: [{ name: 'sim', kinds: ['num'] }] },
  init: () => ({ a: null, b: null }),
  compute: (ins, cell) => {
    const a = first(ins[0]), b = first(ins[1]);
    if (a) cell.state.a = a.data;
    if (b) cell.state.b = b.data;
    if (!cell.state.a || !cell.state.b) return [null];
    return [{ kind: 'num', data: S.flt(sim(cell.state.a, cell.state.b)) }];
  },
  serialize: (s) => ({ a: s.a && S.dataToJSON('phv', s.a), b: s.b && S.dataToJSON('phv', s.b) }),
  deserialize: (j) => ({ a: j.a && S.dataFromJSON('phv', j.a), b: j.b && S.dataFromJSON('phv', j.b) }),
});

defineKind('phv.resonate', {
  doc: 'Factorises a bound product back into one codeword per codebook by alternating projection.',
  ports: { in: [{ name: 'in', kinds: ['phv'] }], out: [{ name: 'factors', kinds: ['event'] }] },
  defaults: { books: [], d: D, iters: 200, threshold: 0.9, restarts: 16 },
  init: (p) => ({ books: p.books.map(names => names.map(n => phvFromSeed(n + '#' + p.d, p.d))), names: p.books.map(names => names.slice()) }),
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    if (!cell.state.books.length) return [{ kind: 'event', data: { factors: [], ok: false, reason: 'no codebooks configured' } }];
    const r = resonate(s.data, cell.state.books, { iters: cell.params.iters, threshold: cell.params.threshold, restarts: cell.params.restarts });
    return [{ kind: 'event', data: { factors: r.factors.map((m, f) => cell.state.names[f][m]), indices: r.factors, fit: r.fit, iters: r.iters, ok: r.ok } }];
  },
  serialize: (s) => ({ names: s.names }),
  deserialize: (j, cell) => ({ books: j.names.map(names => names.map(n => phvFromSeed(n + '#' + cell.params.d, cell.params.d))), names: j.names }),
});

defineKind('phv.memory', {
  doc: 'A superposition store: writes key-bound values into one accumulator, reads any one back by unbinding its key.',
  ports: {
    in: [{ name: 'write', kinds: ['event'] }, { name: 'read', kinds: ['event'] }],
    out: [{ name: 'value', kinds: ['event'] }, { name: 'phv', kinds: ['phv'] }],
  },
  defaults: { d: D, threshold: 0 },
  init: (p) => ({ mem: new PhasorMemory(p.d), keys: new PhasorCodebook(p.d), values: new PhasorCodebook(p.d), pairs: [] }),
  compute: (ins, cell) => {
    for (const it of ins[0]) {
      const { key, value } = it.sig.data;
      if (key == null || value == null) continue;
      cell.state.mem.write(cell.state.keys.get(key), cell.state.values.get(value));
      cell.state.pairs.push([key, value]);
    }
    const r = first(ins[1]);
    if (!r || r.data.key == null) return [null, null];
    const out = cell.state.mem.read(cell.state.keys.get(r.data.key));
    const near = cell.state.values.nearest(out);
    const name = near && near[1] >= cell.params.threshold ? near[0] : null;
    return [{ kind: 'event', data: { key: r.data.key, value: name, sim: near ? near[1] : 0, stored: cell.state.mem.n } }, { kind: 'phv', data: out }];
  },
  serialize: (s) => ({ mem: s.mem.serialize(), keys: s.keys.serialize(), values: s.values.serialize(), pairs: s.pairs }),
  deserialize: (j) => ({ mem: PhasorMemory.from(j.mem), keys: PhasorCodebook.from(j.keys), values: PhasorCodebook.from(j.values), pairs: j.pairs }),
});

export const PHV_KINDS = Object.freeze(['phv.encode', 'phv.bind', 'phv.unbind', 'phv.bundle', 'phv.sim', 'phv.resonate', 'phv.memory']);
