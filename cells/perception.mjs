// cells/perception.mjs: sensory encoders and a decoder. Numbers, time, vectors and
// images become hv or sdr signals; hv becomes a name again through a shared codebook.
// Importing this module registers the kinds.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';

const first = (m) => (m.length ? m[m.length - 1].sig : null);

// ---------------------------------------------------------------- encode.number
defineKind('encode.number', {
  doc: 'Num to hv by a thermometer/level code: level 0..L are bundled, so numbers with nearby levels share most terms and their hvs are similar. Also passes the exact num through unchanged.',
  ports: { in: [{ name: 'in', kinds: ['num'] }], out: [{ name: 'hv', kinds: ['hv'] }, { name: 'num', kinds: ['num'] }] },
  defaults: { min: 0, max: 100, levels: 64 },
  init: (p) => {
    const vs = [];
    for (let i = 0; i < p.levels; i++) vs.push(S.hvFromSeed('encode.number:level:' + i));
    return { levels: vs };
  },
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null, null];
    const x = S.ratToNumber(s.data);
    const { min, max } = cell.params, n = cell.state.levels.length;
    let L = Math.round((x - min) / (max - min) * (n - 1));
    L = Math.max(0, Math.min(n - 1, L));
    // own: the bundle is a fresh vector each run and this kind keeps no reference to it (the
    // level codebook in cell.state is what it reads, not what it emits), so the signal owns it
    const hv = S.bundle(cell.state.levels.slice(0, L + 1));
    return [{ kind: 'hv', data: hv, own: true }, { kind: 'num', data: s.data }];
  },
  serialize: (s) => ({ levels: s.levels.map(v => S.dataToJSON('hv', v)) }),
  deserialize: (j) => ({ levels: j.levels.map(v => S.dataFromJSON('hv', v)) }),
  // The level codebook is made fresh by this init() for every cell (hvFromSeed allocates, it
  // does not share a cache the way encode.time does), so nothing outside this state holds one
  // and a restore that replaces the state can return them. Measured before this existed: the
  // 48 level vectors of the cell a restore overwrote were 48 of the 51 garbage slots a 12
  // major bench row ended with, and the only garbage owner left above one slot.
  dispose: (s) => { for (const v of s.levels) S.release(v); },
});

// ---------------------------------------------------------------- encode.time
// The level and role hypervectors are a pure function of their seed, and bind/bundle both
// return fresh arrays, so nothing downstream can write to a cached one. Rebuilding them per
// run cost 3.07 ms (measured by tools/bench-encode-time.mjs), 24 hvFromSeed calls at D=8192
// each time, which made encode.time the most expensive kind in the whole brain
// (notes/whole.md request 7). Both caches are keyed by the exact seed, so two cells with
// different buckets or width share what they can and collide on nothing.
const TIME_HV = new Map();      // 'encode.time:<label>:<i>' and the four role vectors
const TIME_SCALE = new Map();   // '<label>:<buckets>:<width>:<center>' -> the bundled level code
const TIME_CACHE_MAX = 4096;    // params are fixed per cell, so this is a guard, not a policy
function timeHv(seed) {
  let v = TIME_HV.get(seed);
  if (v === undefined) { if (TIME_HV.size >= TIME_CACHE_MAX) TIME_HV.clear(); v = S.hvFromSeed(seed); TIME_HV.set(seed, v); }
  return v;
}
function phaseIdxs(phase01, buckets, width) {
  const center = ((Math.round(phase01 * buckets) % buckets) + buckets) % buckets;
  const out = [];
  for (let d = -width; d <= width; d++) out.push(((center + d) % buckets + buckets) % buckets);
  return out;
}
function scaleHv(label, phase01, buckets, width) {
  const center = ((Math.round(phase01 * buckets) % buckets) + buckets) % buckets;
  const key = label + ':' + buckets + ':' + width + ':' + center;
  let v = TIME_SCALE.get(key);
  if (v === undefined) {
    if (TIME_SCALE.size >= TIME_CACHE_MAX) TIME_SCALE.clear();
    v = S.bundle(phaseIdxs(phase01, buckets, width).map(i => timeHv('encode.time:' + label + ':' + i)));
    TIME_SCALE.set(key, v);
  }
  return v;
}
defineKind('encode.time', {
  doc: 'Num (ms since epoch or ticks) to hv: a circular thermometer code per periodic scale (ms-in-s, s-in-min, min-in-h, h-in-day), each bound to its own role vector and bundled together. Times that coincide on more scales are more similar; two times exactly 24h apart coincide on every scale.',
  ports: { in: [{ name: 'in', kinds: ['num'] }], out: [{ name: 'hv', kinds: ['hv'] }] },
  defaults: { buckets: 24, width: 2 },
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    const tms = Math.floor(S.ratToNumber(s.data));
    const { buckets, width } = cell.params;
    const mod = (a, m) => ((a % m) + m) % m;
    const ms = mod(tms, 1000), sec = Math.floor(mod(tms, 60000) / 1000), min = Math.floor(mod(tms, 3600000) / 60000), hr = Math.floor(mod(tms, 86400000) / 3600000);
    const parts = [
      S.bind(timeHv('encode.time:role:ms'), scaleHv('ms', ms / 1000, buckets, width)),
      S.bind(timeHv('encode.time:role:s'), scaleHv('s', sec / 60, buckets, width)),
      S.bind(timeHv('encode.time:role:min'), scaleHv('min', min / 60, buckets, width)),
      S.bind(timeHv('encode.time:role:h'), scaleHv('h', hr / 24, buckets, width)),
    ];
    return [{ kind: 'hv', data: S.bundle(parts) }];
  },
});

// ---------------------------------------------------------------- encode.vec
defineKind('encode.vec', {
  doc: 'Vec to hv by random projection through a seeded D x nin matrix (sign of the projection, an LSH-style hyperplane code). Deterministic in params.seed alone, so the same seed always gives the same projection regardless of cell id.',
  ports: { in: [{ name: 'in', kinds: ['vec'] }], out: [{ name: 'out', kinds: ['hv'] }] },
  defaults: { nin: 8, seed: 'encode.vec' },
  init: (p) => {
    const rng = new RNG('encode.vec:' + p.seed);
    const M = new Float32Array(S.D * p.nin), scale = 1 / Math.sqrt(p.nin);
    for (let i = 0; i < M.length; i++) M[i] = rng.gauss() * scale;
    return { M };
  },
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    const x = s.data, p = cell.params, M = cell.state.M, out = new Int8Array(S.D);
    for (let i = 0; i < S.D; i++) {
      let a = 0; const row = i * p.nin;
      for (let j = 0; j < p.nin; j++) a += M[row + j] * (x[j] || 0);
      out[i] = a >= 0 ? 1 : -1;
    }
    return [{ kind: 'hv', data: out }];
  },
  serialize: (s) => ({ M: S.dataToJSON('vec', s.M) }),
  deserialize: (j) => ({ M: S.dataFromJSON('vec', j.M) }),
});

// ---------------------------------------------------------------- encode.image
defineKind('encode.image', {
  doc: 'Vec of pixels (row-major, params.width x params.height) to sdr by local contrast: each pixel minus the mean of its up-to-4 orthogonal neighbours. The params.k most contrastive pixels become the active set.',
  ports: { in: [{ name: 'in', kinds: ['vec'] }], out: [{ name: 'out', kinds: ['sdr'] }] },
  defaults: { width: 8, height: 8, k: 8 },
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    const { width: w, height: h, k } = cell.params, x = s.data, n = w * h, c = new Float32Array(n);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const i = y * w + xx; let sum = 0, cnt = 0;
      if (xx > 0) { sum += x[i - 1]; cnt++; }
      if (xx < w - 1) { sum += x[i + 1]; cnt++; }
      if (y > 0) { sum += x[i - w]; cnt++; }
      if (y < h - 1) { sum += x[i + w]; cnt++; }
      c[i] = Math.abs(x[i] - (cnt ? sum / cnt : 0));
    }
    return [{ kind: 'sdr', data: S.sdrFromVec(c, k) }];
  },
});

// ---------------------------------------------------------------- decode.hv
defineKind('decode.hv', {
  doc: 'Hv to the nearest named item in a codebook given by params.items: each name deterministically maps to hvFromSeed(name), so the codebook needs no storage and is shared with any other cell naming the same items. Emits { name, sim }; name is null below params.threshold.',
  ports: { in: [{ name: 'in', kinds: ['hv'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { items: [], threshold: 0.05 },
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    let best = null, bs = -Infinity;
    for (const name of cell.params.items) { const sc = S.sim(S.hvFromSeed(name), s.data); if (sc > bs) { bs = sc; best = name; } }
    return [{ kind: 'event', data: { name: bs >= cell.params.threshold ? best : null, sim: bs === -Infinity ? 0 : bs } }];
  },
});

// ---------------------------------------------------------------- tokenize.text
defineKind('tokenize.text', {
  doc: 'Event { text } to event { tokens: [...] }: lowercase, then split into runs of letters or of digits (a number, including a decimal, stays one token). Punctuation and whitespace are separators, never tokens.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  compute: (ins) => {
    const s = first(ins[0]); if (!s) return [null];
    const text = String(s.data.text ?? '').toLowerCase();
    const tokens = text.match(/\d+\.\d+|\d+|[a-z]+/g) || [];
    return [{ kind: 'event', data: { tokens } }];
  },
});
