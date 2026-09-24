// seeds/organism.mjs: THE ORGANISM. Five thousand major computational nodes, each a
// circuit of typed cells, arranged into the regions the design names, wired sparsely
// inside each major, sparsely across neighbouring majors of the same region, and thinly
// but with real delay across regions along the information flow of the design.
//
//   primitive -> cell -> circuit -> region -> network
//
// A major node is a circuit. `majors` circuits of `subcellsPerMajor` cells is the scale
// axis; the period every cell carries is the time axis (1 tick, a second, a minute, an
// hour); the kinds drawn from the registry are the cell axis. Determinism is absolute:
// one seeded RNG, one fixed traversal order, so the same seed is the same organism down
// to the last float32 weight, which is what makes genome/emit.mjs able to write it out as
// source and genome/load.mjs able to read it back and be believed.
//
// Every edge is legal by construction. The destination and its port are drawn from the
// acceptor index in genome/wire.mjs, which admits a pair only when the source port's kinds
// are a subset of the destination port's kinds. That is the rule Brain.compatiblePorts
// uses, and it is stricter than the rule Brain.connect enforces, so no signal this
// organism emits can ever be refused at the far end for a kind mismatch.
import { Brain } from '../core/brain.mjs';
import { SEC, MIN, HOUR } from '../core/clock.mjs';
import { getKind } from '../core/cell.mjs';
import { RNG } from '../core/rng.mjs';
import '../cells/index.mjs';
// Two rosters below name kinds cells/index.mjs does not register: the grid family lives
// with the grid primitives, and seq.fit lives with the sequence suite. Importing them here
// is what makes the grid and sequence suites hostable by a region roster at all
// (notes/generations.md request 6). Neither module defines a kind cells/index.mjs also
// defines, so nothing is shadowed and no existing organism changes because of the import.
import '../cells/grid.mjs';
import '../tasks/sequence.mjs';
import { Wiring, acceptorIndex, portKey, lowerBound, portPairs, monomorphicGrowth } from '../genome/wire.mjs';

// ---------------------------------------------------------------- the regions
// share: fraction of the major nodes. flow: where this region's long range axons go.
// roster: the kinds a major of this region is built from, cycled in order so that every
// major holds a mix and the mix is the same for the same seed.
export const REGIONS = [
  {
    name: 'perception', prefix: 'pe', share: 0.18,
    doc: 'sensory input and encoding: events, numbers, time and vectors become hypervectors and sparse codes',
    flow: [['association', 6], ['memory', 2], ['cognitive', 1]],
    // The six grid kinds at the end are the ones tasks/grid.mjs searches over. They are
    // here so that the grid suite is reachable from a region roster at all: before they
    // were, no genome of generations/organism-genome.mjs could ever host it and the task
    // denominator was two rather than three. A grid cell guards on G.valid, so one that is
    // handed an event that is not a grid emits nothing, which is why they are inert in an
    // organism nobody has injected a grid into.
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
    // seq.fit is last for the same reason the grid kinds are in perception: the sequence
    // suite is made of that one kind, and until a roster carried it no genome could host
    // the suite. It guards on an event carrying an array of terms, so it is inert until
    // one arrives.
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

// The homeostasis clock: the first major of the homeostasis region is not drawn from the
// roster. It is a fixed ladder across the timescale spectrum of core/clock.mjs, one driver
// per scale, plus the meters that watch them. Every other periodic cell in the organism is
// a multiple of one of these.
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

// Out ports this organism does not wire, each with a measured reason. EMPTY: every out
// port of every cell is wired. It held one entry while predict.next.error could emit a NaN
// inside a `num` (notes/genome.md request 3); core now reads a non-finite similarity as
// maximum error, so the entry was lifted and the test asserts the port is wired again.
// The table stays as the one declared place for such an exclusion, so that a future one is
// a named line with a reason rather than a silent filter.
const BLOCKED_OUT = new Map();

// The period spectrum every non clock cell is drawn from, with its weights. A cell with no
// in ports can never be woken by mail, so it is always given a numeric period instead.
const PERIODS = [['event', 0.68], [1, 0.12], [SEC, 0.10], [MIN, 0.06], [HOUR, 0.04]];
const DRIVER_PERIODS = [[1, 0.45], [SEC, 0.35], [MIN, 0.15], [HOUR, 0.05]];

/**
 * Grow the organism.
 * @param {object} [opts]
 * @param {number} [opts.majors] major computational nodes, one circuit each
 * @param {number} [opts.subcellsPerMajor] cells inside each major
 * @param {number} [opts.edgesPerCell] out edges attempted per cell
 * @param {string} [opts.seed] the whole organism is a function of this
 * @param {string} [opts.name]
 * @param {string} [opts.ledger] 'off' | 'runs' | 'full'
 * @param {number} [opts.localWindow] how many neighbouring majors a regional edge may reach
 * @param {Array<object>} [opts.regions] the region table to grow from, defaulting to the
 *   REGIONS this module exports. Each entry is { name, prefix, share, flow, roster, doc }
 *   and is read, never written. A caller that wants a different share or a different
 *   roster per region passes its own table instead of patching the exported one, so two
 *   organisms with different rosters can be grown in one process
 *   (notes/generations.md request 4).
 * @param {object} [opts.growth] CoActivation options, passed to Brain untouched. The
 *   default is core's own default, so this organism grows structure like any other brain.
 *   It was forced to sampleBudget 0 while core's edge index could not be rebuilt at this
 *   scale (notes/genome.md request 1); core indexes with a loop now, so the cap is gone.
 * @returns {Brain}
 */
export function buildOrganism({
  majors = 5000, subcellsPerMajor = 8, edgesPerCell = 12, seed = 'organism',
  name = 'gen-0', ledger = 'off', pruneEvery = 0, localWindow = 8,
  regions = REGIONS, growth = {}, gate = {}, dir = null,
} = {}) {
  if (!(Number.isInteger(majors) && majors > 0)) throw new Error('buildOrganism: majors must be a positive integer');
  if (!(Number.isInteger(subcellsPerMajor) && subcellsPerMajor > 0)) throw new Error('buildOrganism: subcellsPerMajor must be a positive integer');
  if (!(Number.isInteger(edgesPerCell) && edgesPerCell >= 0)) throw new Error('buildOrganism: edgesPerCell must be a non negative integer');
  if (!(Array.isArray(regions) && regions.length > 0)) throw new Error('buildOrganism: regions must be a non empty array');
  for (const r of regions) {
    if (!r || typeof r.name !== 'string' || typeof r.prefix !== 'string') throw new Error('buildOrganism: every region needs a name and a prefix');
    if (!(Array.isArray(r.roster) && r.roster.length > 0)) throw new Error('buildOrganism: region ' + r.name + ' has an empty roster');
    if (!(Number.isFinite(r.share) && r.share > 0)) throw new Error('buildOrganism: region ' + r.name + ' has share ' + r.share);
  }
  // A long range axon is drawn from the flow table and landed inside the named region, so a
  // flow that names a region this table does not carry would pick a range that does not
  // exist. Refused here, by name, rather than met later as an undefined destination.
  const declared = new Set(regions.map(r => r.name));
  for (const r of regions) for (const [to] of (r.flow || [])) {
    if (!declared.has(to)) throw new Error('buildOrganism: region ' + r.name + ' flows to ' + to + ', which this region table does not declare');
  }

  const b = new Brain({ name, seed, dir, ledger, pruneEvery, growth, policy: monomorphicGrowth(gate), gate });
  // Growth is a consumer of brain.rng at tick time, so construction must not touch it: a
  // brain grown here and the same brain loaded from emitted source have to reach their
  // first tick with the identical stream position, or they grow different structure and
  // stop being the same organism. Wiring therefore draws from its own stream.
  const rng = new RNG(seed + ':wiring');
  // The runtime options travel with the genome, so genome/load.mjs rebuilds the brain with
  // the same ledger, pruning and growth settings rather than guessing them.
  b.genome = {
    name, seed, majors, subcellsPerMajor, edgesPerCell, localWindow,
    runtime: { ledger, pruneEvery, growth, gate },
  };

  // ---------------------------------------------------------- majors per region
  const quota = shareOut(majors, regions.map(r => r.share));
  const plan = regions.map((r, i) => ({ ...r, majors: quota[i] }));

  // ---------------------------------------------------------- cells
  const regionRange = new Map();   // region name -> [loCellIdx, hiCellIdx)
  const majorRange = [];           // global major index -> [loCellIdx, hiCellIdx)
  const majorRegion = [];          // global major index -> region name
  const regionMajors = new Map();  // region name -> [loMajorIdx, hiMajorIdx)
  let major = 0;

  for (const r of plan) {
    const cellLo = b.cells.length, majorLo = major;
    for (let m = 0; m < r.majors; m++, major++) {
      const isClock = r.name === 'homeostasis' && m === 0;
      const circuit = r.prefix + '.' + pad(major);
      const circuitPeriod = isClock ? 1 : pickWeighted(rng, PERIODS);
      b.addCircuit(r.name, circuit, { period: circuitPeriod, doc: isClock ? 'the homeostasis clock: one driver per timescale' : '' });
      const lo = b.cells.length;
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
        b.addCell({ id, kind: kindName, region: r.name, circuit, params, policy });
      }
      majorRange.push([lo, b.cells.length]);
      majorRegion.push(r.name);
    }
    regionRange.set(r.name, [cellLo, b.cells.length]);
    regionMajors.set(r.name, [majorLo, major]);
  }

  // ---------------------------------------------------------- wiring
  const acceptors = acceptorIndex(b);
  const wiring = new Wiring(b, { reserve: b.cells.length * edgesPerCell, strict: true });
  // A port that declares several signal kinds is monomorphised by its first afferent:
  // once an hv reaches predict.next.observe, only hv may reach it. A cell that meets two
  // different kinds on one port is a cell whose own state is of the wrong kind on the next
  // run, which shows up as a caught compute error rather than as a wiring error, so the
  // constraint belongs here, at wiring time, where it is cheap and provable.
  const claims = new Map(); // dstIdx * 16 + dstPort -> the kind key that owns it

  const local = Math.max(1, Math.round(edgesPerCell * 0.34));
  const regional = Math.max(1, Math.round(edgesPerCell * 0.42));
  const long = Math.max(0, edgesPerCell - local - regional);

  for (let m = 0; m < majorRange.length; m++) {
    const [lo, hi] = majorRange[m];
    const region = majorRegion[m];
    const rplan = plan.find(p => p.name === region);
    const [rLo, rHi] = regionRange.get(region);
    const [mLo, mHi] = regionMajors.get(region);
    const isClock = region === 'homeostasis' && m === mLo;

    for (let i = lo; i < hi; i++) {
      const cell = b.cells[i];
      const blocked = BLOCKED_OUT.get(cell.kind);
      const ports = [];
      for (let p = 0; p < cell.ports.out.length; p++) if (!blocked || !blocked.has(p)) ports.push(p);
      const nOut = ports.length;
      if (nOut === 0) continue;
      const keys = cell.ports.out.map(p => portKey(p));

      // 1. inside the major: dense, immediate, no delay. The circuit is the unit of
      //    local computation, so its cells talk to each other within one tick.
      const wLo = Math.max(mLo, m - localWindow), wHi = Math.min(mHi, m + localWindow + 1);
      const nbLo = majorRange[wLo][0], nbHi = majorRange[wHi - 1][1];
      for (let k = 0; k < local; k++) {
        const sp = ports[k % nOut];
        const ok = wire(wiring, acceptors, claims, rng, i, sp, keys[sp], lo, hi, { wMin: 0.35, wSpan: 1.4, delay: 0 });
        if (!ok) wire(wiring, acceptors, claims, rng, i, sp, keys[sp], nbLo, nbHi, { wMin: 0.35, wSpan: 1.4, delay: 1 });
      }
      // 2. inside the region, neighbouring majors: a sliding window, one or two ticks.
      for (let k = 0; k < regional; k++) {
        const sp = ports[(k + 1) % nOut];
        const ok = wire(wiring, acceptors, claims, rng, i, sp, keys[sp], nbLo, nbHi, { wMin: 0.2, wSpan: 1.1, delay: 1 + rng.int(3) });
        if (!ok) wire(wiring, acceptors, claims, rng, i, sp, keys[sp], rLo, rHi, { wMin: 0.2, wSpan: 1.1, delay: 1 + rng.int(3) });
      }
      // 3. across regions: thin, slow, and along the flow the design names. The clock
      //    major broadcasts instead, one axon into every region.
      const longCount = isClock ? Math.max(long, plan.length) : long;
      for (let k = 0; k < longCount; k++) {
        const sp = ports[(k + 2) % nOut];
        const target = isClock ? plan[k % plan.length].name : pickWeighted(rng, rplan.flow);
        const [tLo, tHi] = regionRange.get(target);
        wire(wiring, acceptors, claims, rng, i, sp, keys[sp], tLo, tHi, { wMin: 0.1, wSpan: 0.9, delay: 2 + rng.int(30) });
      }
    }
  }
  wiring.finish();
  b.genome.wiring = { added: wiring.added, duplicates: wiring.duplicates, illegal: wiring.illegal, claimedPorts: claims.size };
  return b;
}

// Draw one legal destination out of [lo, hi) and add the edge. Returns whether it landed.
function wire(wiring, acceptors, claims, rng, srcIdx, sp, key, lo, hi, { wMin, wSpan, delay }) {
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
    // (predict.next.prediction re-emits whatever kind it observed) is claimed by the
    // SOURCE CELL as well, because two such sources can agree statically and still deliver
    // two different kinds at run time, and the destination's own state would then be of
    // the wrong kind on its next run.
    const mine = key.includes('|') ? key + '#' + srcIdx : key;
    const owner = claims.get(claim);
    if (owner !== undefined && owner !== mine) continue;
    const e = wiring.add(srcIdx, dst, sp, dp, { w: Math.fround(wMin + rng.next() * wSpan), delay, conf: 0.5 });
    if (e >= 0) { claims.set(claim, mine); return true; }
  }
  return false;
}

// Largest remainder: the shares sum to the total exactly, deterministically.
function shareOut(total, shares) {
  const sum = shares.reduce((a, s) => a + s, 0);
  const raw = shares.map(s => (s / sum) * total);
  const floor = raw.map(Math.floor);
  let left = total - floor.reduce((a, v) => a + v, 0);
  const order = raw.map((v, i) => [v - floor[i], i]).sort((x, y) => y[0] - x[0] || x[1] - y[1]);
  for (let k = 0; left > 0; k++, left--) floor[order[k % order.length][1]]++;
  return floor;
}

function pickWeighted(rng, pairs) {
  let total = 0;
  for (const p of pairs) total += p[1];
  let r = rng.next() * total;
  for (const p of pairs) { r -= p[1]; if (r <= 0) return p[0]; }
  return pairs[pairs.length - 1][0];
}

// A cell with no in ports can never be woken by mail (Brain._tick only wakes an event
// cell whose mailbox is non empty), so a driver always carries a numeric period.
function periodFor(kindName, rng) {
  const driver = getKind(kindName).ports.in.length === 0;
  return pickWeighted(rng, driver ? DRIVER_PERIODS : PERIODS);
}

const pad = (n) => String(n).padStart(4, '0');

// Parameters per kind. Every value is drawn from the seeded RNG or fixed, never from the
// clock or the environment, so the organism is a pure function of its seed.
function paramsFor(kind, rng, major, sub) {
  switch (kind) {
    case 'encode.hv': return { sequence: sub % 2 === 0 };
    // levels is a table of `levels` hypervectors held per cell, and a hypervector is 8192
    // bytes, so this parameter is the organism's largest single memory term. Kept modest.
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
    // The grid family. Every parameter is small and bounded on purpose: grid.tile is the
    // only one that can grow its input, and 2 x 1 keeps a chain of them linear rather than
    // exponential in the length of the chain.
    case 'grid.rotate': return { turns: 1 + (major + sub) % 3 };
    case 'grid.flip': return { axis: sub % 2 ? 'v' : 'h' };
    case 'grid.transpose': return {};
    case 'grid.crop': return { mode: 'bbox', bg: 0 };
    case 'grid.translate': return { dx: (major % 3) - 1, dy: (sub % 3) - 1, wrap: true, fill: 0 };
    case 'grid.tile': return { nx: 2, ny: 1 };
    case 'seq.fit': return { maxPeriod: 5, maxDegree: 4 };
    default: return {};
  }
}

/**
 * Check every edge of an organism against the same subset rule the wiring used. Used by
 * the tests and by genome/load.mjs's verify.
 * @param {Brain} brain
 * @returns {{ checked: number, faults: string[] }}
 */
export function auditWiring(brain) {
  const k = brain.connectome, faults = [];
  for (let e = 0; e < k.n && faults.length < 20; e++) {
    const a = brain.cells[k.src[e]], b = brain.cells[k.dst[e]];
    const pairs = portPairs(a, b);
    if (!pairs.some(([sp, dp]) => sp === k.srcPort[e] && dp === k.dstPort[e])) {
      faults.push('edge ' + e + ': ' + a.id + ' port ' + k.srcPort[e] + ' -> ' + b.id + ' port ' + k.dstPort[e]);
    }
  }
  return { checked: k.n, faults };
}
