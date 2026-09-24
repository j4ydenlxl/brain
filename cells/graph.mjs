// cells/graph.mjs: GRAPH cells. Each kind accumulates its own directed adjacency from an
// event { from, to, w? } edge stream (self-contained, like every other cell: state lives
// in the cell, cells talk only through ports) and answers a query/run trigger exactly.
// Importing this module registers the kinds; it never edits core/* or the other libraries.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';

const first = (mail) => (mail.length ? mail[mail.length - 1].sig : null);

function newGraphState() { return { adj: new Map(), nodes: new Set() }; }
function toW(w) { if (w == null) return S.rat(1n); return (typeof w === 'object') ? w : S.ratFromDecimal(String(w)); }
function addEdge(state, data) {
  const { from, to } = data;
  const w = toW(data.w);
  state.nodes.add(from); state.nodes.add(to);
  let m = state.adj.get(from);
  if (!m) { m = new Map(); state.adj.set(from, m); }
  m.set(to, w);
  return w;
}
function serializeAdj(state) { return { nodes: [...state.nodes], adj: [...state.adj].map(([k, m]) => [k, [...m].map(([t, w]) => [t, S.numToJSON(w)])]) }; }
function deserializeAdj(j) { return { nodes: new Set(j.nodes), adj: new Map(j.adj.map(([k, m]) => [k, new Map(m.map(([t, w]) => [t, S.numFromJSON(w)]))])) }; }

// ---------------------------------------------------------------- graph.build
defineKind('graph.build', {
  doc: 'Accumulates directed edges from event { from, to, w? } into an adjacency held in state (exact rational weight, default 1; the latest w for a given from->to pair wins). Emits the running distinct-edge count as num.',
  ports: { in: [{ name: 'edge', kinds: ['event'] }], out: [{ name: 'count', kinds: ['num'] }] },
  init: () => ({ ...newGraphState(), edgeCount: 0 }),
  compute: (ins, cell) => {
    let touched = false;
    for (const it of ins[0]) {
      const { from, to } = it.sig.data;
      const m = cell.state.adj.get(from);
      if (!m || !m.has(to)) cell.state.edgeCount++;
      addEdge(cell.state, it.sig.data);
      touched = true;
    }
    if (!touched) return [null];
    return [{ kind: 'num', data: S.int(cell.state.edgeCount) }];
  },
  serialize: (s) => ({ ...serializeAdj(s), edgeCount: s.edgeCount }),
  deserialize: (j) => ({ ...deserializeAdj(j), edgeCount: j.edgeCount }),
});

// ---------------------------------------------------------------- graph.bfs
defineKind('graph.bfs', {
  doc: 'Builds a directed adjacency from event { from, to } edges. A query event { from, to } emits the shortest path by hop count exactly: { found: true, path, hops } or { found: false, from, to }.',
  ports: { in: [{ name: 'edge', kinds: ['event'] }, { name: 'query', kinds: ['event'] }], out: [{ name: 'result', kinds: ['event'] }] },
  init: newGraphState,
  compute: (ins, cell) => {
    for (const it of ins[0]) addEdge(cell.state, it.sig.data);
    const q = first(ins[1]); if (!q) return [null];
    const { from, to } = q.data;
    if (from === to) return [{ kind: 'event', data: { found: true, path: [from], hops: 0 } }];
    const prev = new Map(), visited = new Set([from]), queue = [from];
    let head = 0, found = false;
    while (head < queue.length && !found) {
      const u = queue[head++];
      const m = cell.state.adj.get(u);
      if (!m) continue;
      for (const v of m.keys()) {
        if (visited.has(v)) continue;
        visited.add(v); prev.set(v, u);
        if (v === to) { found = true; break; }
        queue.push(v);
      }
    }
    if (!found) return [{ kind: 'event', data: { found: false, from, to } }];
    const path = [to]; let cur = to;
    while (cur !== from) { cur = prev.get(cur); path.push(cur); }
    path.reverse();
    return [{ kind: 'event', data: { found: true, path, hops: path.length - 1 } }];
  },
  serialize: serializeAdj,
  deserialize: deserializeAdj,
});

// ---------------------------------------------------------------- graph.dijkstra
defineKind('graph.dijkstra', {
  doc: 'Builds a directed weighted adjacency from event { from, to, w? } edges (exact rational weights, default 1, assumed non-negative). A query event { from, to } emits the exact shortest-path distance and path: { found: true, path, distance } or { found: false, from, to }.',
  ports: { in: [{ name: 'edge', kinds: ['event'] }, { name: 'query', kinds: ['event'] }], out: [{ name: 'result', kinds: ['event'] }] },
  init: newGraphState,
  compute: (ins, cell) => {
    for (const it of ins[0]) addEdge(cell.state, it.sig.data);
    const q = first(ins[1]); if (!q) return [null];
    const { from, to } = q.data;
    const dist = new Map([[from, S.rat(0n)]]), prev = new Map(), visited = new Set();
    for (;;) {
      let u = null, best = null;
      for (const n of cell.state.nodes) {
        if (visited.has(n) || !dist.has(n)) continue;
        const d = dist.get(n);
        if (best === null || S.ratCmp(d, best) < 0) { best = d; u = n; }
      }
      if (u === null) break;
      visited.add(u);
      if (u === to) break;
      const m = cell.state.adj.get(u);
      if (m) for (const [v, w] of m) {
        if (visited.has(v)) continue;
        const nd = S.ratAdd(dist.get(u), w);
        if (!dist.has(v) || S.ratCmp(nd, dist.get(v)) < 0) { dist.set(v, nd); prev.set(v, u); }
      }
    }
    if (!dist.has(to)) return [{ kind: 'event', data: { found: false, from, to } }];
    const path = [to]; let cur = to;
    while (cur !== from) { cur = prev.get(cur); path.push(cur); }
    path.reverse();
    return [{ kind: 'event', data: { found: true, path, distance: S.ratToString(dist.get(to)) } }];
  },
  serialize: serializeAdj,
  deserialize: deserializeAdj,
});

// ---------------------------------------------------------------- graph.pagerank
defineKind('graph.pagerank', {
  doc: 'Builds a directed adjacency from event { from, to } edges (unweighted out-links). A run event triggers params.iterations power-iteration steps of PageRank (params.damping, default 0.85; dangling nodes redistribute evenly) over the current graph, emitted as a vec indexed by first-seen node order (also readable at full double precision from cell.state.lastRank / cell.state.lastNodes).',
  ports: { in: [{ name: 'edge', kinds: ['event'] }, { name: 'run', kinds: ['event'] }], out: [{ name: 'rank', kinds: ['vec'] }] },
  defaults: { iterations: 50, damping: 0.85 },
  init: () => ({ ...newGraphState(), lastRank: null, lastNodes: null }),
  compute: (ins, cell) => {
    for (const it of ins[0]) addEdge(cell.state, it.sig.data);
    if (!ins[1].length) return [null];
    const nodes = [...cell.state.nodes];
    const n = nodes.length;
    if (!n) return [null];
    const idx = new Map(nodes.map((v, i) => [v, i]));
    const d = cell.params.damping;
    let r = new Float64Array(n).fill(1 / n);
    for (let iter = 0; iter < cell.params.iterations; iter++) {
      const next = new Float64Array(n).fill((1 - d) / n);
      for (let i = 0; i < n; i++) {
        const u = nodes[i], m = cell.state.adj.get(u), outDeg = m ? m.size : 0;
        if (!outDeg) { const share = d * r[i] / n; for (let j = 0; j < n; j++) next[j] += share; continue; }
        const share = d * r[i] / outDeg;
        for (const v of m.keys()) next[idx.get(v)] += share;
      }
      r = next;
    }
    cell.state.lastRank = Array.from(r); cell.state.lastNodes = nodes;
    return [{ kind: 'vec', data: Float32Array.from(r) }];
  },
  serialize: (s) => ({ ...serializeAdj(s), lastRank: s.lastRank, lastNodes: s.lastNodes }),
  deserialize: (j) => ({ ...deserializeAdj(j), lastRank: j.lastRank || null, lastNodes: j.lastNodes || null }),
});

// ---------------------------------------------------------------- graph.components
function addUndirected(map, a, b) { let s = map.get(a); if (!s) { s = new Set(); map.set(a, s); } s.add(b); }
defineKind('graph.components', {
  doc: 'Builds an adjacency from event { from, to } edges, treated as undirected for connectivity. A run event emits the connected-component count and a node->component label map via union-find: { count, labels }.',
  ports: { in: [{ name: 'edge', kinds: ['event'] }, { name: 'run', kinds: ['event'] }], out: [{ name: 'result', kinds: ['event'] }] },
  init: () => ({ nodes: new Set(), undirected: new Map() }),
  compute: (ins, cell) => {
    for (const it of ins[0]) {
      const { from, to } = it.sig.data;
      cell.state.nodes.add(from); cell.state.nodes.add(to);
      addUndirected(cell.state.undirected, from, to);
      addUndirected(cell.state.undirected, to, from);
    }
    if (!ins[1].length) return [null];
    const nodes = [...cell.state.nodes];
    const parent = new Map(nodes.map(n => [n, n]));
    const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
    for (const [u, set] of cell.state.undirected) for (const v of set) union(u, v);
    const labels = {}, roots = new Map();
    for (const n of nodes) { const r = find(n); if (!roots.has(r)) roots.set(r, roots.size); labels[n] = roots.get(r); }
    return [{ kind: 'event', data: { count: roots.size, labels } }];
  },
  serialize: (s) => ({ nodes: [...s.nodes], undirected: [...s.undirected].map(([k, set]) => [k, [...set]]) }),
  deserialize: (j) => ({ nodes: new Set(j.nodes), undirected: new Map(j.undirected.map(([k, arr]) => [k, new Set(arr)])) }),
});

// ---------------------------------------------------------------- graph.match
defineKind('graph.match', {
  doc: 'Builds a directed adjacency from event { from, to } edges. params.pattern = { nodes: [...], edges: [[a,b],...] }, at most 5 pattern nodes. A run event finds every injective embedding of the pattern into the built graph (each pattern edge must exist as a host edge, in that direction) and emits { count, embedding } (one example embedding, pattern node -> host node).',
  ports: { in: [{ name: 'edge', kinds: ['event'] }, { name: 'run', kinds: ['event'] }], out: [{ name: 'result', kinds: ['event'] }] },
  defaults: { pattern: { nodes: [], edges: [] } },
  init: newGraphState,
  compute: (ins, cell) => {
    for (const it of ins[0]) addEdge(cell.state, it.sig.data);
    if (!ins[1].length) return [null];
    const pat = cell.params.pattern;
    if (pat.nodes.length > 5) throw new Error('graph.match: pattern limited to 5 nodes, got ' + pat.nodes.length);
    const hostNodes = [...cell.state.nodes];
    const hasEdge = (a, b) => { const m = cell.state.adj.get(a); return !!(m && m.has(b)); };
    let count = 0, example = null;
    const assign = new Map(), used = new Set();
    (function backtrack(i) {
      if (i === pat.nodes.length) { count++; if (!example) example = Object.fromEntries(assign); return; }
      const pnode = pat.nodes[i];
      for (const hnode of hostNodes) {
        if (used.has(hnode)) continue;
        let ok = true;
        for (const [a, b] of pat.edges) {
          if (a === pnode && assign.has(b) && !hasEdge(hnode, assign.get(b))) { ok = false; break; }
          if (b === pnode && assign.has(a) && !hasEdge(assign.get(a), hnode)) { ok = false; break; }
        }
        if (!ok) continue;
        assign.set(pnode, hnode); used.add(hnode);
        backtrack(i + 1);
        assign.delete(pnode); used.delete(hnode);
      }
    })(0);
    return [{ kind: 'event', data: { count, embedding: example } }];
  },
  serialize: serializeAdj,
  deserialize: deserializeAdj,
});
