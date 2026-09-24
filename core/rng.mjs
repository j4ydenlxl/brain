// core/rng.mjs: deterministic randomness. Every brain, every generation, every
// hypervector is reproducible from a seed. xoshiro128** seeded by splitmix32.

export function hash32(str) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function hashBytes(bytes, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function splitmix32(a) {
  return function () {
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t ^ (t >>> 15)) >>> 0);
  };
}

export class RNG {
  constructor(seed = 'brain') {
    const s = typeof seed === 'number' ? seed >>> 0 : hash32(String(seed));
    const sm = splitmix32(s);
    this.s = new Uint32Array([sm(), sm(), sm(), sm()]);
    if ((this.s[0] | this.s[1] | this.s[2] | this.s[3]) === 0) this.s[0] = 1;
  }
  // uint32
  u32() {
    const s = this.s;
    const r = Math.imul(rotl(Math.imul(s[1], 5), 7), 9) >>> 0;
    const t = s[1] << 9;
    s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3];
    s[2] ^= t;
    s[3] = rotl(s[3], 11);
    return r;
  }
  // [0,1)
  next() { return this.u32() / 4294967296; }
  int(n) { return Math.floor(this.next() * n); }
  sign() { return (this.u32() & 1) ? 1 : -1; }
  gauss() {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  pick(arr) { return arr[this.int(arr.length)]; }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  fork(label) { return new RNG(hash32(label + ':' + this.u32())); }
  serialize() { return Array.from(this.s); }
  static from(arr) { const r = new RNG(0); r.s = new Uint32Array(arr); return r; }
}

function rotl(x, k) { return ((x << k) | (x >>> (32 - k))) >>> 0; }
