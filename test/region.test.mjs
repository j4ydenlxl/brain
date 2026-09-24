// test/region.test.mjs: act/region.mjs, the ask region, where the model is a cell.
//
// Nothing here reaches the internet and nothing here probes the real ollama: every question
// is asked with provider 'null' (the deterministic offline provider, no socket at all) apart
// from the deadline test, which points act/llm.mjs at a node:http server this file starts on
// 127.0.0.1 and closes again.
//
// The two claims worth reading are the last two. THE DEADLINE: a completion that lands after
// the call returned is not an answer, tested against a fixture that answers /api/tags so the
// probe passes and then never answers /api/generate at all, so the only thing that can end
// the question is the deadline. THE PARITY: the same thirty seeded prompts are asked twice,
// once through act/prompt.mjs answering in one call and once through the five cells, and the
// two routes are graded against each other rather than against a hand written expectation,
// so the route can only pass by agreeing with the thing it replaced.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Brain } from '../core/brain.mjs';
import { bundle, hvFromSeed } from '../core/signal.mjs';
import { attachMemory } from '../memory/index.mjs';
import { ask, keywords } from '../act/prompt.mjs';
import { resetProbeCache } from '../act/llm.mjs';
import {
  ASK_CELLS, ASK_CONDUITS, ASK_REGION, askSuiteItems, askThroughRegion, installAskRegion,
} from '../act/region.mjs';

function brainWithMemory(name) {
  const brain = new Brain({ name, ledger: 'off', pruneEvery: 0 });
  attachMemory(brain, { name });
  return brain;
}

// A fact in the episodic tier, written the way the tier itself is written: a bundled key over
// the words, the words as items, the text as the value. The same helper test/act-prompt.test.mjs
// uses, so the two routes are asked of the same shape of memory.
function remember(brain, text, t = 0) {
  const items = keywords(text, { max: 24, min: 3 });
  const key = bundle(items.map((w) => hvFromSeed('word:' + w)));
  return brain.memory.episodic.append({ key, value: { text, origin: 'self' }, items, t });
}

// A fixture ollama: the probe path answers, the completion path never does. The socket is
// unref'd and the server is closed by t.after, so a hanging request cannot hold the process.
async function startHangingOllama(t) {
  const state = { tags: 0, generate: 0, open: [] };
  const server = http.createServer((req, res) => {
    const url = String(req.url || '');
    if (url.startsWith('/api/tags')) {
      state.tags++;
      const text = JSON.stringify({ models: [{ name: 'fixture' }] });
      res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
      return res.end(text);
    }
    state.generate++;
    state.open.push(res); // held open on purpose: this request is never answered
  });
  server.on('connection', (s) => s.unref());
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  t.after(() => new Promise((resolve) => {
    for (const res of state.open) { try { res.destroy(); } catch { /* already gone */ } }
    server.close(resolve);
  }));
  return { state, base: 'http://127.0.0.1:' + port };
}

// ---------------------------------------------------------------- install
test('install is idempotent: the second call adds no cell and no conduit', () => {
  const brain = brainWithMemory('region-install');
  const before = { cells: brain.cells.length, edges: brain.connectome.size() };
  const first = installAskRegion(brain);
  const after1 = { cells: brain.cells.length, edges: brain.connectome.size() };
  const second = installAskRegion(brain);
  const after2 = { cells: brain.cells.length, edges: brain.connectome.size() };
  console.log('install: cells ' + before.cells + ' -> ' + after1.cells + ' -> ' + after2.cells
    + ', edges ' + before.edges + ' -> ' + after1.edges + ' -> ' + after2.edges
    + ', added ' + first.added.cells + ' cells and ' + first.added.edges + ' edges, second call added '
    + second.added.cells + ' cells and ' + second.added.edges + ' edges');
  assert.equal(first.installed, true);
  assert.equal(second.installed, false);
  assert.equal(first.added.cells, ASK_CELLS.length);
  assert.equal(first.added.edges, ASK_CONDUITS.length);
  assert.deepEqual(after2, after1);
  assert.equal(brain.regions.has(ASK_REGION), true);
  for (const id of ASK_CELLS) assert.equal(brain.cell(id).region, ASK_REGION);
});

// ---------------------------------------------------------------- the exact path
test('an exact prompt crosses in, solve and verify, and never reaches the model cell', async () => {
  const brain = brainWithMemory('region-exact');
  installAskRegion(brain);
  const t0 = brain.clock.t;
  const a = await askThroughRegion(brain, 'Compute: 37 * 41', { provider: 'null', timeoutMs: 5000 });
  console.log('exact: text=' + JSON.stringify(a.text) + ' provenance=' + a.provenance.answer
    + ' hops=' + a.hops.join('>') + ' ticks=' + a.ticks + ' (clock ' + t0 + ' -> ' + brain.clock.t + ')'
    + ' ask.llm asked=' + brain.cell('ask.llm').state.asked);
  assert.equal(a.provenance.answer, 'exact');
  assert.equal(a.route, 'region');
  assert.match(a.text, /1517/);
  assert.deepEqual(a.hops, ['ask.in', 'ask.solve', 'ask.verify']);
  assert.equal(brain.cell('ask.llm').state.asked, 0);
  assert.equal(brain.cell('ask.recall').state.recalls, 0);
  assert.ok(a.ticks > 0);
  assert.equal(a.timedOut, false);
});

// ---------------------------------------------------------------- the model path
test('a prose prompt reaches the model cell, and the offline provider falls to memory', async () => {
  const brain = brainWithMemory('region-prose');
  remember(brain, 'The gate holds a proposal until a human decides.');
  installAskRegion(brain);
  const a = await askThroughRegion(brain, 'What does the gate do with a proposal?', { provider: 'null', timeoutMs: 5000 });
  const llm = brain.cell('ask.llm').state;
  console.log('prose: provenance=' + a.provenance.answer + ' from=' + a.from + ' hops=' + a.hops.join('>')
    + ' ticks=' + a.ticks + ' ask.llm asked=' + llm.asked + ' answered=' + llm.answered
    + ' ask.recall recalls=' + brain.cell('ask.recall').state.recalls);
  assert.equal(llm.asked, 1);
  assert.equal(a.provenance.answer, 'memory');
  assert.equal(a.provenance.llm.provider, 'null');
  assert.deepEqual(a.hops, ['ask.in', 'ask.solve', 'ask.recall', 'ask.verify']);
  assert.equal(a.timedOut, false);
});

// ---------------------------------------------------------------- the deadline
test('a completion that lands after the deadline is not an answer', async (t) => {
  resetProbeCache();
  const fixture = await startHangingOllama(t);
  const brain = brainWithMemory('region-deadline');
  remember(brain, 'A deadline returns what the organism holds.');
  installAskRegion(brain);
  const t0 = Date.now();
  const a = await askThroughRegion(brain, 'What happens when the model does not answer?', {
    // A model name is required before act/llm.mjs will open a socket at all, and it is the
    // fixture's own name: nothing here names the model on this machine.
    provider: 'ollama', model: 'fixture', base: fixture.base, probeMs: 1000, timeoutMs: 1200,
  });
  const ms = Date.now() - t0;
  const llm = brain.cell('ask.llm').state;
  console.log('deadline: timedOut=' + a.timedOut + ' provenance=' + a.provenance.answer + ' ms=' + ms
    + ' fixture generate hits=' + fixture.state.generate + ' tags hits=' + fixture.state.tags
    + ' ask.llm asked=' + llm.asked + ' answered=' + llm.answered + ' inflight=' + llm.inflight
    + ' hops=' + a.hops.join('>'));
  assert.equal(fixture.state.generate, 1);
  assert.equal(llm.asked, 1);
  assert.equal(llm.answered, 0);
  assert.equal(a.timedOut, true);
  assert.equal(a.provenance.answer, 'memory');
  assert.equal(a.ok, true);
  resetProbeCache();
});

// ---------------------------------------------------------------- route parity
test('route region and route direct agree on thirty seeded prompts', async () => {
  const tasks = await import('../tasks/index.mjs');
  const { G } = await import('../cells/grid.mjs');
  const items = askSuiteItems({ seed: 'parity', n: 30, tasks: { ...tasks, G } });
  assert.equal(items.length, 30);
  const direct = brainWithMemory('region-parity-direct');
  const region = brainWithMemory('region-parity-region');
  installAskRegion(region);
  let same = 0;
  const differ = [];
  for (const it of items) {
    const d = await ask(direct, it.q, { provider: 'null', route: 'direct' });
    const r = await ask(region, it.q, { provider: 'null', route: 'region' });
    if (d.text === r.text && d.provenance.answer === r.provenance.answer) same++;
    else differ.push({ q: it.id, direct: d.provenance.answer, region: r.provenance.answer });
  }
  console.log('parity: ' + same + ' of ' + items.length + ' prompts agree on text and provenance'
    + (differ.length ? ', differ: ' + JSON.stringify(differ) : ''));
  assert.equal(same, items.length);
});

// ---------------------------------------------------------------- the seal
test('the sealed region receives nothing from the rest of the organism', async () => {
  const { buildWhole } = await import('../seeds/whole.mjs');
  const built = buildWhole({ seed: 'region-seal', ledger: 'off' });
  const brain = built.brain || built;
  assert.equal(brain.regions.has(ASK_REGION), true);
  const edgesInBefore = ASK_CELLS.reduce((n, id) => n + brain.connectome.into(brain.cell(id).idx).length, 0);
  brain.tick(50);
  const edgesInAfter = ASK_CELLS.reduce((n, id) => n + brain.connectome.into(brain.cell(id).idx).length, 0);
  const runs = ASK_CELLS.map((id) => brain.cell(id).stats.runs);
  console.log('seal: after 50 ticks of ' + brain.cells.length + ' cells, ask cell runs ' + runs.join(',')
    + ', edges into the region ' + edgesInBefore + ' -> ' + edgesInAfter
    + ', ask.verify answers ' + brain.cell('ask.verify').state.answers);
  assert.equal(edgesInAfter, edgesInBefore);
  assert.equal(edgesInAfter, ASK_CONDUITS.length);
  assert.deepEqual(runs, ASK_CELLS.map(() => 0));
  assert.equal(brain.cell('ask.verify').state.answers, 0);
});

// ---------------------------------------------------------------- what the self loop may cut
// The route's own seven conduits read usage 0 on the live organism between one human question
// and the next, because the ask suite is measured on a clone. A prune proposed on usage alone
// would therefore propose deleting the whole route, every round. This is the control for that:
// the same organism, the same reading, before and after a reach is grown out of the region.
test('the self loop proposes cutting a grown reach, never the seven conduits of the route', async () => {
  const { buildWhole } = await import('../seeds/whole.mjs');
  const { observe } = await import('../self/observe.mjs');
  const { propose } = await import('../self/propose.mjs');
  const built = buildWhole({ seed: 'region-prune', ledger: 'off' });
  const brain = built.brain || built;
  // A suite reading the round would have taken off a clone, passed in rather than measured, so
  // this test grades the proposal rule and not the suite.
  const suites = { ask: { n: 6, correct: 5, accuracy: 0.833333, ms: 0, error: null } };
  const prunesOf = (cands) => cands.filter((c) => c.delta && c.delta.kind === 'conduit.prune' && c.delta.region === ASK_REGION);
  const before = propose(brain, observe(brain, { suites }), { max: 24, round: 1, window: 48 });
  const add = before.find((c) => c.delta && c.delta.kind === 'conduit.add' && c.delta.region === ASK_REGION);
  assert.ok(add, 'the round proposes a reach out of the region');
  console.log('prune rule: with 7 route conduits at usage 0, prune candidates ' + prunesOf(before).length
    + ', reach proposed ' + add.delta.src + '.' + add.delta.srcPort + ' -> ' + add.delta.dst + '.' + add.delta.dstPort);
  assert.equal(prunesOf(before).length, 0);

  brain.connect(add.delta.src, add.delta.srcPort, add.delta.dst, add.delta.dstPort, { w: 1, delay: 1, conf: 1, by: 'test' });
  const after = propose(brain, observe(brain, { suites }), { max: 24, round: 2, window: 48 });
  const prunes = prunesOf(after);
  const edges = prunes.length ? prunes[0].delta.edges : [];
  console.log('prune rule: after the reach is grown, prune candidates ' + prunes.length + ' naming '
    + edges.map((e) => e.src + '.' + e.srcPort + ' -> ' + e.dst + '.' + e.dstPort).join(', '));
  assert.equal(prunes.length, 1);
  assert.equal(edges.length, 1);
  assert.equal(edges[0].dst, add.delta.dst);
  for (const e of edges) assert.ok(!ASK_CELLS.includes(e.dst), 'no conduit of the route itself is ever named');
});

// ------------------------------------------------- an exact answer reaches no network, either way
// act/prompt.mjs skips the model entirely on a prompt it can compute, so it opens no socket on
// one. The region route resolves the provider before the question is injected, which is the one
// place it could quietly differ. The control is the same fixture, the same brain and the same
// absent provider, with only the prompt changed: the exact one must not probe and the prose one
// must, or the test would pass because the fixture was never reachable in the first place.
test('with no provider named, an exact prompt probes nothing and a prose prompt probes once', async (t) => {
  resetProbeCache();
  const fixture = await startHangingOllama(t);
  const brain = brainWithMemory('region-probe');
  remember(brain, 'A probe is a request, and a request is a socket.');
  installAskRegion(brain);
  const exact = await askThroughRegion(brain, 'Compute: 12 + 30', { base: fixture.base, probeMs: 500, timeoutMs: 3000 });
  const afterExact = fixture.state.tags;
  const prose = await askThroughRegion(brain, 'What is a probe?', { base: fixture.base, probeMs: 500, timeoutMs: 1500 });
  console.log('probe: exact provenance=' + exact.provenance.answer + ' probed=' + exact.provenance.llm.probed
    + ' tags hits after the exact prompt ' + afterExact
    + '; prose provenance=' + prose.provenance.answer + ' probed=' + prose.provenance.llm.probed
    + ' tags hits after the prose prompt ' + fixture.state.tags + ', generate hits ' + fixture.state.generate);
  assert.equal(exact.provenance.answer, 'exact');
  assert.equal(afterExact, 0);
  assert.equal(fixture.state.tags, 1);
  resetProbeCache();
});
