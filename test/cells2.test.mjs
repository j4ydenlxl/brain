import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Brain } from '../core/brain.mjs';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';
import '../cells/index.mjs';

// ---------------------------------------------------------------- test harness
// Every kind here is driven through a real Brain: addCell, inject or connect, tick,
// then read the answer from takeOutbox() (a signal with no outgoing edge lands there
// the same tick it is emitted) or, where float32 would lose precision, from cell state.
function mkBrain(opts = {}) { return new Brain({ name: 'cells2-test', seed: 'cells2-test', ledger: 'off', ...opts }); }

// ================================================================== cells/sequence.mjs

test('ngram.predict: exact bigram counts pick the majority next token with its exact fraction', () => {
  const b = mkBrain();
  b.addCell({ id: 'ng', kind: 'ngram.predict', params: { n: 2 } });
  const tokens = ['a', 'b', 'a', 'b', 'a', 'c', 'a', 'b'];
  let captured = null;
  for (let i = 0; i < tokens.length; i++) {
    b.inject('ng', 'in', { kind: 'event', data: { token: tokens[i] } });
    b.tick();
    const out = b.takeOutbox();
    if (i === 6) captured = out; // context is now 'a', seen after 'a'->b twice and 'a'->c once
  }
  assert.equal(captured.length, 2, 'both the token and prob ports fired');
  const tokenSig = captured.find(s => s.kind === 'event'), probSig = captured.find(s => s.kind === 'num');
  assert.deepEqual(tokenSig.data, { token: 'b', count: 2, total: 3 });
  assert.equal(S.ratToString(probSig.data), '2/3', 'exact rational, not a float approximation');
});

test('markov.chain: transition counts are exact and sampling from a state is deterministic under the seed', () => {
  const stream = ['x', 'y', 'x', 'y', 'x', 'y', 'x', 'z']; // x->y x3, x->z x1, y->x x3
  function draws(seed) {
    const b = mkBrain({ seed });
    b.addCell({ id: 'mk', kind: 'markov.chain' });
    for (const tok of stream) { b.inject('mk', 'in', { kind: 'event', data: { token: tok } }); b.tick(); b.takeOutbox(); }
    const out = [];
    for (let i = 0; i < 20; i++) {
      b.inject('mk', 'sample', { kind: 'event', data: { from: 'x' } });
      b.tick();
      const [sig] = b.takeOutbox();
      out.push(sig.data.to);
    }
    return out;
  }
  const run1 = draws('markov-seed-7'), run2 = draws('markov-seed-7');
  assert.deepEqual(run1, run2, 'same seed draws the identical sequence from the same counts');
  assert.equal(run1.length, 20);
  assert.ok(run1.every(t => t === 'y' || t === 'z'), 'only tokens ever seen after x are drawn');

  const b = mkBrain({ seed: 'markov-check' });
  b.addCell({ id: 'mk2', kind: 'markov.chain' });
  let lastTrans = null;
  for (const tok of stream) { b.inject('mk2', 'in', { kind: 'event', data: { token: tok } }); b.tick(); const o = b.takeOutbox(); if (o.length) lastTrans = o[0].data; }
  assert.deepEqual(lastTrans, { from: 'x', to: 'z', count: 1, total: 4 }, 'exact transition count on the last hop');
});

test('hmm.viterbi: exact best path recovers hidden states from deterministic emissions', () => {
  const b = mkBrain();
  b.addCell({
    id: 'hmm', kind: 'hmm.viterbi', params: {
      window: 3,
      states: ['A', 'B'],
      init: { A: '1/2', B: '1/2' },
      transitions: { A: { A: '1/2', B: '1/2' }, B: { A: '1/2', B: '1/2' } },
      emissions: { A: { x: '1', y: '0' }, B: { x: '0', y: '1' } },
    },
  });
  const obs = ['x', 'y', 'x'];
  let result = null;
  for (const sym of obs) { b.inject('hmm', 'obs', { kind: 'event', data: { symbol: sym } }); b.tick(); const o = b.takeOutbox(); if (o.length) result = o[0].data; }
  assert.deepEqual(result.path, ['A', 'B', 'A'], 'only this hidden path can emit x,y,x under zero/one emissions');
  assert.deepEqual(result.obs, ['x', 'y', 'x']);
});

test('delta.coder: encode then decode round-trips 1000 random exact rationals', () => {
  const b = mkBrain();
  b.addCell({ id: 'enc', kind: 'delta.coder', params: { mode: 'encode' } });
  b.addCell({ id: 'dec', kind: 'delta.coder', params: { mode: 'decode' } });
  b.connect('enc', 'out', 'dec', 'in');
  const rng = new RNG('delta-coder-values');
  const values = [];
  for (let i = 0; i < 1000; i++) values.push(S.rat(BigInt(rng.int(2001) - 1000), BigInt(rng.int(50) + 1)));
  const results = [];
  for (const v of values) {
    b.inject('enc', 'in', { kind: 'num', data: v });
    b.tick();
    for (const sig of b.takeOutbox()) results.push(sig.data);
  }
  b.tick(); // the encoder's last delta was still in flight (one tick of edge travel)
  for (const sig of b.takeOutbox()) results.push(sig.data);
  assert.equal(results.length, 1000);
  for (let i = 0; i < 1000; i++) assert.ok(S.ratEq(results[i], values[i]), 'index ' + i + ': got ' + S.ratToString(results[i]) + ', wanted ' + S.ratToString(values[i]));
});

test('runlength.coder: encode then decode round-trips 1000 random nums exactly', () => {
  const b = mkBrain();
  b.addCell({ id: 'renc', kind: 'runlength.coder', params: { mode: 'encode' } });
  b.addCell({ id: 'rdec', kind: 'runlength.coder', params: { mode: 'decode' } });
  b.connect('renc', 'out', 'rdec', 'in');
  const rng = new RNG('rle-values');
  const values = [];
  for (let i = 0; i < 1000; i++) values.push(rng.int(10)); // a small domain so runs actually form
  const results = [];
  for (const v of values) {
    b.inject('renc', 'in', { kind: 'num', data: S.int(v) });
    b.tick();
    for (const sig of b.takeOutbox()) results.push(sig.data);
  }
  b.inject('renc', 'flush', { kind: 'event', data: {} });
  b.tick();
  for (const sig of b.takeOutbox()) results.push(sig.data);
  let guard = 0;
  while (results.length < 1000 && guard < 5000) { b.tick(); for (const sig of b.takeOutbox()) results.push(sig.data); guard++; }
  assert.equal(results.length, 1000, 'recovered exactly 1000 values (drain took ' + guard + ' extra ticks)');
  for (let i = 0; i < 1000; i++) assert.ok(S.ratEq(results[i], S.int(values[i])), 'index ' + i);
});

test('sequence.align: Needleman-Wunsch finds the exact optimal integer score and gap placement', () => {
  const b = mkBrain();
  b.addCell({ id: 'al', kind: 'sequence.align' }); // defaults: match 1, mismatch -1, gap -2
  b.inject('al', 'a', { kind: 'event', data: { tokens: ['a', 'b', 'c'] } });
  b.inject('al', 'b', { kind: 'event', data: { tokens: ['a', 'c'] } });
  b.tick();
  const [sig] = b.takeOutbox();
  assert.equal(sig.data.score, 0, 'a-a match(+1) + b-vs-gap(-2) + c-c match(+1) beats a-a + b-c mismatch(-1)');
  assert.deepEqual(sig.data.a, ['a', 'b', 'c']);
  assert.deepEqual(sig.data.b, ['a', null, 'c']);
});

test('pattern.detect: finds the shortest repeating period, not a longer one that also fits', () => {
  const b = mkBrain();
  b.addCell({ id: 'pd', kind: 'pattern.detect' });
  const stream = ['a', 'b', 'c', 'a', 'b', 'c'];
  let result = null;
  for (let i = 0; i < stream.length; i++) {
    b.inject('pd', 'in', { kind: 'event', data: { token: stream[i] } });
    b.tick();
    const o = b.takeOutbox();
    if (i === 4) assert.equal(o.length, 0, 'no full repeat visible yet after 5 tokens');
    if (o.length) result = o[0].data;
  }
  assert.deepEqual(result, { period: 3, pattern: ['a', 'b', 'c'] });
});

// ================================================================== cells/graph.mjs

test('graph.build: counts distinct directed edges exactly, a repeated pair does not double count', () => {
  const b = mkBrain();
  b.addCell({ id: 'gb', kind: 'graph.build' });
  const edges = [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'B'], ['C', 'D']];
  let lastCount = null;
  for (const [from, to] of edges) { b.inject('gb', 'edge', { kind: 'event', data: { from, to } }); b.tick(); const o = b.takeOutbox(); if (o.length) lastCount = o[0].data; }
  assert.equal(S.ratToString(lastCount), '4', '5 edges, one repeat, 4 distinct pairs');
});

test('graph.bfs: shortest hop path is preferred over a longer route to the same target', () => {
  const b = mkBrain();
  b.addCell({ id: 'gf', kind: 'graph.bfs' });
  const edges = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['A', 'E'], ['E', 'D']]; // A-B-C-D is 3 hops, A-E-D is 2
  for (const [from, to] of edges) b.inject('gf', 'edge', { kind: 'event', data: { from, to } });
  b.inject('gf', 'query', { kind: 'event', data: { from: 'A', to: 'D' } });
  b.tick();
  const [sig] = b.takeOutbox();
  assert.deepEqual(sig.data, { found: true, path: ['A', 'E', 'D'], hops: 2 });
});

test('graph.dijkstra: exact shortest weighted distance beats a shorter-hop but costlier route', () => {
  const b = mkBrain();
  b.addCell({ id: 'gd', kind: 'graph.dijkstra' });
  const edges = [['A', 'B', '1'], ['B', 'C', '2'], ['A', 'C', '10'], ['C', 'D', '1']];
  for (const [from, to, w] of edges) b.inject('gd', 'edge', { kind: 'event', data: { from, to, w } });
  b.inject('gd', 'query', { kind: 'event', data: { from: 'A', to: 'D' } });
  b.tick();
  const [sig] = b.takeOutbox();
  assert.deepEqual(sig.data, { found: true, path: ['A', 'B', 'C', 'D'], distance: '4' }, 'A-B-C-D (1+2+1=4) beats the direct A-C-D (10+1=11)');
});

test('graph.pagerank: converged ranks sum to 1 and match an independently computed power iteration to 1e-9', () => {
  const b = mkBrain();
  b.addCell({ id: 'pr', kind: 'graph.pagerank', params: { iterations: 200, damping: 0.85 } });
  const edges = [['A', 'B'], ['B', 'C'], ['C', 'A'], ['C', 'D']]; // D is a dangling sink
  for (const [from, to] of edges) b.inject('pr', 'edge', { kind: 'event', data: { from, to } });
  b.inject('pr', 'run', { kind: 'event', data: {} });
  b.tick();
  const cell = b.cell('pr');
  const nodes = cell.state.lastNodes, rank = cell.state.lastRank;
  assert.equal(nodes.length, 4);
  const sum = rank.reduce((a, x) => a + x, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, 'ranks sum to 1, got ' + sum);

  // Independent reference: the same power-iteration definition, computed fresh in the test.
  function referencePagerank(nodeList, edgeList, iterations, damping) {
    const idx = new Map(nodeList.map((v, i) => [v, i]));
    const out = nodeList.map(() => new Map());
    for (const [from, to] of edgeList) out[idx.get(from)].set(to, true);
    let r = new Float64Array(nodeList.length).fill(1 / nodeList.length);
    for (let iter = 0; iter < iterations; iter++) {
      const next = new Float64Array(nodeList.length).fill((1 - damping) / nodeList.length);
      for (let i = 0; i < nodeList.length; i++) {
        const m = out[i], deg = m.size;
        if (!deg) { const share = damping * r[i] / nodeList.length; for (let j = 0; j < nodeList.length; j++) next[j] += share; continue; }
        const share = damping * r[i] / deg;
        for (const v of m.keys()) next[idx.get(v)] += share;
      }
      r = next;
    }
    return r;
  }
  const ref = referencePagerank(nodes, edges, 200, 0.85);
  for (let i = 0; i < nodes.length; i++) assert.ok(Math.abs(ref[i] - rank[i]) < 1e-9, nodes[i] + ': ref ' + ref[i] + ' vs cell ' + rank[i]);
});

test('graph.components: two connected clusters plus an isolated node give three components', () => {
  const b = mkBrain();
  b.addCell({ id: 'gc', kind: 'graph.components' });
  const edges = [['A', 'B'], ['B', 'C'], ['D', 'E'], ['F', 'F']]; // F-F just registers F with no other neighbor
  for (const [from, to] of edges) b.inject('gc', 'edge', { kind: 'event', data: { from, to } });
  b.inject('gc', 'run', { kind: 'event', data: {} });
  b.tick();
  const [sig] = b.takeOutbox();
  assert.equal(sig.data.count, 3);
  const L = sig.data.labels;
  assert.equal(L.A, L.B); assert.equal(L.B, L.C);
  assert.equal(L.D, L.E);
  assert.notEqual(L.F, L.A); assert.notEqual(L.F, L.D);
});

test('graph.match: every directed edge is an embedding of a 2-node pattern edge', () => {
  const b = mkBrain();
  b.addCell({ id: 'gm', kind: 'graph.match', params: { pattern: { nodes: ['p1', 'p2'], edges: [['p1', 'p2']] } } });
  const edges = [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D']];
  for (const [from, to] of edges) b.inject('gm', 'edge', { kind: 'event', data: { from, to } });
  b.inject('gm', 'run', { kind: 'event', data: {} });
  b.tick();
  const [sig] = b.takeOutbox();
  assert.equal(sig.data.count, 4, 'one embedding per directed host edge, none spurious');
  const e = sig.data.embedding;
  assert.ok(edges.some(([f, t]) => f === e.p1 && t === e.p2), 'the example embedding is a real host edge');
});
