// web/src/organism.js: THE ORGANISM, GROWN IN THE TAB.
//
// This is a port of seeds/organism.mjs. It is not a snapshot and it is not an
// approximation of one: it draws from the same seeded stream, in the same order, through
// the same acceptor index, and so it produces THE SAME ORGANISM. test/web.test.mjs builds
// both sides at the same parameters and compares the cell count, the edge count and a
// content hash over every (src, dst, delay) triple in edge order.
//
// Why this exists: the site is published by handing a deploy tool the files as text, so
// the whole site has to stay small. A 20 MB snapshot of a built brain cannot be handed
// over as text. The builder can: it is a few tens of kilobytes and it rebuilds the
// organism in the viewer's own machine in well under two seconds.
//
//   primitive -> cell -> circuit -> region -> network
//
import { RNG } from './rng.js';
import { getKind, initState } from './kinds.js';

export const SEC = 1000, MIN = 60000, HOUR = 3600000;

// share: fraction of the major nodes. flow: where this region's long range axons go.
// roster: the kinds a major of this region is built from, cycled in order.
export const REGIONS = [
  {
    name: 'perception', prefix: 'pe', share: 0.18,
    doc: 'sensory input and encoding: events, numbers, time and vectors become hypervectors and sparse codes',
    flow: [['association', 6], ['memory', 2], ['cognitive', 1]],
    // The six grid kinds at the end are the ones tasks/grid.mjs searches over. They joined
    // the node roster in seeds/organism.mjs today so that the grid suite is reachable from
    // a region roster at all, and the port follows: a roster that differs by one entry is a
    // different organism and the parity test says so.
    roster: ['encode.hv', 'tokenize.text', 'encode.number', 'hv.permute', 'encode.time', 'hv.bundle', 'encode.vec', 'sdr.encode', 'encode.image', 'decode.hv',
      'grid.rotate', 'grid.flip', 'grid.transpose', 'grid.crop', 'grid.translate', 'grid.tile'],
  },
  {
    name: 'association', prefix: 'as', share: 0.22,
    doc: 'pattern integration: bundling, binding, cleanup, and the prediction that turns observation into surprise',
    flow: [['cognitive', 5], ['memory', 3], ['perception', 1], ['motor', 1]],
    roster: ['hv.bundle', 'predict.next', 'hv.bind', 'hv.compare', 'hv.cleanup', 'hv.permute', 'integrate.ema', 'memory.assoc', 'aggregate.mean', 'liquid.cfc', 'knn.retrieve', 'reservoir.echo'],
  },
  {
    name: 'cognitive', prefix: 'co', share: 0.20,
    doc: 'abstract reasoning: exact arithmetic, symbolic algebra, logic, routing and evaluation',
    flow: [['motor', 4], ['memory', 3], ['association', 2], ['homeostasis', 1]],
    roster: ['num.arith', 'route.key', 'num.compare', 'logic.gate', 'sym.simplify', 'evaluate.threshold', 'sym.diff', 'num.count', 'sym.solve', 'vec.mlp', 'sym.verify', 'verify.numeric', 'predict.next', 'sym.eval', 'seq.fit'],
  },
  {
    name: 'memory', prefix: 'me', share: 0.15,
    doc: 'distributed memory: associative stores, attractor cleanup, nearest neighbour recall and consolidation statistics',
    flow: [['association', 5], ['cognitive', 3], ['perception', 1]],
    roster: ['memory.assoc', 'hopfield.assoc', 'hv.bundle', 'knn.retrieve', 'hv.permute', 'stat.histogram', 'integrate.ema', 'decode.hv'],
  },
  {
    name: 'motor', prefix: 'mo', share: 0.10,
    doc: 'action and interaction: state machines, gating, timers and the action log',
    flow: [['homeostasis', 4], ['perception', 3], ['cognitive', 2]],
    roster: ['state.machine', 'event.filter', 'route.key', 'timer', 'num.register', 'logic.gate', 'sink.log', 'rate.meter'],
  },
  {
    name: 'homeostasis', prefix: 'ho', share: 0.08,
    doc: 'the clock and the internal weather: periodic drivers across the timescale spectrum, rate meters, running statistics and anomaly detection',
    flow: [['perception', 2], ['association', 2], ['cognitive', 2], ['memory', 2], ['motor', 2], ['generations', 1]],
    roster: ['source.counter', 'stat.running', 'rate.meter', 'anomaly.zscore', 'integrate.leaky', 'oscillator', 'evaluate.threshold', 'stat.correlate'],
  },
  {
    name: 'generations', prefix: 'ge', share: 0.07,
    doc: 'the service region that scores the organism: counters, running statistics, correlations and thresholds that a generations engine reads',
    flow: [['cognitive', 3], ['homeostasis', 3], ['association', 1]],
    roster: ['source.counter', 'stat.running', 'num.compare', 'stat.correlate', 'evaluate.threshold', 'anomaly.zscore', 'event.filter', 'num.register'],
  },
];

// The homeostasis clock: the first major of the homeostasis region is a fixed ladder
// across the timescale spectrum, one driver per scale, plus the meters that watch them.
const CLOCK_ROSTER = [
  { kind: 'source.counter', period: 1 },
  { kind: 'source.counter', period: SEC },
  { kind: 'source.counter', period: MIN },
  { kind: 'source.counter', period: HOUR },
  { kind: 'oscillator', period: 1, params: { periods: [4, 16, 64, 256] } },
  { kind: 'stat.running', period: 'event', params: { every: 8 } },
  { kind: 'rate.meter', period: 'event', params: { windowMs: SEC } },
  { kind: 'anomaly.zscore', period: 'event', params: { threshold: 3, warmup: 5 } },
];

const PERIODS = [['event', 0.68], [1, 0.12], [SEC, 0.10], [MIN, 0.06], [HOUR, 0.04]];
const DRIVER_PERIODS = [[1, 0.45], [SEC, 0.35], [MIN, 0.15], [HOUR, 0.05]];

// ---------------------------------------------------------------- the connectome
// Edges in typed arrays. A hundred thousand of them are a couple of megabytes and
// propagation is a tight loop over indices, which is what lets a tab tick at speed.
export class Connectome {
  constructor(capacity) {
    this.n = 0;
    this._alloc(capacity || 1024);
    this._bySrc = null;
  }
  _alloc(cap) {
    const grow = (Ctor, old) => { const a = new Ctor(cap); if (old) a.set(old.subarray(0, this.n)); return a; };
    this.src = grow(Uint32Array, this.src); this.dst = grow(Uint32Array, this.dst);
    this.srcPort = grow(Uint8Array, this.srcPort); this.dstPort = grow(Uint8Array, this.dstPort);
    this.w = grow(Float32Array, this.w); this.delay = grow(Uint16Array, this.delay);
    this.conf = grow(Float32Array, this.conf); this.usage = grow(Uint32Array, this.usage);
    this.cap = cap;
  }
  add(src, dst, srcPort, dstPort, w, delay, conf) {
    if (this.n === this.cap) this._alloc(this.cap * 2);
    const e = this.n++;
    this.src[e] = src; this.dst[e] = dst; this.srcPort[e] = srcPort; this.dstPort[e] = dstPort;
    this.w[e] = w; this.delay[e] = delay; this.conf[e] = conf; this.usage[e] = 0;
    this._bySrc = null;
    return e;
  }
  // The tick a signal emitted at t over edge e arrives: one tick of travel plus the delay.
  arrival(e, t) { return t + 1 + this.delay[e]; }
  index(nodes) {
    if (this._bySrc) return this._bySrc;
    const n = this.n, ptr = new Uint32Array(nodes + 1);
    for (let e = 0; e < n; e++) ptr[this.src[e] + 1]++;
    for (let i = 0; i < nodes; i++) ptr[i + 1] += ptr[i];
    const list = new Uint32Array(n), fill = ptr.slice();
    for (let e = 0; e < n; e++) list[fill[this.src[e]]++] = e;
    this._bySrc = { ptr, list };
    return this._bySrc;
  }
}

// ---------------------------------------------------------------- port legality
export function portKey(port) { return [...port.kinds].sort().join('|'); }
export function accepts(outPort, inPort) { return outPort.kinds.every(k => inPort.kinds.includes(k)); }

/** First position in a sorted Uint32Array whose value is >= v. */
export function lowerBound(a, v) {
  let lo = 0, hi = a.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; }
  return lo;
}

/**
 * For every distinct out-port kind set present, the cells with an in port that accepts all
 * of it, in ascending cell index, with the in port to use. Picking a legal destination is
 * then a binary search into a slice, not a scan over every cell.
 */
export function acceptorIndex(cells) {
  const keys = new Map();
  for (const c of cells) for (const p of c.ports.out) if (!keys.has(portKey(p))) keys.set(portKey(p), p);
  const out = new Map();
  for (const [key, outPort] of keys) {
    const idx = [], port = [];
    for (let i = 0; i < cells.length; i++) {
      const ins = cells[i].ports.in;
      for (let dp = 0; dp < ins.length; dp++) if (accepts(outPort, ins[dp])) { idx.push(i); port.push(dp); break; }
    }
    out.set(key, { idx: Uint32Array.from(idx), port: Uint8Array.from(port) });
  }
  return out;
}

// ---------------------------------------------------------------- growing it
/**
 * Grow the organism. Same seed and same parameters give the same organism as
 * seeds/organism.mjs does under node.
 * @param {object} [opts] majors, subcellsPerMajor, edgesPerCell, seed, localWindow
 * @returns {{cells: Array, connectome: Connectome, genome: object, buildMs: number}}
 */
export function buildOrganism(opts) {
  const o = opts || {};
  const majors = o.majors === undefined ? 1200 : o.majors;
  const subcellsPerMajor = o.subcellsPerMajor === undefined ? 8 : o.subcellsPerMajor;
  const edgesPerCell = o.edgesPerCell === undefined ? 12 : o.edgesPerCell;
  const seed = o.seed === undefined ? 'organism' : o.seed;
  const localWindow = o.localWindow === undefined ? 8 : o.localWindow;
  if (!(Number.isInteger(majors) && majors > 0)) throw new Error('buildOrganism: majors must be a positive integer');
  if (!(Number.isInteger(subcellsPerMajor) && subcellsPerMajor > 0)) throw new Error('buildOrganism: subcellsPerMajor must be a positive integer');
  if (!(Number.isInteger(edgesPerCell) && edgesPerCell >= 0)) throw new Error('buildOrganism: edgesPerCell must be a non negative integer');

  const t0 = perfNow();
  const rng = new RNG(seed + ':wiring');
  const cells = [];
  const circuits = new Map();

  const quota = shareOut(majors, REGIONS.map(r => r.share));
  const plan = REGIONS.map((r, i) => ({ ...r, majors: quota[i] }));

  const regionRange = new Map();
  const majorRange = [];
  const majorRegion = [];
  const regionMajors = new Map();
  let major = 0;

  for (const r of plan) {
    const cellLo = cells.length, majorLo = major;
    for (let m = 0; m < r.majors; m++, major++) {
      const isClock = r.name === 'homeostasis' && m === 0;
      const circuit = r.prefix + '.' + pad(major);
      const circuitPeriod = isClock ? 1 : pickWeighted(rng, PERIODS);
      circuits.set(circuit, { name: circuit, region: r.name, period: circuitPeriod, major });
      const lo = cells.length;
      for (let s = 0; s < subcellsPerMajor; s++) {
        const slot = isClock ? CLOCK_ROSTER[s % CLOCK_ROSTER.length] : { kind: r.roster[(m * subcellsPerMajor + s) % r.roster.length] };
        const kindName = slot.kind;
        const id = circuit + '.' + s;
        const params = { ...(slot.params || paramsFor(kindName, rng, major, s)) };
        const period = slot.period !== undefined ? slot.period : periodFor(kindName, rng);
        const policy = {
          period,
          priority: 1 + rng.int(3),
          budget: 1,
          backend: 'cpu',
          learn: rng.next() < 0.25 ? 'hebbian' : null,
        };
        const kind = getKind(kindName);
        cells.push({
          id, idx: cells.length, kind: kindName, region: r.name, circuit, major,
          ports: kind.ports, params, policy, cap: kind.cap, depth: kind.depth,
          update: kind.update, doc: kind.doc,
          state: initState(kindName, params),
          runs: 0, lastT: -1, out: 0, fired: 0, quiet: 0,
        });
      }
      majorRange.push([lo, cells.length]);
      majorRegion.push(r.name);
    }
    regionRange.set(r.name, [cellLo, cells.length]);
    regionMajors.set(r.name, [majorLo, major]);
  }

  // ---------------------------------------------------------- wiring
  const acceptors = acceptorIndex(cells);
  const k = new Connectome(nextPow2(Math.max(1024, cells.length * edgesPerCell)));
  const seen = new Set();
  const claims = new Map();
  const W = { k, cells, seen, added: 0, duplicates: 0, illegal: 0 };

  const local = Math.max(1, Math.round(edgesPerCell * 0.34));
  const regional = Math.max(1, Math.round(edgesPerCell * 0.42));
  const long = Math.max(0, edgesPerCell - local - regional);

  for (let m = 0; m < majorRange.length; m++) {
    const lo = majorRange[m][0], hi = majorRange[m][1];
    const region = majorRegion[m];
    const rplan = plan.find(p => p.name === region);
    const rr = regionRange.get(region), rLo = rr[0], rHi = rr[1];
    const rm = regionMajors.get(region), mLo = rm[0], mHi = rm[1];
    const isClock = region === 'homeostasis' && m === mLo;

    for (let i = lo; i < hi; i++) {
      const cell = cells[i];
      const ports = [];
      for (let p = 0; p < cell.ports.out.length; p++) ports.push(p);
      const nOut = ports.length;
      if (nOut === 0) continue;
      const keys = cell.ports.out.map(p => portKey(p));

      // 1. inside the major: dense, immediate, no delay.
      const wLo = Math.max(mLo, m - localWindow), wHi = Math.min(mHi, m + localWindow + 1);
      const nbLo = majorRange[wLo][0], nbHi = majorRange[wHi - 1][1];
      for (let c = 0; c < local; c++) {
        const sp = ports[c % nOut];
        const ok = wire(W, acceptors, claims, rng, i, sp, keys[sp], lo, hi, 0.35, 1.4, 0);
        if (!ok) wire(W, acceptors, claims, rng, i, sp, keys[sp], nbLo, nbHi, 0.35, 1.4, 1);
      }
      // 2. inside the region, neighbouring majors: a sliding window, one or two ticks.
      for (let c = 0; c < regional; c++) {
        const sp = ports[(c + 1) % nOut];
        const d1 = 1 + rng.int(3);
        const ok = wire(W, acceptors, claims, rng, i, sp, keys[sp], nbLo, nbHi, 0.2, 1.1, d1);
        if (!ok) wire(W, acceptors, claims, rng, i, sp, keys[sp], rLo, rHi, 0.2, 1.1, 1 + rng.int(3));
      }
      // 3. across regions: thin, slow, along the flow. The clock major broadcasts instead.
      const longCount = isClock ? Math.max(long, plan.length) : long;
      for (let c = 0; c < longCount; c++) {
        const sp = ports[(c + 2) % nOut];
        const target = isClock ? plan[c % plan.length].name : pickWeighted(rng, rplan.flow);
        const tr = regionRange.get(target);
        wire(W, acceptors, claims, rng, i, sp, keys[sp], tr[0], tr[1], 0.1, 0.9, 2 + rng.int(30));
      }
    }
  }
  k.index(cells.length);
  const buildMs = perfNow() - t0;
  return {
    cells, connectome: k, circuits, buildMs,
    genome: {
      seed, majors, subcellsPerMajor, edgesPerCell, localWindow,
      added: W.added, duplicates: W.duplicates, illegal: W.illegal, claimedPorts: claims.size,
      regions: plan.map(p => ({ name: p.name, majors: p.majors, doc: p.doc, flow: p.flow })),
    },
  };
}

// Draw one legal destination out of [lo, hi) and add the edge. Returns whether it landed.
function wire(W, acceptors, claims, rng, srcIdx, sp, key, lo, hi, wMin, wSpan, delay) {
  const acc = acceptors.get(key);
  if (!acc) return false;
  const a = lowerBound(acc.idx, lo), z = lowerBound(acc.idx, hi);
  if (z <= a) return false;
  for (let attempt = 0; attempt < 8; attempt++) {
    const j = a + rng.int(z - a);
    const dst = acc.idx[j], dp = acc.port[j];
    if (dst === srcIdx) continue;
    const claim = dst * 16 + dp;
    // A port that declares one kind is claimed by that kind. A port that declares several
    // is claimed by the SOURCE CELL as well, because two such sources agree on paper and
    // still deliver two different kinds at run time.
    const mine = key.includes('|') ? key + '#' + srcIdx : key;
    const owner = claims.get(claim);
    if (owner !== undefined && owner !== mine) continue;
    const dedupe = ((srcIdx * 2097152 + dst) * 16 + sp) * 16 + dp;
    const w = Math.fround(wMin + rng.next() * wSpan);
    if (W.seen.has(dedupe)) { W.duplicates++; continue; }
    W.seen.add(dedupe);
    W.k.add(srcIdx, dst, sp, dp, w, delay, 0.5);
    W.added++;
    claims.set(claim, mine);
    return true;
  }
  return false;
}

// Largest remainder: the shares sum to the total exactly, deterministically.
export function shareOut(total, shares) {
  const sum = shares.reduce((a, s) => a + s, 0);
  const raw = shares.map(s => (s / sum) * total);
  const floor = raw.map(Math.floor);
  let left = total - floor.reduce((a, v) => a + v, 0);
  const order = raw.map((v, i) => [v - floor[i], i]).sort((x, y) => y[0] - x[0] || x[1] - y[1]);
  for (let c = 0; left > 0; c++, left--) floor[order[c % order.length][1]]++;
  return floor;
}

function pickWeighted(rng, pairs) {
  let total = 0;
  for (const p of pairs) total += p[1];
  let r = rng.next() * total;
  for (const p of pairs) { r -= p[1]; if (r <= 0) return p[0]; }
  return pairs[pairs.length - 1][0];
}

// A cell with no in ports can never be woken by mail, so a driver carries a numeric period.
function periodFor(kindName, rng) {
  const driver = getKind(kindName).ports.in.length === 0;
  return pickWeighted(rng, driver ? DRIVER_PERIODS : PERIODS);
}

const pad = (n) => String(n).padStart(4, '0');
function nextPow2(n) { let c = 1024; while (c < n) c *= 2; return c; }
function perfNow() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }

// Parameters per kind. Every value is drawn from the seeded RNG or fixed, never from the
// clock or the environment, so the organism is a pure function of its seed.
function paramsFor(kind, rng, major, sub) {
  switch (kind) {
    case 'encode.hv': return { sequence: sub % 2 === 0 };
    case 'encode.number': return { min: 0, max: [10, 100, 1000][major % 3], levels: [16, 32, 48][sub % 3] };
    case 'encode.time': return { buckets: [12, 24, 60][major % 3], width: 2 };
    case 'encode.vec': return { nin: 8, seed: 'ev.' + major + '.' + sub };
    case 'encode.image': return { width: 8, height: 8, k: 8 };
    case 'sdr.encode': return { k: [8, 16, 32][sub % 3] };
    case 'decode.hv': return { items: [], threshold: 0.05 };
    case 'hv.permute': return { k: 1 + (major + sub) % 7 };
    case 'hv.cleanup': return { threshold: 0.1 };
    case 'predict.next': return { history: 2 + (sub % 6) };
    case 'integrate.ema': return { tau: [4, 8, 16, 64][sub % 4] };
    case 'liquid.cfc': return { nin: 4, nhid: 8, dt: 1, tauMin: 2, tauMax: 20, seed: 'cfc.' + major + '.' + sub };
    case 'reservoir.echo': return { nin: 1, nres: 16, nout: 1, spectralRadius: 0.9, leak: 0.3, lr: 0.05, seed: 'echo.' + major + '.' + sub };
    case 'knn.retrieve': return { k: 1 + (sub % 4), capacity: 256 };
    case 'memory.assoc': return { threshold: 0.15, capacity: 512 };
    case 'hopfield.assoc': return { beta: 8, iters: 3, capacity: 32 };
    case 'num.arith': return { op: ['+', '-', '*'][(major + sub) % 3] };
    case 'route.key': return { keyField: 'key', table: { a: 0, b: 1, c: 2, d: 3 }, dflt: (major + sub) % 4 };
    case 'logic.gate': return { op: ['and', 'or', 'xor', 'not'][(major + sub) % 4] };
    case 'evaluate.threshold': return { threshold: Math.fround(0.1 + rng.next() * 0.8), direction: sub % 2 ? 'above' : 'below' };
    case 'verify.numeric': return { tolerance: '0' };
    case 'sym.solve': return { variable: 'x' };
    case 'sym.diff': return { variable: 'x' };
    case 'vec.mlp': return { nin: 8, nhid: 16, nout: 4, lr: 0.05, seed: 'mlp.' + major + '.' + sub };
    case 'state.machine': return { initial: 'idle', transitions: { idle: { a: 'ready', b: 'idle' }, ready: { c: 'acting', b: 'idle' }, acting: { d: 'idle', a: 'ready' } } };
    case 'event.filter': return { field: 'key', values: null, emit: null };
    case 'timer': return { ticks: [4, 16, 64, 256][sub % 4] };
    case 'num.register': return { initial: 0 };
    case 'sink.log': return { keep: 16 };
    case 'rate.meter': return { windowMs: SEC };
    case 'stat.running': return { every: [4, 8, 16, 32][sub % 4] };
    case 'stat.histogram': return { min: 0, max: 1, bins: 10 };
    case 'anomaly.zscore': return { threshold: 3, warmup: 5 };
    case 'integrate.leaky': return { threshold: 1, decay: 0.9, refractory: 5 };
    case 'oscillator': return { periods: [4, 16, 64, 256] };
    case 'source.counter': return {};
    default: return {};
  }
}
