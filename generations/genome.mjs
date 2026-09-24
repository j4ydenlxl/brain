// generations/genome.mjs: THE GENOME. A genome describes a circuit, not a brain: cell
// genes (kind, params, policy) and edge genes (src, dst, ports, w, delay, enabled), each
// carrying a NEAT style innovation number from a global counter so two genomes that share
// a history can be aligned gene by gene.
//
// A genome is plain JSON. It is built into a real Brain by instantiate(), which uses
// brain.addCell and brain.connect, so the connectome refuses any wire whose port kinds
// cannot meet, exactly as it does for a hand wired brain.
import { Brain } from '../core/brain.mjs';
import { Ledger } from '../core/ledger.mjs';
import { Connectome } from '../core/connectome.mjs';
import { getKind } from '../core/cell.mjs';
import '../cells/basic.mjs';
import { portsCompatible, periodValue } from './palette.mjs';

// ---------------------------------------------------------------- innovation numbers
// One counter per evolutionary run. The same structural mutation asked for twice in the
// same run gets the same number, which is what makes crossover alignment meaningful.
export class Innovations {
  constructor(start = 1) { this.n = start; this.map = new Map(); }
  of(key) {
    let v = this.map.get(key);
    if (v === undefined) { v = this.n++; this.map.set(key, v); }
    return v;
  }
  next() { return this.n++; }
  size() { return this.map.size; }
  serialize() { return { n: this.n, map: [...this.map] }; }
  static from(j) { const i = new Innovations(j.n); i.map = new Map(j.map); return i; }
}

// ---------------------------------------------------------------- genes
// role: 'in' is where the task injects, 'out' is where the task reads. Both are fixed, so
// no mutation may change or remove them and every genome keeps the same interface.
// `lock` names params no mutation may touch (the ones that set the interface shape).
export function cellGene({ id, kind, params = {}, period = 1, region = 'evolved', circuit = 'circuit', innov = 0, fixed = false, role = null, lock = [] }) {
  return { innov, id, kind, params: { ...params }, period, region, circuit, fixed, role, lock: [...lock] };
}
export function edgeGene({ innov, src, dst, srcPort = 0, dstPort = 0, w = 1, delay = 0, enabled = true }) {
  return { innov, src, dst, srcPort, dstPort, w, delay, enabled };
}

export function createGenome({ id = 'g0', cells = [], edges = [], meta = {} } = {}) {
  return { id, cells, edges, meta: { gen: 0, parents: [], mutations: [], species: -1, island: 0, ...meta } };
}

export function cloneGenome(g) {
  return {
    id: g.id,
    cells: g.cells.map((c) => ({ ...c, params: { ...c.params }, lock: [...(c.lock || [])] })),
    edges: g.edges.map((e) => ({ ...e })),
    meta: { ...g.meta, parents: [...(g.meta.parents || [])], mutations: [...(g.meta.mutations || [])] },
  };
}

// JSON round trip. The genome is already plain data, so this is a deep copy plus a
// version stamp; it exists so the worker protocol and the archive have one shape.
export function genomeToJSON(g) { return { v: 1, id: g.id, cells: g.cells, edges: g.edges, meta: g.meta }; }
export function genomeFromJSON(j) {
  if (!j || j.v !== 1) throw new Error('genome: unknown serialized version ' + (j && j.v));
  return createGenome({ id: j.id, cells: j.cells.map((c) => ({ ...c, params: { ...c.params } })), edges: j.edges.map((e) => ({ ...e })), meta: j.meta });
}

// ---------------------------------------------------------------- inspection
export function cellById(g, id) { return g.cells.find((c) => c.id === id) || null; }
export function enabledEdges(g) { return g.edges.filter((e) => e.enabled); }

export function genomeStats(g) {
  let periodSum = 0;
  for (const c of g.cells) periodSum += periodValue(c.period);
  const enabled = enabledEdges(g);
  return {
    cells: g.cells.length,
    edges: g.edges.length,
    enabled: enabled.length,
    meanPeriod: g.cells.length ? periodSum / g.cells.length : 1,
    meanWeight: enabled.length ? enabled.reduce((s, e) => s + Math.abs(e.w), 0) / enabled.length : 0,
    depth: depthFrom(g),
  };
}

// Longest enabled path from any input-marked cell, counted in edges. Cycles are legal
// (every edge costs at least one tick), so the walk stops when it revisits a cell.
export function depthFrom(g, roots = null) {
  let src = roots || g.cells.filter((c) => c.role === 'in').map((c) => c.id);
  if (!src.length) src = g.cells.length ? [g.cells[0].id] : [];
  const out = new Map();
  for (const e of enabledEdges(g)) {
    if (!out.has(e.src)) out.set(e.src, []);
    out.get(e.src).push(e.dst);
  }
  let best = 0;
  const walk = (id, d, seen) => {
    if (d > best) best = d;
    if (d > g.cells.length + 2) return;
    for (const nxt of out.get(id) || []) {
      if (seen.has(nxt)) continue;
      seen.add(nxt); walk(nxt, d + 1, seen); seen.delete(nxt);
    }
  };
  for (const r of src) walk(r, 0, new Set([r]));
  return best;
}

// Structural problems that would make instantiate() throw. Returns a list, empty is good.
export function validate(g) {
  const problems = [];
  const ids = new Set();
  for (const c of g.cells) {
    if (ids.has(c.id)) problems.push('duplicate cell gene id ' + c.id);
    ids.add(c.id);
    try { getKind(c.kind); } catch { problems.push('unknown kind ' + c.kind + ' on ' + c.id); }
  }
  const seen = new Set();
  for (const e of g.edges) {
    if (!ids.has(e.src)) problems.push('edge ' + e.innov + ' has no src cell ' + e.src);
    if (!ids.has(e.dst)) problems.push('edge ' + e.innov + ' has no dst cell ' + e.dst);
    const key = e.src + '>' + e.dst + ':' + e.srcPort + ':' + e.dstPort;
    if (seen.has(key)) problems.push('duplicate edge ' + key);
    seen.add(key);
    const a = cellById(g, e.src), b = cellById(g, e.dst);
    if (a && b && !portsCompatible(a.kind, e.srcPort, b.kind, e.dstPort)) {
      problems.push('edge ' + e.innov + ' wires incompatible ports ' + a.kind + '[' + e.srcPort + '] -> ' + b.kind + '[' + e.dstPort + ']');
    }
  }
  return problems;
}

// ---------------------------------------------------------------- instantiation
// Build the genome into a Brain. Disabled edges are not wired; the gene is kept so a later
// toggle can bring the pathway back, which is the point of keeping it.
export function instantiate(genome, brain, { prefix = '' } = {}) {
  const map = new Map();
  for (const g of genome.cells) {
    const cell = brain.addCell({
      id: prefix + g.id,
      kind: g.kind,
      region: g.region,
      circuit: g.circuit,
      params: g.params,
      policy: { period: g.period },
    });
    map.set(g.id, cell);
  }
  let wired = 0;
  for (const e of genome.edges) {
    if (!e.enabled) continue;
    brain.connect(prefix + e.src, e.srcPort, prefix + e.dst, e.dstPort, { w: e.w, delay: e.delay, conf: 1 });
    wired++;
  }
  return { cells: map, wired };
}

// A Brain sized for one episode: no ledger, no growth, no pruning, so what is measured is
// the genome and nothing the host brain did to it while it ran.
//
// Two allocations are resized down here because this constructor runs once per car per
// episode, hundreds of thousands of times in a bench. The default in-memory ledger ring is
// 100,000 slots; the default connectome capacity is 1024 edges across ten typed arrays,
// about 34 KB, for a genome that usually has fewer than twenty. Both grow on demand.
export function buildBrain(genome, { name = 'episode', seed = 'episode', prefix = '' } = {}) {
  const b = new Brain({ name, seed, ledger: 'off', pruneEvery: 0, growth: { threshold: 1e9, maxPairs: 0 } });
  b.ledger = new Ledger({ ring: 16 });
  b.gate.ledger = b.ledger;
  b.ctx.ledger = b.ledger;
  b.connectome = new Connectome(Math.max(4, genome.edges.length + 2));
  const built = instantiate(genome, b, { prefix });
  return { brain: b, ...built };
}
