// generations/crossover.mjs: RECOMBINATION by innovation number. Two genomes are lined
// up gene by gene on their innovation numbers. Where both parents have the same number the
// gene is matching and the child takes one at random. Genes the fitter parent has and the
// other does not are disjoint (inside the other parent's range) or excess (past it); both
// come from the fitter parent only, so the child inherits a structure that exists.
import { createGenome, cellById } from './genome.mjs';

// Split the union of innovation numbers into the three NEAT classes.
export function align(aGenes, bGenes) {
  const A = new Map(aGenes.map((g) => [g.innov, g]));
  const B = new Map(bGenes.map((g) => [g.innov, g]));
  const maxA = aGenes.length ? Math.max(...aGenes.map((g) => g.innov)) : 0;
  const maxB = bGenes.length ? Math.max(...bGenes.map((g) => g.innov)) : 0;
  const matching = [], disjoint = [], excess = [];
  for (const [n, g] of A) {
    if (B.has(n)) { matching.push([g, B.get(n)]); continue; }
    (n > maxB ? excess : disjoint).push(['a', g]);
  }
  for (const [n, g] of B) {
    if (A.has(n)) continue;
    (n > maxA ? excess : disjoint).push(['b', g]);
  }
  matching.sort((x, y) => x[0].innov - y[0].innov);
  disjoint.sort((x, y) => x[1].innov - y[1].innov);
  excess.sort((x, y) => x[1].innov - y[1].innov);
  return { matching, disjoint, excess, maxA, maxB };
}

// fitA / fitB decide which parent is the fitter. A tie goes to the smaller genome, which
// is the usual NEAT tie break and keeps bloat down.
export function fitter(a, b, fitA, fitB) {
  if (fitA > fitB) return 'a';
  if (fitB > fitA) return 'b';
  return a.edges.length <= b.edges.length ? 'a' : 'b';
}

export function crossover(a, b, { rng, fitA = 0, fitB = 0, id = null, disabledCarry = 0.75 }) {
  const which = fitter(a, b, fitA, fitB);
  const strong = which === 'a' ? a : b;
  const weak = which === 'a' ? b : a;

  // cells: matching cell genes take either parent's params; the fitter parent's extra
  // cells always come along, so every edge it contributes has its endpoints.
  const cells = [];
  const cellAlign = align(strong.cells, weak.cells);
  for (const [s, w] of cellAlign.matching) {
    const pick = rng.next() < 0.5 ? s : w;
    // the interface flags always come from the fitter parent, never from the coin flip
    cells.push({ ...pick, params: { ...pick.params }, lock: [...(s.lock || [])], fixed: s.fixed, role: s.role, period: s.fixed ? s.period : pick.period });
  }
  // align() labels genes by the position it was handed them in, and it is always handed
  // the fitter parent first, so the fitter parent's side is always 'a'.
  for (const [side, g] of [...cellAlign.disjoint, ...cellAlign.excess]) {
    if (side === 'a') cells.push({ ...g, params: { ...g.params }, lock: [...(g.lock || [])] });
  }
  const haveCell = new Set(cells.map((c) => c.id));

  // edges: matching genes from either parent, disjoint and excess from the fitter only.
  const edges = [];
  const edgeAlign = align(strong.edges, weak.edges);
  for (const [s, w] of edgeAlign.matching) {
    const pick = rng.next() < 0.5 ? s : w;
    const e = { ...pick };
    // NEAT: if either parent had the gene disabled, the child usually keeps it disabled.
    if (!s.enabled || !w.enabled) e.enabled = rng.next() >= disabledCarry;
    edges.push(e);
  }
  for (const [side, g] of [...edgeAlign.disjoint, ...edgeAlign.excess]) {
    if (side === 'a') edges.push({ ...g });
  }

  // A matching edge taken from the weak parent can name a cell the child did not inherit
  // (the weak parent had it, the fitter did not). Pull that cell in rather than drop the
  // edge, so the child is always instantiable.
  for (const e of edges) {
    for (const id2 of [e.src, e.dst]) {
      if (haveCell.has(id2)) continue;
      const donor = cellById(strong, id2) || cellById(weak, id2);
      if (donor) { cells.push({ ...donor, params: { ...donor.params }, lock: [...(donor.lock || [])] }); haveCell.add(id2); }
    }
  }
  const kept = edges.filter((e) => haveCell.has(e.src) && haveCell.has(e.dst));

  return createGenome({
    id: id || strong.id + 'x' + weak.id,
    cells, edges: kept,
    meta: { parents: [a.id, b.id], gen: Math.max(a.meta.gen || 0, b.meta.gen || 0) + 1, mutations: [], island: strong.meta.island ?? 0 },
  });
}
