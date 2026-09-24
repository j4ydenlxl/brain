// generations/palette.mjs: the gene pool of cell kinds the generations engine is
// allowed to put into a genome, plus two evolvable cell kinds it owns.
//
// Why two new kinds: the cells in cells/basic.mjs that carry vec ignore the edge weight
// that delivered a signal (only hv.bundle consults it), so a NEAT style weight gene would
// have had no effect on them. gen.node and gen.ema are the classic weighted summing nodes:
// they read it.w on every incoming signal, which is what makes an edge weight a gene.
// vec.mlp from cells/basic.mjs stays in the pool because it carries a local delta rule,
// which is what the xor task learns with.
//
// Everything in the pool is dimension safe: an incoming vec that is shorter or longer than
// the cell width is zero padded or truncated, so any add-edge mutation between two vec
// ports produces a circuit that runs.
import { defineKind, getKind, hasKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';

export const ACT = Object.freeze({
  tanh: (x) => Math.tanh(x),
  relu: (x) => (x > 0 ? x : 0),
  lin: (x) => x,
  sin: (x) => Math.sin(x),
});
export const ACT_NAMES = Object.freeze(['tanh', 'relu', 'lin', 'sin']);

// Weighted sum of every vec delivered this run, into a fixed width. The sum is elementwise,
// so channel mixing comes from `roll`, which rotates a cell's OUTPUT channels before it is
// emitted. Two cells with different rolls feeding the same node land on different channels,
// and that is what lets a network of elementwise nodes express a general linear map.
function accumulate(mail, width, out) {
  let got = false;
  out.fill(0);
  for (const it of mail) {
    const v = it.sig.data, w = it.w;
    const n = Math.min(width, v.length);
    for (let i = 0; i < n; i++) out[i] += w * v[i];
    got = true;
  }
  return got;
}
// Place the activated channels into a FRESH array, rotated by roll. Fresh because the array
// leaves the cell as signal data and a downstream cell may still be holding last run's.
function rolled(z, roll, width) {
  const r = ((roll % width) + width) % width, y = new Float32Array(width);
  if (r === 0) { y.set(z.subarray(0, width)); return y; }
  for (let i = 0; i < width; i++) y[(i + r) % width] = z[i];
  return y;
}

if (!hasKind('gen.node')) {
  defineKind('gen.node', {
    doc: 'Evolvable node: weighted sum of incoming vecs (edge weight is the gene), gain, bias, activation.',
    ports: { in: [{ name: 'x', kinds: ['vec'] }], out: [{ name: 'y', kinds: ['vec'] }] },
    defaults: { width: 4, gain: 1, bias: 0, act: 'tanh', roll: 0 },
    init: (p) => ({ last: null, acc: new Float32Array(p.width), z: new Float32Array(p.width) }),
    compute: (ins, cell) => {
      const p = cell.params, s = cell.state;
      if (!accumulate(ins[0], p.width, s.acc)) return [null];
      const f = ACT[p.act] || ACT.tanh, z = s.z;
      for (let i = 0; i < p.width; i++) z[i] = f(p.gain * s.acc[i] + p.bias);
      const y = rolled(z, p.roll | 0, p.width);
      s.last = y;
      return [{ kind: 'vec', data: y }];
    },
    serialize: (s) => ({ last: s.last && S.dataToJSON('vec', s.last) }),
    deserialize: (j, cell) => ({ last: j.last && S.dataFromJSON('vec', j.last), acc: new Float32Array(cell.params.width), z: new Float32Array(cell.params.width) }),
  });
}

if (!hasKind('gen.ema')) {
  defineKind('gen.ema', {
    doc: 'Evolvable node with its own time constant: weighted sum, then an exponential moving average over tau runs.',
    ports: { in: [{ name: 'x', kinds: ['vec'] }], out: [{ name: 'y', kinds: ['vec'] }] },
    defaults: { width: 4, gain: 1, bias: 0, act: 'tanh', tau: 4, roll: 0 },
    init: (p) => ({ last: null, mem: new Float32Array(p.width), acc: new Float32Array(p.width), z: new Float32Array(p.width) }),
    compute: (ins, cell) => {
      const p = cell.params, s = cell.state;
      if (!accumulate(ins[0], p.width, s.acc)) return [null];
      const a = 1 / Math.max(1, p.tau), f = ACT[p.act] || ACT.tanh, z = s.z;
      for (let i = 0; i < p.width; i++) {
        s.mem[i] += a * (s.acc[i] - s.mem[i]);
        z[i] = f(p.gain * s.mem[i] + p.bias);
      }
      const y = rolled(z, p.roll | 0, p.width);
      s.last = y;
      return [{ kind: 'vec', data: y }];
    },
    serialize: (s) => ({ last: s.last && S.dataToJSON('vec', s.last), mem: S.dataToJSON('vec', s.mem) }),
    deserialize: (j, cell) => ({ last: j.last && S.dataFromJSON('vec', j.last), mem: S.dataFromJSON('vec', j.mem), acc: new Float32Array(cell.params.width), z: new Float32Array(cell.params.width) }),
  });
}

// The last vec a cell produced, whatever kind it is. Used to read a circuit's output
// without depending on the outbox (an added out-edge would silently swallow it).
export function readVec(cell) {
  const s = cell.state;
  if (!s) return null;
  if (s.last instanceof Float32Array) return s.last;
  if (s.lastY instanceof Float32Array) return s.lastY;
  return null;
}

// A gene spec says how to build a cell gene of one kind: the params it carries, which of
// them are numeric and mutable, and their bounds.
export const GENE_SPECS = Object.freeze({
  'gen.node': {
    kind: 'gen.node',
    params: (rng, width) => ({ width, gain: 1 + rng.gauss() * 0.2, bias: rng.gauss() * 0.2, act: rng.pick(ACT_NAMES), roll: rng.int(width) }),
    numeric: { gain: [-4, 4], bias: [-2, 2], roll: [0, 15] },
    integer: { roll: true },
    choice: { act: ACT_NAMES },
  },
  'gen.ema': {
    kind: 'gen.ema',
    params: (rng, width) => ({ width, gain: 1 + rng.gauss() * 0.2, bias: rng.gauss() * 0.2, act: rng.pick(ACT_NAMES), tau: 1 + rng.int(16), roll: rng.int(width) }),
    numeric: { gain: [-4, 4], bias: [-2, 2], tau: [1, 64], roll: [0, 15] },
    integer: { tau: true, roll: true },
    choice: { act: ACT_NAMES },
  },
  'vec.mlp': {
    kind: 'vec.mlp',
    params: (rng, width) => ({ nin: width, nhid: 4 + rng.int(13), nout: width, lr: 0.02 + rng.next() * 0.18, seed: 'm' + rng.u32() }),
    numeric: { nhid: [2, 32], lr: [0.001, 0.5] },
    integer: { nhid: true },
    choice: {},
  },
  'predict.next': {
    kind: 'predict.next',
    params: (rng) => ({ history: 2 + rng.int(6) }),
    numeric: { history: [2, 16] },
    integer: { history: true },
    choice: {},
  },
});

export function geneSpec(kind) {
  const s = GENE_SPECS[kind];
  if (!s) throw new Error('palette: no gene spec for kind ' + kind);
  return s;
}

// Port kind compatibility, the same rule core/brain.mjs connect() enforces: every signal
// kind the out port can emit must be accepted by the in port, or the wire is refused.
export function portsCompatible(srcKind, srcPort, dstKind, dstPort) {
  const a = getKind(srcKind).ports.out[srcPort];
  const b = getKind(dstKind).ports.in[dstPort];
  if (!a || !b) return false;
  return a.kinds.every((k) => b.kinds.includes(k));
}

// Every (out port, in port) pair between two kinds that could legally be wired.
export function compatiblePairs(srcKind, dstKind) {
  const a = getKind(srcKind).ports.out, b = getKind(dstKind).ports.in, out = [];
  for (let sp = 0; sp < a.length; sp++) for (let dp = 0; dp < b.length; dp++) {
    if (a[sp].kinds.every((k) => b[dp].kinds.includes(k))) out.push([sp, dp]);
  }
  return out;
}

// The period ladder: multi-timescale is a gene, so a mutation may move a cell onto a
// slower clock. 'event' means the cell runs whenever it has mail.
export const PERIODS = Object.freeze([1, 1, 1, 2, 3, 4, 6, 8, 12, 16, 'event']);
export function periodValue(p) { return p === 'event' ? 1 : p; }
