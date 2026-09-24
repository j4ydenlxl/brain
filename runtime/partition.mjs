// runtime/partition.mjs : WHERE EACH CELL LIVES.
//
// Sharding a brain only pays if the wiring is local. The organism's wiring is not random:
// a circuit is a major node whose sub cells talk mostly to each other, and a region is a
// wall most edges do not cross. So the partition starts from that structure (region, then
// circuit when there are more shards than regions) and is then refined by moving single
// cells to the shard most of their neighbours already live in, under a capacity cap that
// keeps the shards balanced.
//
// The refinement is a balanced label propagation with a Kernighan Lin style gain test: a
// cell moves only when the move strictly lowers the number of cut edges (gain > 0) and the
// destination shard is still under its cap. Passes run over cells in a fixed order, so the
// result is a pure function of (graph, shards, passes) with no randomness at all.
//
// Everything here is measurement plus an Int32Array. Nothing is estimated: cutBefore and
// cutAfter are counted edge by edge over the same edge list.
//
// As a program:
//   node runtime/partition.mjs --organism organism/gen-0 --shards 8 [--passes 8] [--slack 1.05]
//   node runtime/partition.mjs --relay 5000 --shards 8
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ---------------------------------------------------------------- the graph
// A graph here is the undirected projection of the connectome: n cells, an edge list of
// (a, b) pairs, and the group label each cell starts in. Direction does not matter for the
// cut: an edge costs a message whichever way it points.
export function graphFromBrain(brain) {
  const n = brain.cells.length, c = brain.connectome;
  const ea = new Int32Array(c.n), eb = new Int32Array(c.n);
  let m = 0;
  for (let e = 0; e < c.n; e++) {
    const a = c.src[e], b = c.dst[e];
    if (a === b) continue;
    ea[m] = a; eb[m] = b; m++;
  }
  const region = new Array(n), circuit = new Array(n);
  for (let i = 0; i < n; i++) { region[i] = brain.cells[i].region; circuit[i] = brain.cells[i].region + '/' + brain.cells[i].circuit; }
  const pinned = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = brain.regions.get(brain.cells[i].region);
    if (r && Number.isFinite(r.budget)) pinned[i] = 1; // a finite region budget may not be split across shards
  }
  return { n, m, ea: ea.subarray(0, m), eb: eb.subarray(0, m), region, circuit, pinned, selfEdges: c.n - m };
}

export function graphFromSpec(spec) {
  const cells = spec.cells, n = cells.length, edges = spec.edges || [];
  const ea = new Int32Array(edges.length), eb = new Int32Array(edges.length);
  let m = 0;
  for (const e of edges) {
    const a = typeof e.src === 'number' ? e.src : cells.findIndex(c => c.id === e.src);
    const b = typeof e.dst === 'number' ? e.dst : cells.findIndex(c => c.id === e.dst);
    if (a === b) continue;
    ea[m] = a; eb[m] = b; m++;
  }
  const region = new Array(n), circuit = new Array(n);
  for (let i = 0; i < n; i++) { region[i] = cells[i].region || 'default'; circuit[i] = (cells[i].region || 'default') + '/' + (cells[i].circuit || 'default'); }
  const budget = new Map();
  for (const r of spec.regions || []) budget.set(r.name, r.budget);
  const pinned = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (Number.isFinite(budget.get(region[i]))) pinned[i] = 1;
  return { n, m, ea: ea.subarray(0, m), eb: eb.subarray(0, m), region, circuit, pinned, selfEdges: edges.length - m };
}

// Compressed adjacency, both directions, built once and reused by every pass.
export function adjacency(g) {
  const deg = new Int32Array(g.n + 1);
  for (let e = 0; e < g.m; e++) { deg[g.ea[e] + 1]++; deg[g.eb[e] + 1]++; }
  for (let i = 0; i < g.n; i++) deg[i + 1] += deg[i];
  const list = new Int32Array(2 * g.m), fill = deg.slice();
  for (let e = 0; e < g.m; e++) { list[fill[g.ea[e]]++] = g.eb[e]; list[fill[g.eb[e]]++] = g.ea[e]; }
  return { ptr: deg, list };
}

// ---------------------------------------------------------------- the cut
export function cutEdges(g, of) {
  let cut = 0;
  for (let e = 0; e < g.m; e++) if (of[g.ea[e]] !== of[g.eb[e]]) cut++;
  return cut;
}
export function cutFraction(g, of) { return g.m === 0 ? 0 : cutEdges(g, of) / g.m; }
export function loads(of, shards, weight = null) {
  if (!weight) {
    const l = new Int32Array(shards);
    for (let i = 0; i < of.length; i++) l[of[i]]++;
    return l;
  }
  const l = new Float64Array(shards);
  for (let i = 0; i < of.length; i++) l[of[i]] += weight[i];
  return l;
}
export function balanceOf(of, shards, weight = null) {
  const l = loads(of, shards, weight);
  let min = Infinity, max = 0, total = 0;
  for (let s = 0; s < shards; s++) { if (l[s] < min) min = l[s]; if (l[s] > max) max = l[s]; total += l[s]; }
  const ideal = total / shards;
  return { min: +min.toFixed(3), max: +max.toFixed(3), ideal: +ideal.toFixed(1), imbalance: +(max / ideal).toFixed(3), per: Array.from(l) };
}

// ---------------------------------------------------------------- weights
// A shard's tick is over when its LAST cell has run, so balancing the number of cells
// balances the wrong thing. Measured on organism/gen-0 at 32 shards with the cell count
// balanced to 1.05: the busiest shard spent 42670.1us inside its tick and the idlest 7087us,
// and the straggle (busiest minus mean) was 18113.5us of a 58379.7us tick. Two things make
// cells unequal, and both are knowable before the first tick:
//   1. how OFTEN a cell runs. core/clock.mjs runs a cell with policy.period p once every p
//      ticks, so its rate is 1/p. Periods in this organism run from 1 to 8.
//   2. how MUCH a run costs. A hypervector kind moves 8192 bytes per run where a scalar kind
//      moves one number. bench/speed.mjs --arm profile measures nanoseconds per call for
//      every kind on this machine and that table can be handed in here as kindNs.
// weight[i] is the product. With neither factor supplied every weight is 1 and every
// decision below is bit for bit the decision it was before weights existed.
export function cellWeights(cells, { kindNs = null, kindCost = null, eventRate = 1, useRate = true } = {}) {
  const w = new Float64Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    const p = c && c.policy ? (c.policy.period ?? 1) : 1;
    const rate = !useRate ? 1 : (p === 'event' ? eventRate : (typeof p === 'number' && p > 0 ? 1 / p : 1));
    const cost = kindNs ? (kindNs[c.kind] ?? kindNs.default ?? 1) : (kindCost ? (kindCost[c.kind] ?? 1) : 1);
    w[i] = rate * cost;
  }
  return w;
}

// Scale a weight vector so its mean is 1. The cap, the ideal and the imbalance then read in
// the same units as a cell count, and slack means the same thing it always meant.
export function normalizeWeights(w) {
  let sum = 0;
  for (let i = 0; i < w.length; i++) sum += w[i];
  if (sum <= 0) return new Float64Array(w.length).fill(1);
  const k = w.length / sum, out = new Float64Array(w.length);
  for (let i = 0; i < w.length; i++) out[i] = w[i] * k;
  return out;
}

// ---------------------------------------------------------------- the seed partition
// The unit is the region when there are at least as many regions as shards, and the
// region/circuit otherwise. Whole groups always stay together; the two cases differ only in
// how groups are handed to shards, and each case uses the rule that measured better on the
// organism (see the comments inside).
export function seedPartition(g, shards, { unit = 'auto', weight = null } = {}) {
  const regions = new Map();
  for (let i = 0; i < g.n; i++) { let l = regions.get(g.region[i]); if (!l) regions.set(g.region[i], l = []); l.push(i); }
  const useRegion = unit === 'region' || (unit === 'auto' && regions.size >= shards);
  const key = useRegion ? g.region : g.circuit;
  const groups = new Map();
  for (let i = 0; i < g.n; i++) { let l = groups.get(key[i]); if (!l) groups.set(key[i], l = []); l.push(i); }
  const of = new Int32Array(g.n);
  // A group's size is the number of cells in it, or the weight of those cells when a weight
  // vector is supplied. Every comparison below is on this one number.
  const size = (list) => { if (!weight) return list.length; let a = 0; for (const i of list) a += weight[i]; return a; };
  const total = weight ? size(Array.from({ length: g.n }, (_, i) => i)) : g.n;
  if (useRegion) {
    // Few groups, very unequal sizes: longest processing time. Largest group first into the
    // lightest shard, which never leaves a shard more than one group behind.
    const order = [...groups.entries()].sort((a, b) => (size(b[1]) - size(a[1])) || (a[0] < b[0] ? -1 : 1));
    const load = new Float64Array(shards);
    for (const [, list] of order) {
      let best = 0;
      for (let s = 1; s < shards; s++) if (load[s] < load[best]) best = s;
      for (const i of list) of[i] = best;
      load[best] += size(list);
    }
  } else {
    // Thousands of small groups: chunking beats bin packing here, because the groups are
    // not independent. Circuits are emitted region by region and the builder wires a
    // circuit to its index neighbours (a local window), so consecutive groups are the ones
    // that talk. Contiguous runs of groups therefore keep both the region wall and the
    // local window inside a shard. Measured at 8 shards on gen-0: contiguous chunks cut
    // 23.48% of edges where largest first bin packing cut 70.94%.
    const order = [...groups.values()];
    const target = total / shards;
    let s = 0, placed = 0;
    for (const list of order) {
      const sz = size(list);
      while (s < shards - 1 && placed + sz / 2 > (s + 1) * target) s++;
      for (const i of list) of[i] = s;
      placed += sz;
    }
  }
  return { of, unit: useRegion ? 'region' : 'region/circuit', groups: groups.size, regions: regions.size };
}

// ---------------------------------------------------------------- the refinement
// One pass walks every movable cell in index order, counts how many of its neighbours sit
// in each shard, and moves it to the best shard when the move strictly reduces the cut and
// the destination is under cap. gain = (neighbours in the destination) - (neighbours here),
// which is exactly the number of cut edges the move removes minus the number it creates.
export function refine(g, of, shards, { passes = 8, slack = 1.05, adj = null, onPass = null, weight = null } = {}) {
  const a = adj || adjacency(g);
  // The cap is in the same units as the load: cells when there is no weight vector, cell
  // weight when there is one. normalizeWeights keeps a weighted cap the same size as the
  // count cap it replaces, so slack keeps its meaning.
  let totalW = g.n;
  if (weight) { totalW = 0; for (let i = 0; i < g.n; i++) totalW += weight[i]; }
  // One formula for both, so that a weight vector of all ones is not merely close to the
  // unweighted run, it is the same arithmetic: normalizeWeights centres the mean on 1, so
  // the total weight is the cell count and the two caps are the same number.
  const cap = Math.max(1, Math.ceil((totalW / shards) * slack));
  const load = loads(of, shards, weight);
  // The seed answers to the cut, not to the cap, and a contiguous chunk of circuits can put
  // a shard over it before the first pass ever runs. The cut passes below will never move a
  // cell INTO an over cap shard, but they will never take one out either, so an over cap
  // seed stays over cap for ever. This sheds it first: every cell of an over cap shard, in
  // index order, goes to the under cap shard where it has the most neighbours (ties to the
  // lightest), until the shard is at or under the cap. It is the one step here that is
  // allowed to raise the cut, so it is counted apart from the passes and the invariant that
  // no PASS raises the cut is left standing.
  let shedMoved = 0;
  {
    const count = new Int32Array(shards), touched = new Int32Array(shards);
    for (let s = 0; s < shards; s++) {
      for (let i = 0; i < g.n && load[s] > cap; i++) {
        if (of[i] !== s || g.pinned[i]) continue;
        const wi = weight ? weight[i] : 1;
        let used = 0;
        for (let k = a.ptr[i]; k < a.ptr[i + 1]; k++) { const d = of[a.list[k]]; if (count[d] === 0) touched[used++] = d; count[d]++; }
        let best = -1, bestN = -1;
        for (let d = 0; d < shards; d++) {
          if (d === s || load[d] + wi > cap) continue;
          const nd = count[d];
          if (nd > bestN || (nd === bestN && load[d] < load[best])) { best = d; bestN = nd; }
        }
        for (let u = 0; u < used; u++) count[touched[u]] = 0;
        if (best < 0) break; // no shard under cap can hold it, so the cap is not reachable
        of[i] = best; load[s] -= wi; load[best] += wi; shedMoved++;
      }
    }
  }
  const count = new Int32Array(shards);
  const touched = new Int32Array(shards);
  const history = [];
  let movedTotal = 0;
  for (let pass = 0; pass < passes; pass++) {
    let moved = 0;
    for (let i = 0; i < g.n; i++) {
      if (g.pinned[i]) continue;
      const home = of[i], lo = a.ptr[i], hi = a.ptr[i + 1];
      if (lo === hi) continue;
      let used = 0;
      for (let k = lo; k < hi; k++) { const s = of[a.list[k]]; if (count[s] === 0) touched[used++] = s; count[s]++; }
      const here = count[home];
      let best = home, bestGain = 0;
      for (let u = 0; u < used; u++) {
        const s = touched[u];
        if (s === home) continue;
        const gain = count[s] - here;
        if (gain > bestGain && load[s] + (weight ? weight[i] : 1) <= cap) { bestGain = gain; best = s; }
      }
      for (let u = 0; u < used; u++) count[touched[u]] = 0;
      if (best !== home) { const wi = weight ? weight[i] : 1; of[i] = best; load[home] -= wi; load[best] += wi; moved++; }
    }
    movedTotal += moved;
    const row = { pass: pass + 1, moved, cut: cutEdges(g, of), cutFraction: +cutFraction(g, of).toFixed(6) };
    history.push(row);
    if (onPass) onPass(row);
    if (moved === 0) break;
  }
  return { of, cap, passes: history, moved: movedTotal, shed: shedMoved };
}

/**
 * Seed by region, then refine. The one call a bench or the CLI needs.
 * @returns {{ of: Int32Array, shards, unit, cutBefore, cutAfter, cutFractionBefore, cutFractionAfter, edges, passes, moved, balanceBefore, balanceAfter, ms }}
 */
export function partitionBrain(g, shards, opts = {}) {
  const t0 = process.hrtime.bigint();
  const seed = seedPartition(g, shards, opts);
  const cutBefore = cutEdges(g, seed.of);
  const balanceBefore = balanceOf(seed.of, shards);
  const r = refine(g, seed.of, shards, opts);
  const cutAfter = cutEdges(g, r.of);
  return {
    of: r.of, shards, unit: seed.unit, groups: seed.groups, regions: seed.regions,
    edges: g.m, selfEdges: g.selfEdges, cells: g.n,
    cutBefore, cutAfter,
    cutFractionBefore: +(g.m ? cutBefore / g.m : 0).toFixed(6),
    cutFractionAfter: +(g.m ? cutAfter / g.m : 0).toFixed(6),
    reduction: cutBefore === 0 ? 0 : +(1 - cutAfter / cutBefore).toFixed(4),
    passes: r.passes, moved: r.moved, shed: r.shed, cap: r.cap,
    balanceBefore, balanceAfter: balanceOf(r.of, shards),
    // When a weight vector is in play, the cell count balance is no longer the balance that
    // matters, so both are reported: the count one for continuity, the weight one because
    // it is the one a shard's tick length follows.
    weighted: opts.weight ? { before: balanceOf(seed.of, shards, opts.weight), after: balanceOf(r.of, shards, opts.weight) } : null,
    ms: +(Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1),
  };
}

// A round robin over cells, the partition a runtime with no structural information would
// use. Kept here so a bench can print what the region seed is being compared against.
export function stripedPartition(n, shards) {
  const of = new Int32Array(n);
  for (let i = 0; i < n; i++) of[i] = i % shards;
  return of;
}

// ---------------------------------------------------------------- as a program
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

export function reportLines(r) {
  const out = [];
  out.push(`cells=${r.cells} edges=${r.edges} selfEdges=${r.selfEdges} shards=${r.shards} unit=${r.unit} groups=${r.groups} regions=${r.regions} cap=${r.cap}`);
  out.push(`cut BEFORE refinement: ${r.cutBefore} of ${r.edges} edges = ${(100 * r.cutFractionBefore).toFixed(2)}% imbalance=${r.balanceBefore.imbalance}`);
  for (const p of r.passes) out.push(`  pass ${p.pass}: moved=${p.moved} cut=${p.cut} = ${(100 * p.cutFraction).toFixed(2)}%`);
  out.push(`cut AFTER  refinement: ${r.cutAfter} of ${r.edges} edges = ${(100 * r.cutFractionAfter).toFixed(2)}% imbalance=${r.balanceAfter.imbalance} moved=${r.moved} in ${r.ms}ms`);
  out.push(`reduction: ${(100 * r.reduction).toFixed(2)}% fewer cut edges`);
  return out;
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt; };
  const shardList = String(arg('shards', '8')).split(',').map(Number);
  const passes = Number(arg('passes', 8));
  const slack = Number(arg('slack', 1.05));
  const organism = arg('organism', null);
  const relay = Number(arg('relay', 0));

  let g;
  if (organism) {
    const dir = path.isAbsolute(organism) ? organism : path.join(ROOT, organism);
    if (!existsSync(path.join(dir, 'index.mjs'))) throw new Error('no organism at ' + dir);
    const { loadFrom } = await import(pathToFileURL(path.join(ROOT, 'genome/load.mjs')).href);
    const { brain } = await loadFrom(dir);
    g = graphFromBrain(brain);
    console.log('organism ' + path.relative(ROOT, dir).replaceAll('\\', '/'));
  } else if (relay) {
    const { relaySpec } = await import(pathToFileURL(path.join(ROOT, 'bench/parallel.mjs')).href);
    g = graphFromSpec({ ...relaySpec({ cells: relay }), regions: [] });
    console.log('relay ' + relay + ' cells');
  } else {
    console.log('usage: node runtime/partition.mjs --organism organism/gen-0 --shards 8[,16] [--passes 8] [--slack 1.05]');
    return;
  }

  const results = [];
  for (const shards of shardList) {
    const r = partitionBrain(g, shards, { passes, slack });
    for (const line of reportLines(r)) console.log(line);
    const striped = stripedPartition(g.n, shards);
    console.log(`striped (round robin) control at ${shards} shards: cut ${cutEdges(g, striped)} = ${(100 * cutFraction(g, striped)).toFixed(2)}%`);
    results.push({ ...r, of: undefined, stripedCut: cutEdges(g, striped), stripedCutFraction: +cutFraction(g, striped).toFixed(6) });
  }
  mkdirSync(path.join(ROOT, 'bench/verdicts'), { recursive: true });
  writeFileSync(path.join(ROOT, 'bench/verdicts/partition.json'), JSON.stringify({ at: new Date().toISOString(), node: process.version, source: organism || ('relay' + relay), passes, slack, results }, null, 2));
  console.log('wrote bench/verdicts/partition.json');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e); process.exitCode = 1; });
}

