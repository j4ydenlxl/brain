// generations/mutate.mjs: VARIATION. Every operator takes an RNG from core/rng.mjs and an
// Innovations counter, so a run is reproducible from a seed and two genomes that received
// the same structural mutation carry the same innovation number.
//
// A mutation may never produce a circuit the connectome would refuse: add-edge and
// add-cell only ever pick port pairs that pass portsCompatible, the same rule
// core/brain.mjs connect() enforces. Cell genes marked fixed are the task interface and
// are never touched.
import { cellGene, edgeGene, cloneGenome, cellById } from './genome.mjs';
import { geneSpec, compatiblePairs, portsCompatible, PERIODS } from './palette.mjs';

export const DEFAULT_RATES = Object.freeze({
  perturbWeight: 0.8,     // per enabled edge, jitter the weight
  replaceWeight: 0.08,    // per enabled edge, draw a fresh weight instead
  addEdge: 0.18,          // per genome, try to wire a new pathway
  addCell: 0.06,          // per genome, split an edge with a new cell
  toggleEdge: 0.03,       // per genome, flip one edge on or off
  perturbParam: 0.25,     // per genome, jitter one numeric cell param
  changeParamChoice: 0.05,// per genome, swap one categorical cell param (activation)
  changePeriod: 0.08,     // per genome, move one cell onto another timescale
  changeDelay: 0.05,      // per genome, jitter one edge conduction delay
});

export const DEFAULT_LIMITS = Object.freeze({
  maxCells: 24,
  maxEdges: 96,
  maxDelay: 8,
  weightSigma: 0.5,
  weightInit: 1.0,
  weightClamp: 4,
  addEdgeTries: 16,
});

function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }

// `fixed` means the task interface: the cell is never removed, its kind never changes, it is
// never the new cell of a split, and its period stays on the interface clock. Its tuning
// params are still fair game unless named in `lock`, which holds the params that decide the
// shape of the interface (input width, output width, and anything a task pinned).
function paramMutable(c, name) { return !(c.lock || []).includes(name); }
function periodMutableCells(g) { return g.cells.filter((c) => !c.fixed); }
function paramCells(g, kindOfParam) {
  return g.cells.filter((c) => {
    const spec = geneSpec(c.kind);
    return Object.keys(spec[kindOfParam] || {}).some((n) => paramMutable(c, n));
  });
}

// ---------------------------------------------------------------- weights
export function perturbWeights(g, { rng, rates = DEFAULT_RATES, limits = DEFAULT_LIMITS }) {
  let n = 0;
  for (const e of g.edges) {
    if (!e.enabled) continue;
    if (rng.next() < rates.replaceWeight) { e.w = rng.gauss() * limits.weightInit; n++; }
    else if (rng.next() < rates.perturbWeight) { e.w = clamp(e.w + rng.gauss() * limits.weightSigma, -limits.weightClamp, limits.weightClamp); n++; }
  }
  return n;
}

// ---------------------------------------------------------------- structure
// Add one edge between two existing cells on a port pair whose kinds can meet.
// Self loops are allowed: an edge costs at least one tick, so a self loop is memory.
export function addEdge(g, { rng, innov, limits = DEFAULT_LIMITS }) {
  if (g.edges.length >= limits.maxEdges) return null;
  const have = new Set(g.edges.map((e) => e.src + '>' + e.dst + ':' + e.srcPort + ':' + e.dstPort));
  for (let tryN = 0; tryN < limits.addEdgeTries; tryN++) {
    const a = rng.pick(g.cells), b = rng.pick(g.cells);
    // the input cell is fed by the task only, and a control cell must stay unwired or it
    // stops being a control
    if (b.role === 'in' || b.role === 'ctl' || a.role === 'ctl') continue;
    const pairs = compatiblePairs(a.kind, b.kind);
    if (!pairs.length) continue;
    const [sp, dp] = rng.pick(pairs);
    const key = a.id + '>' + b.id + ':' + sp + ':' + dp;
    if (have.has(key)) continue;
    const e = edgeGene({
      innov: innov.of('edge:' + key),
      src: a.id, dst: b.id, srcPort: sp, dstPort: dp,
      w: rng.gauss() * limits.weightInit,
      delay: 0, enabled: true,
    });
    g.edges.push(e);
    return e;
  }
  return null;
}

// Split an enabled edge with a new cell: src -> new (weight 1) and new -> dst (the old
// weight), the old edge disabled. This is the NEAT node mutation, with the extra
// requirement that both halves must be port-kind legal for the chosen kind.
export function addCell(g, { rng, innov, palette, width = 4, limits = DEFAULT_LIMITS }) {
  if (g.cells.length >= limits.maxCells) return null;
  const live = g.edges.filter((e) => e.enabled);
  if (!live.length) return null;
  for (let tryN = 0; tryN < limits.addEdgeTries; tryN++) {
    const old = rng.pick(live);
    const a = cellById(g, old.src), b = cellById(g, old.dst);
    const kind = rng.pick(palette);
    const inPairs = compatiblePairs(a.kind, kind);
    const outPairs = compatiblePairs(kind, b.kind);
    const usable = inPairs.filter(([sp]) => sp === old.srcPort);
    const usableOut = outPairs.filter(([, dp]) => dp === old.dstPort);
    if (!usable.length || !usableOut.length) continue;
    const [, midIn] = rng.pick(usable);
    const [midOut] = rng.pick(usableOut);
    const spec = geneSpec(kind);
    const num = innov.of('cell:' + old.innov + ':' + kind);
    const id = 'c' + num;
    if (cellById(g, id)) continue;
    const gene = cellGene({
      innov: num, id, kind,
      params: spec.params(rng, width),
      period: rng.pick(PERIODS),
      region: a.region, circuit: a.circuit,
    });
    g.cells.push(gene);
    old.enabled = false;
    g.edges.push(edgeGene({ innov: innov.of('edge:' + old.src + '>' + id + ':' + old.srcPort + ':' + midIn), src: old.src, dst: id, srcPort: old.srcPort, dstPort: midIn, w: 1, delay: 0 }));
    g.edges.push(edgeGene({ innov: innov.of('edge:' + id + '>' + old.dst + ':' + midOut + ':' + old.dstPort), src: id, dst: old.dst, srcPort: midOut, dstPort: old.dstPort, w: old.w, delay: old.delay }));
    return gene;
  }
  return null;
}

export function toggleEdge(g, { rng }) {
  if (!g.edges.length) return null;
  const e = rng.pick(g.edges);
  e.enabled = !e.enabled;
  return e;
}

export function changeDelay(g, { rng, limits = DEFAULT_LIMITS }) {
  if (!g.edges.length) return null;
  const e = rng.pick(g.edges);
  e.delay = clamp(e.delay + (rng.u32() & 1 ? 1 : -1), 0, limits.maxDelay);
  return e;
}

// ---------------------------------------------------------------- parameters and time
export function perturbParam(g, { rng }) {
  const cells = paramCells(g, 'numeric');
  if (!cells.length) return null;
  const c = rng.pick(cells);
  const spec = geneSpec(c.kind);
  const names = Object.keys(spec.numeric || {}).filter((n) => paramMutable(c, n));
  if (!names.length) return null;
  const name = rng.pick(names);
  const [lo, hi] = spec.numeric[name];
  const span = hi - lo;
  let v = (c.params[name] ?? (lo + hi) / 2) + rng.gauss() * span * 0.1;
  v = clamp(v, lo, hi);
  if (spec.integer && spec.integer[name]) v = Math.max(Math.round(lo), Math.round(v));
  c.params[name] = v;
  return { cell: c.id, param: name, value: v };
}

export function changeParamChoice(g, { rng }) {
  const cells = paramCells(g, 'choice');
  if (!cells.length) return null;
  const c = rng.pick(cells);
  const spec = geneSpec(c.kind);
  const names = Object.keys(spec.choice || {}).filter((n) => paramMutable(c, n));
  if (!names.length) return null;
  const name = rng.pick(names);
  c.params[name] = rng.pick(spec.choice[name]);
  return { cell: c.id, param: name, value: c.params[name] };
}

// Multi-timescale is a gene: this is the only operator that moves a cell to another clock.
export function changePeriod(g, { rng }) {
  const cells = periodMutableCells(g);
  if (!cells.length) return null;
  const c = rng.pick(cells);
  c.period = rng.pick(PERIODS);
  return { cell: c.id, period: c.period };
}

// ---------------------------------------------------------------- the operator
// Returns a NEW genome. Records which operators fired in meta.mutations so a lineage can
// be read back out of the archive.
export function mutate(genome, { rng, innov, palette, width = 4, rates = DEFAULT_RATES, limits = DEFAULT_LIMITS, id = null }) {
  const g = cloneGenome(genome);
  if (id) g.id = id;
  const fired = [];
  if (perturbWeights(g, { rng, rates, limits })) fired.push('weights');
  if (rng.next() < rates.addEdge && addEdge(g, { rng, innov, limits })) fired.push('addEdge');
  if (rng.next() < rates.addCell && addCell(g, { rng, innov, palette, width, limits })) fired.push('addCell');
  if (rng.next() < rates.toggleEdge && toggleEdge(g, { rng })) fired.push('toggleEdge');
  if (rng.next() < rates.perturbParam && perturbParam(g, { rng })) fired.push('perturbParam');
  if (rng.next() < rates.changeParamChoice && changeParamChoice(g, { rng })) fired.push('changeParamChoice');
  if (rng.next() < rates.changePeriod && changePeriod(g, { rng })) fired.push('changePeriod');
  if (rng.next() < rates.changeDelay && changeDelay(g, { rng, limits })) fired.push('changeDelay');
  g.meta.mutations = fired;
  return g;
}

// A structural check any caller can run: no edge in the genome may wire ports whose kinds
// cannot meet. mutate() is expected to keep this true for every genome it ever returns.
export function portsAllValid(g) {
  for (const e of g.edges) {
    const a = cellById(g, e.src), b = cellById(g, e.dst);
    if (!a || !b) return false;
    if (!portsCompatible(a.kind, e.srcPort, b.kind, e.dstPort)) return false;
  }
  return true;
}
