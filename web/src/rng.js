// web/src/rng.js: the same deterministic stream as core/rng.mjs, with no node: imports.
// xoshiro128** seeded by splitmix32 over an FNV-1a hash of the seed string. Byte for byte
// the same draws in the same order, which is the only reason a brain built in a browser
// tab can be the same organism as the one seeds/organism.mjs builds under node.

export function hash32(str) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
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

function rotl(x, k) { return ((x << k) | (x >>> (32 - k))) >>> 0; }

export class RNG {
  constructor(seed) {
    const s = typeof seed === 'number' ? seed >>> 0 : hash32(String(seed === undefined ? 'brain' : seed));
    const sm = splitmix32(s);
    this.s = new Uint32Array([sm(), sm(), sm(), sm()]);
    if ((this.s[0] | this.s[1] | this.s[2] | this.s[3]) === 0) this.s[0] = 1;
  }
  u32() {
    const s = this.s;
    const r = Math.imul(rotl(Math.imul(s[1], 5), 7), 9) >>> 0;
    const t = s[1] << 9;
    s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3];
    s[2] ^= t;
    s[3] = rotl(s[3], 11);
    return r;
  }
  next() { return this.u32() / 4294967296; }
  int(n) { return Math.floor(this.next() * n); }
  pick(arr) { return arr[this.int(arr.length)]; }
}
