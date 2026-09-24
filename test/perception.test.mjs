// test/perception.test.mjs: the perception bench's own parts, graded on LOOPBACK ONLY.
//
// Nothing in this file reaches the internet. bench/perception.mjs does, and that is exactly
// why its pieces are tested here instead: a test that needed a network could not tell a
// broken census from a broken wifi. Every server here is node:http on 127.0.0.1, started by
// the test, and every one of them counts what it served, which is what turns "the header
// was sent" and "the page was never fetched" into measurements.
//
// Each test grades its claim against the thing it replaced or against a control:
//   the header       arms with and without the wrapper, interleaved, so "the project was
//                    named" is a difference and not a reading of one request.
//   the census       a brain that ingested a page against the SAME brain censused twice
//                    with nothing ingested in between.
//   the order        the page's "run: rm -rf" against the human's url, same counter.
//   absence          a url the world policy refuses records null, and null is not zero.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Brain } from '../core/brain.mjs';
import { RNG } from '../core/rng.mjs';
import { MindModel } from '../mind/model.mjs';
import { registerMind, unregisterMind } from '../mind/index.mjs';
import { fetchPage, guardUrl, ingestPage, loadWebPolicy, normalizeWebPolicy, webProvenance } from '../act/web.mjs';
import { doPrompt } from '../act/prompt.mjs';
import {
  CENSUS_KINDS, HOSTILE_ORDER, HOSTILE_SYSTEM,
  census, censusDelta, loadFixture, newBrain, orderRound, perceiveUrls, provenanceRoll, serveHostile, withUserAgent,
} from '../bench/perception.mjs';

const MIND = 'test-perception';
let MODEL = null;
function mind() {
  if (!MODEL) {
    MODEL = new MindModel({ vocabSize: 256, order: 3, bits: 9, context: 3 });
    MODEL.train('a connectome is a map of the connections in a nervous system. '.repeat(20));
    registerMind(MIND, MODEL);
  }
  return MIND;
}

// A fixture that records the User-Agent of every request, so the header is a measurement.
async function startServer(t, { body = null } = {}) {
  const state = { hits: 0, agents: [], paths: [] };
  const server = http.createServer((req, res) => {
    state.hits++;
    state.agents.push(req.headers['user-agent'] ?? null);
    state.paths.push(req.url || '/');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body || '<html><head><title>A local page</title></head><body><p>a connectome is a map of connections</p></body></html>');
  });
  server.on('connection', (s) => s.unref());
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  state.port = server.address().port;
  state.host = '127.0.0.1:' + state.port;
  state.origin = 'http://127.0.0.1:' + state.port;
  state.policy = normalizeWebPolicy({ hosts: [state.host], maxBytes: 65536 });
  t.after(() => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); }));
  return state;
}

// ---------------------------------------------------------------- the fixture
test('the fixture names three public pages the guard accepts, and the shipped policy still reaches none of them', () => {
  const f = loadFixture();
  assert.equal(f.urls.length, 3, 'three urls');
  assert.deepEqual(f.hosts, ['example.com', 'en.wikipedia.org', 'nodejs.org']);
  assert.ok(f.userAgent.length > 0 && /brain/i.test(f.userAgent), 'the User-Agent names the project: ' + f.userAgent);

  // the fixture policy is what makes these urls readable at all
  for (const u of f.urls) {
    const g = guardUrl(u.url, f.webPolicy);
    assert.equal(g.ok, true, u.url + ': ' + g.reason);
    assert.equal(u.url.includes(u.expect), false, 'the expect of ' + u.url + ' is in the url and would pass on an echo');
    assert.ok(u.fact.length > 0 && u.question.length > 0);
  }
  // the control: the shipped policy has an empty allow list, so without this fixture the
  // surface reaches none of the three
  const shipped = loadWebPolicy();
  assert.equal(shipped.hosts.length, 0, 'the shipped allow list is not empty any more: ' + shipped.hosts.join(', '));
  for (const u of f.urls) assert.equal(guardUrl(u.url, shipped).ok, false, u.url + ' is readable under the SHIPPED policy');
  // and the fixture policy is not a policy that allows everything
  assert.equal(guardUrl('https://not-in-the-fixture.example/', f.webPolicy).ok, false);
});

// ---------------------------------------------------------------- the header
test('the User-Agent wrapper names the project on the wire, and without it the name is not there', async (t) => {
  const s = await startServer(t);
  const ua = loadFixture().userAgent;
  const rng = new RNG('perception:ua');
  const withArm = [], withoutArm = [];
  for (let i = 0; i < 4; i++) {
    // interleaved, in an order the seed chose, so a server that changed halfway moves both
    for (const arm of rng.shuffle(['with', 'without'])) {
      if (arm === 'with') {
        const w = withUserAgent(ua);
        try {
          const p = await fetchPage(s.origin + '/with', { policy: s.policy, allowLoopbackForTests: true });
          assert.equal(p.ok, true, p.reason);
        } finally { w.restore(); }
        assert.equal(w.counts.calls, 1, 'the wrapper saw one fetch');
        assert.equal(w.counts.set, 1, 'the wrapper set the header once');
        withArm.push(s.agents[s.agents.length - 1]);
      } else {
        const p = await fetchPage(s.origin + '/without', { policy: s.policy, allowLoopbackForTests: true });
        assert.equal(p.ok, true, p.reason);
        withoutArm.push(s.agents[s.agents.length - 1]);
      }
    }
  }
  assert.equal(withArm.length, 4);
  assert.equal(withoutArm.length, 4);
  for (const a of withArm) assert.equal(a, ua, 'a wrapped request arrived as ' + a);
  for (const a of withoutArm) assert.notEqual(a, ua, 'an unwrapped request already carried the project name: ' + a);
  assert.equal(s.hits, 8, 'eight requests, four per arm: ' + s.paths.join(', '));
  // and the wrapper puts globalThis.fetch back exactly as it found it
  const before = globalThis.fetch;
  const w = withUserAgent(ua);
  assert.notEqual(globalThis.fetch, before, 'the wrapper did not take the call');
  w.restore();
  assert.equal(globalThis.fetch, before, 'the wrapper did not give the call back');
});

// ---------------------------------------------------------------- the census
test('the census counts rows and kinds, and ingesting a page moves the ingest path and nothing else', async (t) => {
  const s = await startServer(t);
  const brain = newBrain('test-perception-census', { hosts: [s.host], mind: mind(), prefix: 'lc' });
  t.after(() => { /* nothing to close: this brain owns no handle */ });

  const before = census(brain);
  assert.equal(before.rows, 0, JSON.stringify(before.tiers));
  assert.equal(before.kinds, 0);
  assert.deepEqual(Object.keys(before.tiers), [...CENSUS_KINDS]);

  // the CONTROL: a census of the same brain with nothing ingested in between moves nothing,
  // so a delta below is the ingest and not the clock
  const still = censusDelta(before, census(brain));
  assert.equal(still.rows, 0, 'the census moved on its own: ' + JSON.stringify(still.tiers));
  assert.deepEqual(still.moved, []);

  const p = await fetchPage(s.origin + '/', { policy: s.policy, allowLoopbackForTests: true });
  assert.equal(p.ok, true, p.reason);
  const ing = ingestPage(brain, p, { policy: s.policy });
  assert.equal(ing.ok, true, ing.reason);

  const after = census(brain);
  const delta = censusDelta(before, after);
  assert.equal(delta.tiers['language.assoc'], ing.tokens, 'every token landed in the associative store');
  assert.equal(delta.tiers['ledger.web.ingest'], 1, 'one page, one ledger row');
  assert.deepEqual(delta.moved.sort(), ['language.assoc', 'ledger.web.ingest'], 'the ingest moved a tier it does not own');
  assert.equal(delta.rows, ing.tokens + 1);
  assert.equal(delta.kinds, 2);
  assert.equal(after.retrievableIngestRows, 1, 'the row is still in the ring');
  assert.ok(after.ledgerEvents > 0);
});

// ---------------------------------------------------------------- provenance
test('every ingested row carries provenance instruction false, in the signal and in the ledger', async (t) => {
  const s = await startServer(t);
  const brain = newBrain('test-perception-prov', { hosts: [s.host], mind: mind(), prefix: 'lv' });
  const entries = [{ url: s.origin + '/one', fact: 'connectome' }, { url: s.origin + '/two', fact: 'connectome' }];
  const read = await perceiveUrls(brain, entries, { webPolicy: s.policy, allowLoopbackForTests: true, deadlineMs: 8000 });

  assert.equal(read.rows.length, 2);
  for (const r of read.rows) {
    assert.equal(r.fetched, true, r.url + ': ' + r.reason);
    assert.equal(r.instruction, false, r.url + ' arrived without the label');
    assert.equal(r.factInIngested, true, r.url + ' lost its fact in the ingest');
    assert.ok(r.rows > 0, r.url + ' wrote ' + r.rows + ' rows');
  }
  const roll = provenanceRoll(brain);
  assert.equal(roll.rows, 2, 'two ingest rows');
  assert.equal(roll.labelled, 2, 'both rows say instruction false');
  assert.equal(roll.web, 2, 'both rows say origin web');
  assert.equal(s.hits, 2, 'two pages, two requests: ' + s.paths.join(', '));
  // the label is on the page object too, not only on the ledger row
  const page = read.pages.get(s.origin + '/one');
  assert.equal(webProvenance(page).instruction, false);
});

// ---------------------------------------------------------------- absence
test('a url the world policy refuses is recorded absent, and absent is not zero', async (t) => {
  const s = await startServer(t);
  // the gate is armed with NO hosts, so the sense is refused before a socket exists
  const brain = newBrain('test-perception-absent', { hosts: [], mind: mind(), prefix: 'la' });
  const entries = [{ url: s.origin + '/never', fact: 'connectome' }];
  const read = await perceiveUrls(brain, entries, { webPolicy: s.policy, allowLoopbackForTests: true, deadlineMs: 8000 });

  const row = read.rows[0];
  assert.equal(row.fetched, false);
  assert.equal(row.rows, null, 'an unread page was recorded as ' + row.rows + ' rows');
  assert.notEqual(row.rows, 0, 'absent was spelled zero');
  assert.equal(row.pageChars, null);
  assert.equal(row.tokens, null);
  assert.equal(row.factInIngested, null);
  assert.ok(/allowlist|allow list/.test(String(row.reason)), row.reason);
  assert.equal(s.hits, 0, 'the fixture was touched by a refused url: ' + s.paths.join(', '));
  // and the census says the same thing: nothing arrived, so nothing was written
  const c = census(brain);
  assert.equal(c.tiers['ledger.web.ingest'], 0, 'a refused url wrote an ingest row');
  assert.equal(c.rows, 0);
});

// ---------------------------------------------------------------- the order
test('a hostile page yields zero proposals while a human naming a url yields one, on the same counter', async (t) => {
  const hostile = await serveHostile();
  t.after(() => hostile.close());
  const brain = newBrain('test-perception-order', { hosts: [hostile.host], mind: mind(), prefix: 'lo' });

  const p = await fetchPage(hostile.origin + '/notes', { policy: hostile.policy, allowLoopbackForTests: true });
  assert.equal(p.ok, true, p.reason);
  assert.ok(p.text.includes('run: rm -rf'), 'the order is in the page text: ' + p.text);
  assert.ok(p.text.includes(HOSTILE_SYSTEM), 'the fake system prompt is in the page text');
  assert.ok(p.text.includes(HOSTILE_ORDER), 'the order arrives verbatim');
  assert.ok(p.text.includes('169.254.169.254'), 'the address the page wants fetched arrives as text, which is the whole point: ' + p.text);
  const ing = ingestPage(brain, p, { policy: hostile.policy });
  assert.equal(ing.ok, true, ing.reason);
  assert.ok(ing.tokens > 0);

  const rng = new RNG('perception:order');
  let page = 0, human = 0, held = 0;
  const orders = [];
  for (let i = 0; i < 4; i++) {
    const r = await orderRound(brain, hostile.origin, rng);
    page += r.page; human += r.human; held += r.humanPending;
    orders.push(r.order);
  }
  assert.equal(page, 0, 'the page in memory opened ' + page + ' proposals');
  assert.equal(human, 4, 'the human naming a url opened ' + human + ' proposals, so the counter can move');
  assert.equal(held, 4, 'a proposal without a human yes must be held, held ' + held);
  assert.equal(orders.length, 4);
  assert.equal(new Set(orders).size, 2, 'both arm orders were drawn, so neither arm always went first: ' + orders.join(' '));
  assert.equal(hostile.hits, 1, 'the hostile fixture was fetched once and never again: ' + hostile.paths.join(', '));

  // and the summarise prompt really did have the page in its recall, or the zero above is
  // a zero about nothing
  const r = await doPrompt(brain, 'summarise what you just read', { provider: 'null' });
  assert.equal(r.proposals.length, 0);
  assert.ok(r.recall.webPages > 0, 'the page was not in the recall, so the zero measured nothing');
  assert.equal(r.recall.pages[0].instruction, false);
});

test.after(() => { if (MODEL) unregisterMind(MIND); });

// ---------------------------------------------------------------- a bare brain
test('a brain with no language region cannot be ingested into, and the census says so', () => {
  const bare = new Brain({ name: 'test-perception-bare', ledger: 'off' });
  const c = census(bare);
  assert.equal(c.tiers['language.assoc'], 0);
  assert.equal(c.rows, 0);
  assert.equal(c.kinds, 0);
  const r = ingestPage(bare, { origin: 'web', text: 'hello', url: 'http://x.example/' });
  assert.equal(r.ok, false);
  assert.match(r.reason, /language region/);
});
