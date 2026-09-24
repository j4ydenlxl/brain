// core/substrate.mjs: THE DENSE SUBSTRATE. Millions of micro units in one process, held as
// struct-of-arrays typed views on one buffer: no per-unit object, ever. Every unit is the
// same size in memory (one byte of kind, one of region, four params, two state floats, two
// counters, one capability score) and every unit is different: its four params come from a
// seeded hash and the last one is a 24-bit bijection of its index, so no two units share a
// parameter vector. Twenty kinds, each with its own update function. Edges are CSR
// (rowPtr, col, weight, delay) with a spanning ring, seeded local edges and seeded
// long-range edges, so "all connected" is a checked property, not a hope.
//
// Time: tick(t) reads input slot t of a ring of R = maxDelay + 2 slots, runs every unit
// once in one tight loop, and delivers each firing along its out edges into slot
// (t + 1 + delay) % R. Delay 0 lands next tick, matching Connectome.arrival = t + 1 + delay.
//
// Two backends compute the identical IEEE operations in the identical order: a JS reference
// loop, and a wasm kernel assembled by hand below (no toolchain, like core/simd.mjs) with
// the memory layout baked in as immediates. Both run on the same bytes, so a test can build
// two substrates from one seed, tick one with each backend, and demand identical fireCount.
//
// The Brain sees the whole substrate as one cell kind, 'substrate', with an 'in' vec port
// that injects into a chosen slice of units, an 'out' vec port that reads a slice of
// states, and an 'event' port that fires when the firing fraction crosses a threshold.
import { defineKind } from './cell.mjs';
import { hash32 } from './rng.mjs';

// ---------------------------------------------------------------- the kinds
// id, name, cost (drives capability), function (plain English for the clickable brain)
export const KINDS = Object.freeze([
  { name: 'integrate.fire', cost: 0.45, function: 'adds its input to a charge and fires a pulse when the charge reaches its threshold, then resets' },
  { name: 'leaky', cost: 0.55, function: 'like integrate.fire but the charge leaks away every tick at its own rate, so only fast input gets through' },
  { name: 'xor', cost: 0.35, function: 'fires when exactly one of this input and the previous input is above threshold' },
  { name: 'majority', cost: 0.50, function: 'keeps the last three inputs as bits and fires when at least two of them were above threshold' },
  { name: 'delay.line', cost: 0.20, function: 'passes its input through two ticks late, unchanged' },
  { name: 'counter', cost: 0.40, function: 'counts non-zero inputs and fires once every N of them, N set by its own threshold parameter' },
  { name: 'comparator', cost: 0.25, function: 'fires positive above +threshold, negative below -threshold, nothing in between' },
  { name: 'multiplier', cost: 0.55, function: 'multiplies this input by the previous one and fires the product when it is large enough' },
  { name: 'accumulator', cost: 0.60, function: 'a graded running sum that never resets, leaks slowly, and emits a quarter of itself while it is above threshold' },
  { name: 'hash.mix', cost: 0.90, function: 'mixes the input bits with its own signature through an integer hash and emits a pseudo-random value, the same every time for the same input' },
  { name: 'threshold', cost: 0.20, function: 'a step: emits its amplitude when the input is at or above threshold' },
  { name: 'oscillator', cost: 0.65, function: 'advances a phase every tick at its own rate, nudged by input, and fires once per cycle with no input at all' },
  { name: 'latch', cost: 0.40, function: 'sets on a strong positive input and resets on a strong negative one, firing only on the transitions' },
  { name: 'min', cost: 0.30, function: 'the smaller of this input and the previous one; fires when that is a real dip below -threshold' },
  { name: 'max', cost: 0.30, function: 'the larger of this input and the previous one; fires when that is a real peak above threshold' },
  { name: 'router', cost: 0.80, function: 'forwards its input to the first half of its out edges when positive and to the second half when negative' },
  { name: 'squash', cost: 0.60, function: 'compresses a large input into (-1, 1) smoothly and emits it scaled by its amplitude' },
  { name: 'differentiator', cost: 0.45, function: 'emits the change since the previous input when the change is large enough' },
  { name: 'refractory.fire', cost: 0.70, function: 'integrate and fire with a rest period after each pulse during which it cannot fire again' },
  { name: 'inhibit', cost: 0.40, function: 'turns a strong positive input into a negative pulse for everything downstream' },
]);
export const KIND = Object.freeze(Object.fromEntries(KINDS.map((k, i) => [k.name, i])));
const K_ROUTER = KIND.router;
export const NEVER = 0xffffffff; // lastFired for a unit that has not fired

// Regions: contiguous blocks of units, each with its own roster of kinds.
export const REGIONS = Object.freeze([
  { name: 'perception', roster: ['threshold', 'comparator', 'squash', 'hash.mix', 'delay.line', 'xor', 'min', 'max'] },
  { name: 'association', roster: ['integrate.fire', 'leaky', 'majority', 'accumulator', 'multiplier', 'xor', 'squash', 'hash.mix'] },
  { name: 'cognitive', roster: ['xor', 'majority', 'counter', 'comparator', 'multiplier', 'router', 'latch', 'hash.mix'] },
  { name: 'memory', roster: ['latch', 'accumulator', 'delay.line', 'counter', 'leaky', 'min', 'max', 'integrate.fire'] },
  { name: 'motor', roster: ['threshold', 'router', 'inhibit', 'refractory.fire', 'comparator', 'integrate.fire', 'differentiator', 'leaky'] },
  { name: 'homeostasis', roster: ['oscillator', 'accumulator', 'inhibit', 'refractory.fire', 'leaky', 'differentiator', 'min', 'max'] },
  { name: 'generations', roster: ['counter', 'comparator', 'majority', 'hash.mix', 'threshold', 'accumulator', 'xor', 'router'] },
  { name: 'bridge', roster: ['router', 'delay.line', 'refractory.fire', 'oscillator', 'inhibit', 'squash', 'integrate.fire', 'leaky'] },
]);

export const K_PARAMS = 4, S_STATE = 2;
const POP = [0, 1, 1, 2, 1, 2, 2, 3];

// One 32-bit mix of (seed, index, lane). splitmix-style, the same function the JS build and
// the tests use, so a param can be recomputed from its unit index and compared.
export function mix(seed, i, lane) {
  let t = (seed ^ Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(lane + 1, 0x85ebca77)) >>> 0;
  t = Math.imul(t ^ (t >>> 16), 0x21f0aaad);
  t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
  return (t ^ (t >>> 15)) >>> 0;
}
const u01 = (h) => h / 4294967296;

// Bytes the substrate needs for a given size, before any allocation.
export function layoutFor(units, edgesPerUnit, maxDelay) {
  const N = units, E = units * edgesPerUnit, R = maxDelay + 2;
  let off = 0;
  const take = (bytes) => { const at = off; off += bytes; off = (off + 15) & ~15; return at; };
  const L = {
    N, E, R,
    ring: take(R * 4 * N), params: take(16 * N), state: take(8 * N), capability: take(4 * N),
    lastFired: take(4 * N), fireCount: take(4 * N), out: take(4 * N), inDeg: take(4 * N),
    rowPtr: take(4 * (N + 1)), col: take(4 * E), weight: take(4 * E),
    delay: take(E), kind: take(N), region: take(N),
  };
  L.bytes = off;
  return L;
}

export class Substrate {
  /**
   * @param {object} opts
   * @param {number} opts.units number of units (at most 2^24, the bijection width of the signature param)
   * @param {string|number} [opts.seed] everything is a function of this
   * @param {string[]} [opts.kinds] restrict the rosters to these kind names (default: all twenty)
   * @param {number} [opts.edgesPerUnit] out edges per unit, the first is always the spanning ring
   * @param {number} [opts.maxDelay] largest edge delay in ticks (ring of maxDelay + 2 input slots)
   * @param {number} [opts.localWindow] how far a local edge reaches (units either side)
   * @param {'auto'|'js'|'wasm'} [opts.backend]
   */
  constructor({ units, seed = 'substrate', kinds = null, edgesPerUnit = 8, maxDelay = 7, localWindow = 64, excitatory = 0.6, gain = 0.5, backend = 'auto' } = {}) {
    if (!(Number.isInteger(units) && units > 1 && units <= 16777216)) throw new Error('Substrate: units must be an integer in [2, 2^24]');
    if (!(Number.isInteger(edgesPerUnit) && edgesPerUnit >= 1)) throw new Error('Substrate: edgesPerUnit must be a positive integer');
    if (!(Number.isInteger(maxDelay) && maxDelay >= 0 && maxDelay <= 253)) throw new Error('Substrate: maxDelay must be in [0, 253]');
    this.units = units; this.seed = seed; this.seedHash = hash32(String(seed));
    this.edgesPerUnit = edgesPerUnit; this.maxDelay = maxDelay; this.localWindow = localWindow; this.excitatory = excitatory; this.gain = gain;
    this.layout = layoutFor(units, edgesPerUnit, maxDelay);
    this.t = 0; this.lastTickFired = 0; this.totalFired = 0;
    this.allowedKinds = kinds ? kinds.map(n => { if (KIND[n] === undefined) throw new Error('Substrate: unknown kind ' + n); return n; }) : KINDS.map(k => k.name);
    this._allocate(backend);
    this._build();
    this._compileWasm(backend);
  }

  // ------------------------------------------------------------ memory
  _allocate(backend) {
    const bytes = this.layout.bytes;
    this.wasmMemory = null; this.wasmReason = '';
    if (backend !== 'js') {
      try {
        const pages = Math.ceil(bytes / 65536);
        this.wasmMemory = new WebAssembly.Memory({ initial: pages, maximum: pages });
      } catch (e) { this.wasmMemory = null; this.wasmReason = 'memory: ' + String(e && e.message || e); }
    }
    this.buffer = this.wasmMemory ? this.wasmMemory.buffer : new ArrayBuffer(bytes);
    const L = this.layout, b = this.buffer, N = L.N, E = L.E;
    this.ring = new Float32Array(b, L.ring, L.R * N);
    this.params = new Float32Array(b, L.params, K_PARAMS * N);
    this.state = new Float32Array(b, L.state, S_STATE * N);
    this.capability = new Float32Array(b, L.capability, N);
    this.lastFired = new Uint32Array(b, L.lastFired, N);
    this.fireCount = new Uint32Array(b, L.fireCount, N);
    this.out = new Float32Array(b, L.out, N);
    this.inDeg = new Uint32Array(b, L.inDeg, N);
    this.rowPtr = new Uint32Array(b, L.rowPtr, N + 1);
    this.col = new Uint32Array(b, L.col, E);
    this.weight = new Float32Array(b, L.weight, E);
    this.delay = new Uint8Array(b, L.delay, E);
    this.kind = new Uint8Array(b, L.kind, N);
    this.region = new Uint8Array(b, L.region, N);
  }

  // ------------------------------------------------------------ build
  _build() {
    const N = this.units, E = this.edgesPerUnit, seed = this.seedHash, W = this.localWindow, maxDelay = this.maxDelay;
    const nR = REGIONS.length;
    const rosters = REGIONS.map(r => { const l = r.roster.filter(n => this.allowedKinds.includes(n)); return (l.length ? l : this.allowedKinds).map(n => KIND[n]); });
    // signature: (i * odd + c) mod 2^24 is a bijection on [0, 2^24), so p3 is unique per unit
    const odd = (mix(seed, 0, 99) | 1) & 0xffffff, c = mix(seed, 1, 99) & 0xffffff;
    const local = Math.round((E - 1) * 0.6), gain = this.gain;
    this.lastFired.fill(NEVER);
    for (let i = 0; i < N; i++) {
      const r = Math.floor((i * nR) / N);
      this.region[i] = r;
      const ro = rosters[r];
      this.kind[i] = ro[mix(seed, i, 0) % ro.length];
      const p = i * K_PARAMS;
      this.params[p] = 0.2 + u01(mix(seed, i, 1)) * 1.3;        // threshold [0.2, 1.5)
      this.params[p + 1] = 0.5 + u01(mix(seed, i, 2)) * 0.49;   // rate [0.5, 0.99)
      this.params[p + 2] = 0.5 + u01(mix(seed, i, 3)) * 1.0;    // amplitude [0.5, 1.5)
      this.params[p + 3] = ((Math.imul(i, odd) + c) & 0xffffff) / 16777216; // signature, exact in f32
      // edges: ring first, then local, then long range
      const e0 = i * E;
      this.rowPtr[i] = e0;
      this.col[e0] = (i + 1) % N;
      this.weight[e0] = gain * (0.3 + u01(mix(seed, i, 4)) * 0.6);
      this.delay[e0] = 0;
      for (let k = 1; k < E; k++) {
        const h = mix(seed, i, 8 + k), h2 = mix(seed, i, 40 + k);
        let dst;
        if (k <= local) { dst = i + (h % (2 * W + 1)) - W; dst = ((dst % N) + N) % N; }
        else dst = h % N;
        if (dst === i) dst = (i + 1 + (h2 & 1)) % N;
        this.col[e0 + k] = dst;
        const sign = u01(h2) < this.excitatory ? 1 : -1; // the excitatory fraction is a measured choice, see notes/substrate.md
        this.weight[e0 + k] = sign * gain * (0.15 + u01(mix(seed, i, 72 + k)) * 0.85);
        this.delay[e0 + k] = k <= local ? h2 % Math.min(3, maxDelay + 1) : (maxDelay >= 1 ? 1 + (h2 % maxDelay) : 0);
      }
    }
    this.rowPtr[N] = N * E;
    for (let e = 0; e < N * E; e++) this.inDeg[this.col[e]]++;
    for (let i = 0; i < N; i++) {
      const deg = Math.min(1, (this.inDeg[i] + E) / (3 * E));
      const cap = 0.45 * KINDS[this.kind[i]].cost + 0.35 * deg + 0.20 * this.params[i * K_PARAMS + 3];
      this.capability[i] = Math.min(1, Math.max(0, cap));
    }
  }

  // ------------------------------------------------------------ inspection
  edges() { return this.layout.E; }
  unit(id) {
    const N = this.units;
    if (!(Number.isInteger(id) && id >= 0 && id < N)) throw new Error('Substrate.unit: no unit ' + id);
    const k = this.kind[id], p = id * K_PARAMS, s = id * S_STATE;
    const outEdges = [];
    for (let e = this.rowPtr[id], z = Math.min(this.rowPtr[id + 1], this.rowPtr[id] + 32); e < z; e++) outEdges.push({ to: this.col[e], weight: this.weight[e], delay: this.delay[e] });
    return {
      id, kind: k, kindName: KINDS[k].name, function: KINDS[k].function,
      region: this.region[id], regionName: REGIONS[this.region[id]].name,
      capability: this.capability[id],
      params: { threshold: this.params[p], rate: this.params[p + 1], amplitude: this.params[p + 2], signature: this.params[p + 3] },
      state: [this.state[s], this.state[s + 1]], out: this.out[id],
      fireCount: this.fireCount[id], lastFired: this.lastFired[id] === NEVER ? null : this.lastFired[id],
      outEdges, outDegree: this.rowPtr[id + 1] - this.rowPtr[id], inDegree: this.inDeg[id],
    };
  }
  // JSON snapshot of units [lo, hi) for the clickable brain; edges capped per unit.
  snapshot(lo = 0, hi = Math.min(this.units, lo + 256), { edges = 8 } = {}) {
    lo = Math.max(0, lo); hi = Math.min(this.units, hi);
    const units = [];
    for (let i = lo; i < hi; i++) { const u = this.unit(i); u.outEdges = u.outEdges.slice(0, edges); units.push(u); }
    return { t: this.t, lo, hi, units };
  }
  stats() {
    return {
      units: this.units, edges: this.layout.E, edgesPerUnit: this.edgesPerUnit, kinds: KINDS.length, regions: REGIONS.length,
      t: this.t, lastTickFired: this.lastTickFired, totalFired: this.totalFired,
      backend: this.backend, wasm: this.wasmReady, wasmReason: this.wasmReason, bytes: this.layout.bytes, ringSlots: this.layout.R,
    };
  }
  // Weakly connected components by union-find over every edge. 1 means all connected.
  components() {
    const N = this.units, parent = new Int32Array(N);
    for (let i = 0; i < N; i++) parent[i] = i;
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const col = this.col, E = this.layout.E;
    for (let e = 0; e < E; e++) { const a = find(Math.floor(e / this.edgesPerUnit)), b = find(col[e]); if (a !== b) parent[a] = b; }
    let roots = 0;
    for (let i = 0; i < N; i++) if (parent[i] === i) roots++;
    return roots;
  }
  // The signature param is a bijection of the index by construction; this checks it anyway
  // by sorting the raw bit patterns. Returns the number of duplicate signatures (0 = unique).
  duplicateSignatures() {
    const N = this.units, bits = new Uint32Array(N), u32 = new Uint32Array(this.buffer, this.layout.params, K_PARAMS * N);
    for (let i = 0; i < N; i++) bits[i] = u32[i * K_PARAMS + 3];
    bits.sort();
    let dup = 0;
    for (let i = 1; i < N; i++) if (bits[i] === bits[i - 1]) dup++;
    return dup;
  }

  // ------------------------------------------------------------ i/o
  // Add values into the input slot the next tick() will read, starting at unit lo.
  inject(lo, values, scale = 1, maxLen = values.length) {
    const N = this.units, base = (this.t % this.layout.R) * N, n = Math.min(values.length, maxLen, N - lo);
    for (let j = 0; j < n; j++) this.ring[base + lo + j] += values[j] * scale;
    return n;
  }
  readState(lo, len, which = 0) {
    const n = Math.max(0, Math.min(len, this.units - lo)), v = new Float32Array(n);
    for (let j = 0; j < n; j++) v[j] = this.state[(lo + j) * S_STATE + which];
    return v;
  }
  readOut(lo, len) { return this.out.slice(lo, lo + Math.max(0, Math.min(len, this.units - lo))); }

  // ------------------------------------------------------------ the tick
  tick(n = 1) {
    let fired = 0;
    for (let k = 0; k < n; k++) {
      fired = this.backend === 'wasm' ? this.wasm.tick(this.t) : this._tickJS(this.t);
      this.lastTickFired = fired; this.totalFired += fired; this.t++;
    }
    return fired;
  }
  // The JS reference. Every operation here has a twin in the wasm kernel below, in the same
  // order, with the same f32 rounding at the same stores; that is what makes the two agree.
  _tickJS(t) {
    const N = this.units, R = this.layout.R, ring = this.ring, params = this.params, state = this.state;
    const kind = this.kind, lastFired = this.lastFired, fireCount = this.fireCount, out = this.out;
    const rowPtr = this.rowPtr, col = this.col, weight = this.weight, delay = this.delay;
    const inp = (t % R) * N;
    let fired = 0;
    for (let i = 0; i < N; i++) {
      const x = Math.min(Math.max(ring[inp + i], -64), 64);
      const p = i * K_PARAMS, p0 = params[p], p1 = params[p + 1], p2 = params[p + 2], p3 = params[p + 3];
      const s = i * S_STATE; let s0 = state[s], s1 = state[s + 1];
      const k = kind[i];
      let o = 0;
      switch (k) {
        case 0: s0 = s0 + x; if (s0 >= p0) { o = p2; s0 = 0; } break;
        case 1: s0 = s0 * p1 + x; if (s0 >= p0) { o = p2; s0 = 0; } break;
        case 2: if ((x > p0) !== (s0 > p0)) o = p2; s0 = x; break;
        case 3: { const h = (((s1 | 0) << 1) | (x > p0 ? 1 : 0)) & 7; if (POP[h] >= 2) o = p2; s1 = h; break; }
        case 4: o = s1; s1 = s0; s0 = x; break;
        case 5: if (x !== 0) { s0 = s0 + 1; if (s0 >= Math.floor(2 + p0 * 8)) { o = p2; s0 = 0; } } break;
        case 6: o = x > p0 ? p2 : (x < -p0 ? -p2 : 0); break;
        case 7: o = x * s0; s0 = x; if (Math.abs(o) < p0) o = 0; break;
        case 8: s0 = Math.min(Math.max(s0 * p1 + x, -16), 16); o = Math.abs(s0) > p0 ? s0 * 0.25 : 0; break;
        case 9: if (x !== 0) {
          const v = (Math.min(Math.max(x, -32767), 32767) * 65536) | 0, sig = (p3 * 16777216) | 0;
          let h = Math.imul(v ^ sig, 0x9e3779b1 | 0); h = h ^ (h >>> 15); h = Math.imul(h, 0x85ebca77 | 0); h = h ^ (h >>> 13);
          o = ((h & 0xffff) / 65536 - 0.5) * p2;
        } break;
        case 10: o = x >= p0 ? p2 : 0; break;
        case 11: s0 = s0 + p1 * 0.1 + x * 0.01; if (s0 >= 1) { s0 = s0 - 1; o = p2; } break;
        case 12: if (x > p0) { if (s0 === 0) o = p2; s0 = 1; } else if (x < -p0) { if (s0 !== 0) o = -p2; s0 = 0; } break;
        case 13: o = Math.min(x, s0); s0 = x; if (!(o < -p0)) o = 0; break;
        case 14: o = Math.max(x, s0); s0 = x; if (!(o > p0)) o = 0; break;
        case 15: o = Math.abs(x) < p0 ? 0 : x; break;
        case 16: o = Math.abs(x) > p0 ? x / (1 + Math.abs(x)) * p2 : 0; break;
        case 17: o = x - s0; s0 = x; if (Math.abs(o) < p0) o = 0; break;
        case 18: { s0 = Math.min(s0 + x, p0 * 4); const ref = Math.floor(1 + p1 * 8); if (s0 >= p0 && ((t - lastFired[i]) >>> 0) > ref) { o = p2; s0 = 0; } break; }
        case 19: o = x > p0 ? -x * p2 : 0; break;
      }
      state[s] = s0; state[s + 1] = s1; out[i] = o;
      if (o !== 0) {
        fireCount[i]++; lastFired[i] = t; fired++;
        let e = rowPtr[i], eEnd = rowPtr[i + 1];
        if (k === K_ROUTER) { const mid = e + ((eEnd - e) >>> 1); if (o > 0) eEnd = mid; else e = mid; }
        for (; e < eEnd; e++) {
          const at = ((t + 1 + delay[e]) % R) * N + col[e];
          ring[at] += o * weight[e];
        }
      }
    }
    ring.fill(0, inp, inp + N);
    return fired;
  }

  // ------------------------------------------------------------ the wasm kernel
  _compileWasm(backend) {
    this.wasm = null; this.wasmReady = false; this.backend = 'js';
    if (backend === 'js' || !this.wasmMemory) { if (!this.wasmReason) this.wasmReason = 'backend js'; if (backend === 'wasm') throw new Error('Substrate: wasm requested but ' + this.wasmReason); return; }
    try {
      const bytes = assembleTick(this.layout);
      this.wasmBytes = bytes.length;
      const inst = new WebAssembly.Instance(new WebAssembly.Module(bytes), { env: { mem: this.wasmMemory } });
      this.wasm = inst.exports; this.wasmReady = true; this.backend = 'wasm';
    } catch (e) {
      this.wasmReason = 'compile: ' + String(e && e.message || e);
      if (backend === 'wasm') throw new Error('Substrate: ' + this.wasmReason);
    }
  }
  useBackend(name) {
    if (name === 'wasm' && !this.wasmReady) throw new Error('Substrate: wasm not available: ' + this.wasmReason);
    this.backend = name; return this;
  }

  // ------------------------------------------------------------ persistence of the dynamic arrays
  serializeDynamic() {
    const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
    return { t: this.t, lastTickFired: this.lastTickFired, totalFired: this.totalFired, ring: b64(this.ring), state: b64(this.state), lastFired: b64(this.lastFired), fireCount: b64(this.fireCount), out: b64(this.out) };
  }
  restoreDynamic(j) {
    const rd = (a, s) => { const b = Buffer.from(s, 'base64'); new Uint8Array(a.buffer, a.byteOffset, a.byteLength).set(b.subarray(0, a.byteLength)); };
    rd(this.ring, j.ring); rd(this.state, j.state); rd(this.lastFired, j.lastFired); rd(this.fireCount, j.fireCount); rd(this.out, j.out);
    this.t = j.t; this.lastTickFired = j.lastTickFired; this.totalFired = j.totalFired;
    return this;
  }
}

// ---------------------------------------------------------------- assembler
const I32 = 0x7f, F64 = 0x7c;
const uleb = (n) => { const o = []; do { let b = n & 0x7f; n = Math.floor(n / 128); if (n) b |= 0x80; o.push(b); } while (n); return o; };
const sleb = (n) => { const o = []; for (;;) { let b = n & 0x7f; n >>= 7; const done = (n === 0 && !(b & 0x40)) || (n === -1 && (b & 0x40)); if (!done) b |= 0x80; o.push(b); if (done) return o; } };
const str = (s) => { const b = [...Buffer.from(s, 'utf8')]; return [...uleb(b.length), ...b]; };
const section = (id, bytes) => [id, ...uleb(bytes.length), ...bytes];
const vec = (items) => [...uleb(items.length), ...items.flat()];
const L = (i) => [0x20, ...uleb(i)], S = (i) => [0x21, ...uleb(i)], T = (i) => [0x22, ...uleb(i)];
const I = (v) => [0x41, ...sleb(v | 0)];
const F = (v) => { const b = new Uint8Array(8); new DataView(b.buffer).setFloat64(0, v, true); return [0x44, ...b]; };
const BLOCK = [0x02, 0x40], LOOP = [0x03, 0x40], IF = [0x04, 0x40], ELSE = [0x05], END = [0x0b];
const br = (d) => [0x0c, ...uleb(d)], brIf = (d) => [0x0d, ...uleb(d)];
const SELECT = [0x1b];
const i32 = { eqz: [0x45], eq: [0x46], ne: [0x47], ltU: [0x49], gtU: [0x4b], geU: [0x4f], add: [0x6a], sub: [0x6b], mul: [0x6c], remU: [0x70], and: [0x71], or: [0x72], xor: [0x73], shl: [0x74], shrU: [0x76], popcnt: [0x69] };
const f64 = { eq: [0x61], ne: [0x62], lt: [0x63], gt: [0x64], le: [0x65], ge: [0x66], abs: [0x99], neg: [0x9a], floor: [0x9c], add: [0xa0], sub: [0xa1], mul: [0xa2], div: [0xa3], min: [0xa4], max: [0xa5] };
const TRUNC = [0xfc, 0x02], CVT_S = [0xb7], CVT_U = [0xb8], DEMOTE = [0xb6], PROMOTE = [0xbb];
const ldF32 = (off) => [0x2a, 0x02, ...uleb(off), ...PROMOTE];   // addr -> f64
const stF32 = (off) => [...DEMOTE, 0x38, 0x02, ...uleb(off)];    // addr f64 ->
const ldI32 = (off) => [0x28, 0x02, ...uleb(off)], stI32 = (off) => [0x36, 0x02, ...uleb(off)], ldU8 = (off) => [0x2d, 0x00, ...uleb(off)];
const FILL = [0xfc, 0x0b, 0x00];

// locals: 0 t (param); i32: 1 i, 2 e, 3 eEnd, 4 k, 5 h, 6 fired, 7 kind, 8 inp, 9 i4, 10 i8, 11 i16, 12 mid; f64: 13 x, 14 p0, 15 p1, 16 p2, 17 p3, 18 s0, 19 s1, 20 o, 21 tmp
const t_ = 0, i_ = 1, e_ = 2, eEnd = 3, k_ = 4, h_ = 5, fired = 6, kind = 7, inp = 8, i4 = 9, i8 = 10, i16 = 11, mid = 12;
const x = 13, p0 = 14, p1 = 15, p2 = 16, p3 = 17, s0 = 18, s1 = 19, o = 20, tmp = 21;
const ifThen = (cond, then, els = null) => [...cond, ...IF, ...then, ...(els ? [...ELSE, ...els] : []), ...END];
const sel = (a, b, cond) => [...a, ...b, ...cond, ...SELECT]; // cond ? a : b

// The twenty update functions, each the twin of one `case` in _tickJS.
function kindBodies(LAY) {
  const fireP2 = [...L(p2), ...S(o), ...F(0), ...S(s0)];
  return [
    /* 0 integrate.fire */ [...L(s0), ...L(x), ...f64.add, ...S(s0), ...ifThen([...L(s0), ...L(p0), ...f64.ge], fireP2)],
    /* 1 leaky */ [...L(s0), ...L(p1), ...f64.mul, ...L(x), ...f64.add, ...S(s0), ...ifThen([...L(s0), ...L(p0), ...f64.ge], fireP2)],
    /* 2 xor */ [...ifThen([...L(x), ...L(p0), ...f64.gt, ...L(s0), ...L(p0), ...f64.gt, ...i32.ne], [...L(p2), ...S(o)]), ...L(x), ...S(s0)],
    /* 3 majority */ [...L(s1), ...TRUNC, ...I(1), ...i32.shl, ...L(x), ...L(p0), ...f64.gt, ...i32.or, ...I(7), ...i32.and, ...T(h_),
      ...i32.popcnt, ...I(2), ...i32.geU, ...IF, ...L(p2), ...S(o), ...END, ...L(h_), ...CVT_S, ...S(s1)],
    /* 4 delay.line */ [...L(s1), ...S(o), ...L(s0), ...S(s1), ...L(x), ...S(s0)],
    /* 5 counter */ ifThen([...L(x), ...F(0), ...f64.ne], [...L(s0), ...F(1), ...f64.add, ...S(s0),
      ...ifThen([...L(s0), ...F(2), ...L(p0), ...F(8), ...f64.mul, ...f64.add, ...f64.floor, ...f64.ge], fireP2)]),
    /* 6 comparator */ [...sel(L(p2), sel([...L(p2), ...f64.neg], F(0), [...L(x), ...L(p0), ...f64.neg, ...f64.lt]), [...L(x), ...L(p0), ...f64.gt]), ...S(o)],
    /* 7 multiplier */ [...L(x), ...L(s0), ...f64.mul, ...S(o), ...L(x), ...S(s0), ...ifThen([...L(o), ...f64.abs, ...L(p0), ...f64.lt], [...F(0), ...S(o)])],
    /* 8 accumulator */ [...L(s0), ...L(p1), ...f64.mul, ...L(x), ...f64.add, ...F(-16), ...f64.max, ...F(16), ...f64.min, ...S(s0),
      ...sel([...L(s0), ...F(0.25), ...f64.mul], F(0), [...L(s0), ...f64.abs, ...L(p0), ...f64.gt]), ...S(o)],
    /* 9 hash.mix */ ifThen([...L(x), ...F(0), ...f64.ne], [
      ...L(x), ...F(-32767), ...f64.max, ...F(32767), ...f64.min, ...F(65536), ...f64.mul, ...TRUNC,
      ...L(p3), ...F(16777216), ...f64.mul, ...TRUNC, ...i32.xor, ...I(0x9e3779b1), ...i32.mul, ...T(h_),
      ...L(h_), ...I(15), ...i32.shrU, ...i32.xor, ...I(0x85ebca77), ...i32.mul, ...T(h_),
      ...L(h_), ...I(13), ...i32.shrU, ...i32.xor, ...I(0xffff), ...i32.and, ...CVT_U, ...F(65536), ...f64.div, ...F(0.5), ...f64.sub, ...L(p2), ...f64.mul, ...S(o)]),
    /* 10 threshold */ [...sel(L(p2), F(0), [...L(x), ...L(p0), ...f64.ge]), ...S(o)],
    /* 11 oscillator */ [...L(s0), ...L(p1), ...F(0.1), ...f64.mul, ...f64.add, ...L(x), ...F(0.01), ...f64.mul, ...f64.add, ...S(s0),
      ...ifThen([...L(s0), ...F(1), ...f64.ge], [...L(s0), ...F(1), ...f64.sub, ...S(s0), ...L(p2), ...S(o)])],
    /* 12 latch */ ifThen([...L(x), ...L(p0), ...f64.gt],
      [...ifThen([...L(s0), ...F(0), ...f64.eq], [...L(p2), ...S(o)]), ...F(1), ...S(s0)],
      ifThen([...L(x), ...L(p0), ...f64.neg, ...f64.lt], [...ifThen([...L(s0), ...F(0), ...f64.ne], [...L(p2), ...f64.neg, ...S(o)]), ...F(0), ...S(s0)])),
    /* 13 min */ [...L(x), ...L(s0), ...f64.min, ...S(o), ...L(x), ...S(s0), ...ifThen([...L(o), ...L(p0), ...f64.neg, ...f64.lt, ...i32.eqz], [...F(0), ...S(o)])],
    /* 14 max */ [...L(x), ...L(s0), ...f64.max, ...S(o), ...L(x), ...S(s0), ...ifThen([...L(o), ...L(p0), ...f64.gt, ...i32.eqz], [...F(0), ...S(o)])],
    /* 15 router */ [...sel(F(0), L(x), [...L(x), ...f64.abs, ...L(p0), ...f64.lt]), ...S(o)],
    /* 16 squash */ [...sel([...L(x), ...F(1), ...L(x), ...f64.abs, ...f64.add, ...f64.div, ...L(p2), ...f64.mul], F(0), [...L(x), ...f64.abs, ...L(p0), ...f64.gt]), ...S(o)],
    /* 17 differentiator */ [...L(x), ...L(s0), ...f64.sub, ...S(o), ...L(x), ...S(s0), ...ifThen([...L(o), ...f64.abs, ...L(p0), ...f64.lt], [...F(0), ...S(o)])],
    /* 18 refractory.fire */ [...L(s0), ...L(x), ...f64.add, ...L(p0), ...F(4), ...f64.mul, ...f64.min, ...S(s0),
      ...ifThen([...L(s0), ...L(p0), ...f64.ge, ...L(t_), ...L(i4), ...ldI32(LAY.lastFired), ...i32.sub, ...F(1), ...L(p1), ...F(8), ...f64.mul, ...f64.add, ...f64.floor, ...TRUNC, ...i32.gtU, ...i32.and], fireP2)],
    /* 19 inhibit */ [...sel([...L(x), ...f64.neg, ...L(p2), ...f64.mul], F(0), [...L(x), ...L(p0), ...f64.gt]), ...S(o)],
  ];
}
function dispatch(bodies) {
  const n = bodies.length, out = [...BLOCK];
  for (let k = 0; k < n; k++) out.push(...BLOCK);
  out.push(...L(kind), 0x0e, ...uleb(n), ...bodies.flatMap((_, k) => uleb(k)), ...uleb(n));
  for (let k = 0; k < n; k++) { out.push(...END, ...bodies[k]); if (k < n - 1) out.push(...br(n - 1 - k)); }
  out.push(...END);
  return out;
}
function tickBody(LAY) {
  const N = LAY.N, R = LAY.R, N4 = 4 * N;
  return [
    ...I(0), ...S(fired),
    ...L(t_), ...I(R), ...i32.remU, ...I(N4), ...i32.mul, ...I(LAY.ring), ...i32.add, ...S(inp),
    ...I(0), ...S(i_),
    ...BLOCK, ...LOOP,
      ...L(i_), ...I(2), ...i32.shl, ...S(i4), ...L(i_), ...I(3), ...i32.shl, ...S(i8), ...L(i_), ...I(4), ...i32.shl, ...S(i16),
      ...L(inp), ...L(i4), ...i32.add, ...ldF32(0), ...F(-64), ...f64.max, ...F(64), ...f64.min, ...S(x),
      ...L(i16), ...ldF32(LAY.params), ...S(p0), ...L(i16), ...ldF32(LAY.params + 4), ...S(p1), ...L(i16), ...ldF32(LAY.params + 8), ...S(p2), ...L(i16), ...ldF32(LAY.params + 12), ...S(p3),
      ...L(i8), ...ldF32(LAY.state), ...S(s0), ...L(i8), ...ldF32(LAY.state + 4), ...S(s1),
      ...L(i_), ...ldU8(LAY.kind), ...S(kind),
      ...F(0), ...S(o),
      ...dispatch(kindBodies(LAY)),
      ...L(i8), ...L(s0), ...stF32(LAY.state), ...L(i8), ...L(s1), ...stF32(LAY.state + 4),
      ...L(i4), ...L(o), ...stF32(LAY.out),
      ...ifThen([...L(o), ...F(0), ...f64.ne], [
        ...L(i4), ...L(i4), ...ldI32(LAY.fireCount), ...I(1), ...i32.add, ...stI32(LAY.fireCount),
        ...L(i4), ...L(t_), ...stI32(LAY.lastFired),
        ...L(fired), ...I(1), ...i32.add, ...S(fired),
        ...L(i4), ...ldI32(LAY.rowPtr), ...S(e_), ...L(i4), ...ldI32(LAY.rowPtr + 4), ...S(eEnd),
        ...ifThen([...L(kind), ...I(K_ROUTER), ...i32.eq], [
          ...L(e_), ...L(eEnd), ...L(e_), ...i32.sub, ...I(1), ...i32.shrU, ...i32.add, ...S(mid),
          ...ifThen([...L(o), ...F(0), ...f64.gt], [...L(mid), ...S(eEnd)], [...L(mid), ...S(e_)]),
        ]),
        ...BLOCK, ...LOOP,
          ...L(e_), ...L(eEnd), ...i32.geU, ...brIf(1),
          ...L(e_), ...I(2), ...i32.shl, ...S(k_),
          ...L(t_), ...I(1), ...i32.add, ...L(e_), ...ldU8(LAY.delay), ...i32.add, ...I(R), ...i32.remU, ...I(N4), ...i32.mul,
          ...L(k_), ...ldI32(LAY.col), ...I(2), ...i32.shl, ...i32.add, ...S(h_),
          ...L(h_), ...L(h_), ...ldF32(LAY.ring), ...L(o), ...L(k_), ...ldF32(LAY.weight), ...f64.mul, ...f64.add, ...stF32(LAY.ring),
          ...L(e_), ...I(1), ...i32.add, ...S(e_), ...br(0),
        ...END, ...END,
      ]),
      ...L(i_), ...I(1), ...i32.add, ...T(i_), ...I(N), ...i32.ltU, ...brIf(0),
    ...END, ...END,
    ...L(inp), ...I(0), ...I(N4), ...FILL,
    ...L(fired),
  ];
}
export function assembleTick(LAY) {
  const type = [0x60, ...vec([[I32]]), ...vec([[I32]])];
  const locals = vec([[...uleb(12), I32], [...uleb(9), F64]]);
  const code = [...locals, ...tickBody(LAY), ...END];
  return new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
    ...section(1, vec([type])),
    ...section(2, vec([[...str('env'), ...str('mem'), 0x02, 0x00, ...uleb(1)]])),
    ...section(3, vec([uleb(0)])),
    ...section(7, vec([[...str('tick'), 0x00, ...uleb(0)]])),
    ...section(10, vec([[...uleb(code.length), ...code]])),
  ]);
}

// ---------------------------------------------------------------- the Brain cell kind
// One major cell that owns one Substrate. Params: units, seed, edgesPerUnit, maxDelay,
// kinds, backend, inLo/inLen (the slice 'in' injects into), outLo/outLen (the slice 'out'
// reads, state s0), threshold (firing fraction whose upward crossing emits on 'event'),
// stepsPerRun (substrate ticks per brain run).
defineKind('substrate', {
  doc: 'A dense substrate of many micro units (typed arrays, twenty kinds, CSR edges with delay) driven as one cell: vec in, vec out, event on a firing burst.',
  ports: { in: [{ name: 'in', kinds: ['vec'] }], out: [{ name: 'out', kinds: ['vec'] }, { name: 'event', kinds: ['event'] }] },
  defaults: { units: 4096, seed: 'substrate', edgesPerUnit: 8, maxDelay: 7, kinds: null, backend: 'auto', inLo: 0, inLen: 64, outLo: 0, outLen: 64, threshold: 0.02, stepsPerRun: 1 },
  cost: 8,
  init: (p, cell) => ({ sub: new Substrate({ units: p.units, seed: p.seed + ':' + cell.id, edgesPerUnit: p.edgesPerUnit, maxDelay: p.maxDelay, kinds: p.kinds, backend: p.backend }), above: false, lastFired: 0, bursts: 0 }),
  compute: (ins, cell, ctx) => {
    const st = cell.state, sub = st.sub, p = cell.params;
    for (const it of ins[0]) sub.inject(p.inLo, it.sig.data, it.w, p.inLen);
    let fired = 0;
    for (let s = 0; s < p.stepsPerRun; s++) fired = sub.tick();
    const fraction = fired / sub.units, above = fraction >= p.threshold;
    let ev = null;
    if (above && !st.above) { st.bursts++; ev = { kind: 'event', data: { type: 'substrate.burst', t: ctx.t, subT: sub.t, fired, fraction, units: sub.units } }; }
    st.above = above; st.lastFired = fired;
    return [{ kind: 'vec', data: sub.readState(p.outLo, p.outLen) }, ev];
  },
  serialize: (s) => ({ above: s.above, lastFired: s.lastFired, bursts: s.bursts, dynamic: s.sub.serializeDynamic() }),
  deserialize: (j, cell) => { const s = cell.state; s.sub.restoreDynamic(j.dynamic); s.above = j.above; s.lastFired = j.lastFired; s.bursts = j.bursts; return s; },
});
