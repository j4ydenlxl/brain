// test/ask-fallthrough.test.mjs: the memory miss of act/prompt.mjs ask(), as a reply for a person
// (board 25, item ask-fallthrough; his 2026-09-27 09:28 "it said it couldnt respond").
// Author: board 25 builder.
//
// A prompt no tier carries used to end in ONE line, "nothing in memory matches <words>.", which a
// person on a phone reads as a refusal. With zero hits and no model cell (the null provider) the text
// is now three lines: a sentence in the organism's voice, the old line unchanged, prompts it carries.
// Everything else about the answer (from, route, provenance, memory, llm) is pinned to the values a
// run BEFORE the edit printed, and every other tier's text is pinned or compared with the switch off.
// Nothing here calls Ollama or any network: the model cells are a mock on 127.0.0.1 and a dead port.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { Brain } from '../core/brain.mjs';
import { bundle, hvFromSeed } from '../core/signal.mjs';
import { attachMemory } from '../memory/index.mjs';
import { KnowledgeWriter } from '../memory/knowledge.mjs';
import { armWorld } from '../world/policy.mjs';
import { converse } from '../act/converse.mjs';
import { extractAnswer } from '../bench/answer.mjs';
import {
  ask, closeKnowledge, keywords, memoryAnswer, memoryMissText,
  FALLTHROUGH, FALLTHROUGH_HEAD, FALLTHROUGH_TRY,
} from '../act/prompt.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-fallthrough-test-'));
after(() => { closeKnowledge(); fs.rmSync(TMP, { recursive: true, force: true }); });

// The seeded brain of test/act-prompt.test.mjs: a core Brain, its memory, an armed world, and
// episodes written the way the episodic tier writes them.
let nb = 0;
function seeded() {
  const brain = new Brain({ name: 'ask-fallthrough-' + (++nb), ledger: 'full' });
  attachMemory(brain, { name: 'ask-fallthrough:' + nb + ':' + Math.random().toString(36).slice(2) });
  armWorld(brain.gate, {});
  const remember = (text, t) => {
    const items = keywords(text, { max: 24, min: 3 });
    brain.memory.episodic.append({ key: bundle(items.map((w) => hvFromSeed('word:' + w))), value: { text, origin: 'self' }, items, t });
  };
  remember('the gate holds a proposal until a human decides', 1);
  remember('the organism grows cells by generations and measures them with benches', 2);
  return brain;
}

// The twelve uncarried prompts and the old line each one printed BEFORE the edit (a run of ask() on
// this seeded brain with provider null and the knowledge tier off, 2026-09-27, pinned here by value).
const OLD = {
  'tell me a joke': 'nothing in memory matches tell, joke.',
  'write a poem about the sea': 'nothing in memory matches write, poem, about, sea.',
  'who won the world cup': 'nothing in memory matches won, world, cup.',
  'summarise this page': 'nothing in memory matches summarise, page.',
  'translate hello to french': 'nothing in memory matches translate, hello, french.',
  'what day is it': 'nothing in memory matches day.',
  'recommend a book': 'nothing in memory matches recommend, book.',
  'explain quantum physics': 'nothing in memory matches explain, quantum, physics.',
  'write code for a web server': 'nothing in memory matches write, code, web, server.',
  'what is the meaning of life': 'nothing in memory matches meaning, life.',
  'do my homework': 'nothing in memory matches homework.',
  'hey how are you doing today my friend it is a lovely day': 'nothing in memory matches hey, doing, today, friend, lovely, day.',
};
const UNCARRIED = Object.keys(OLD);
// The knowledge tier is off so the test reads the same on a host with the wiki store and on one
// without it (the deployed server ships none); the converse region is off in the first test so a
// later grammar that carries one of these (item converse-cover) cannot hide the memory tier.
const NULL = { provider: 'null', knowledge: false };

async function withSwitch(on, fn) {
  const was = FALLTHROUGH.on;
  FALLTHROUGH.on = on;
  try { return await fn(); } finally { FALLTHROUGH.on = was; }
}
const sameModNs = (a, b) => a.replace(/\d+ ns\)/, 'N ns)') === b.replace(/\d+ ns\)/, 'N ns)');

test('twelve uncarried prompts, provider null: a sentence for a person, the old line unchanged, three carried prompts; every other field as before', async () => {
  const brain = seeded();
  assert.equal(FALLTHROUGH.on, true, 'the fall through ships on');
  for (const q of UNCARRIED) {
    const a = await ask(brain, q, { ...NULL, converse: false });
    const lines = a.text.split('\n');
    assert.equal(lines.length, 3, q + ': three lines, got ' + JSON.stringify(a.text));
    const [first, second, third] = lines;
    assert.ok(first.endsWith('.'), q + ': the first line ends with a period');
    assert.ok(!/nothing in memory/i.test(first), q + ': the first line is not the old line');
    assert.ok(first.length < 240, q + ': the first line is ' + first.length + ' chars');
    assert.equal(first, FALLTHROUGH_HEAD);
    assert.ok(second.startsWith('nothing in memory matches'), q + ': the second line is the old line');
    assert.equal(second, OLD[q], q + ': the old line, byte for byte');
    assert.equal(third, FALLTHROUGH_TRY);
    assert.match(a.text, /^nothing in memory matches/m, 'the old line survives as a line of the text');
    // every other field is the value the run before the edit printed
    assert.equal(a.from, 'memory');
    assert.equal(a.route, 'direct');
    assert.equal(a.provenance.answer, 'memory');
    assert.equal(a.provenance.memoryHits, 0);
    assert.equal(a.provenance.webPages, 0);
    assert.equal(a.memory, OLD[q], 'answer.memory is still the old line');
    assert.equal(a.exact, null);
    assert.deepEqual(a.cites, []);
    assert.equal(a.provenance.llm.provider, 'null');
    assert.equal(a.provenance.llm.model, 'null');
    assert.equal(a.provenance.llm.ok, true);
    assert.equal(a.provenance.llm.reason, null);
    assert.equal(a.provenance.llm.fellBack, null);
    // the control: the switch off prints the old line alone, byte for byte
    const off = await withSwitch(false, () => ask(brain, q, { ...NULL, converse: false }));
    assert.equal(off.text, OLD[q], q + ': the control prints the old text');
    for (const k of ['from', 'route', 'memory', 'exact', 'words']) assert.deepEqual(off[k], a[k], q + ': ' + k + ' is the same on and off');
    assert.deepEqual({ ...off.provenance, llm: { ...off.provenance.llm, ms: 0, tokens: 0 } }, { ...a.provenance, llm: { ...a.provenance.llm, ms: 0, tokens: 0 } });
    // a number grader reads the same candidate on and off: the added lines carry no digit
    assert.equal(extractAnswer(a.text, 'number').candidate, extractAnswer(off.text, 'number').candidate, q + ': number candidate');
  }
  assert.doesNotMatch(FALLTHROUGH_HEAD + FALLTHROUGH_TRY, /\d/, 'no digit in the added lines');
  assert.doesNotMatch(FALLTHROUGH_HEAD + FALLTHROUGH_TRY, /\u2014/, 'no em-dash');
});

test('with the converse region on, each of the twelve is either the same fall through or a native answer, never the bare old line', async () => {
  const brain = seeded();
  let fell = 0, native = 0;
  for (const q of UNCARRIED) {
    const a = await ask(brain, q, NULL);
    if (converse(q)) {
      native++;
      assert.equal(a.provenance.answer, 'native', q);
    } else {
      fell++;
      assert.equal(a.text, FALLTHROUGH_HEAD + '\n' + OLD[q] + '\n' + FALLTHROUGH_TRY, q);
    }
    assert.ok(!a.text.startsWith('nothing in memory matches'), q + ': the first line is for a person');
  }
  assert.equal(fell + native, UNCARRIED.length);
  assert.ok(fell > 0, 'at least one prompt reached the memory tier with the region on');
});

test('the third line names prompts the organism carries, and the first line claims tiers that answer', async () => {
  const brain = seeded();
  const tried = FALLTHROUGH_TRY.replace(/^Try asking: /, '').replace(/\.$/, '').split(', ');
  assert.equal(tried.length, 3);
  for (const q of tried) {
    const a = await ask(brain, q, NULL);
    assert.notEqual(a.provenance.answer, 'memory', q + ' is carried');
    assert.equal(a.provenance.answer, 'native', q);
  }
  // "arithmetic and equations exactly"
  for (const q of ['what is 17 times 23', 'x + 3 = 11']) {
    const a = await ask(brain, q, NULL);
    assert.equal(a.provenance.answer, 'exact', q);
  }
});

test('"hi" and "what is 17 times 23" are byte identical to before; a memory hit and a page keep their text', async () => {
  const brain = seeded();
  const exact = await ask(brain, 'what is 17 times 23', NULL);
  assert.equal(exact.text, 'answered exactly by exact.arith, with no model and no network.\n- read "what is 17 times 23" as 17 * 23\n- expression 17 * 23\n- exact rational arithmetic on BigInt, no rounding at any step\n391');
  const hi = await ask(brain, 'hi', NULL);
  assert.equal(hi.from, 'native');
  assert.equal(hi.text, 'answered natively by the conversation region (kind greeting, ' + hi.native.ns + ' ns), with no model, no memory read and no network.\n' + converse('hi').answer);
  const hiOff = await withSwitch(false, () => ask(brain, 'hi', NULL));
  assert.ok(sameModNs(hi.text, hiOff.text), 'hi is the same text on and off');
  // a hit in memory: pinned by the run before the edit
  const hit = await ask(brain, 'what does the gate do with a proposal', NULL);
  assert.equal(hit.provenance.memoryHits, 1);
  assert.equal(hit.text, 'from memory (1 hit, 0 pages), best first:\n- [episodic.item#0 sim 0.5061 origin=self] the gate holds a proposal until a human decides\nbest hit [episodic.item#0 sim 0.5061]: the gate holds a proposal until a human decides');
  assert.equal(hit.text, hit.memory);
  // a page the senses read: not a miss, so no fall through
  const page = await ask(brain, 'tell me a joke', { ...NULL, converse: false, pages: [{ url: 'https://example.test/x', title: 'Jokes', text: 'a page about jokes' }] });
  assert.equal(page.provenance.webPages, 1);
  assert.equal(page.text, page.memory);
  assert.ok(page.text.startsWith('from memory (0 hits, 1 page)'), page.text);
});

test('the knowledge tier and a region that was asked and not reached keep their text, on and off', async () => {
  const dir = path.join(TMP, 'store');
  const w = new KnowledgeWriter(dir, { source: 'test/ask-fallthrough.test.mjs' });
  w.addArticle({ title: 'Zorblax', pageId: 1, sections: [{ heading: '', sentences: ['Zorblax is a purple mineral found on the planet Mars.'] }], categories: ['Minerals'] });
  for (let i = 0; i < 40; i++) w.addArticle({ title: 'Filler ' + i, pageId: 10 + i, sections: [{ heading: '', sentences: ['Filler ' + i + ' is a placeholder page for the test.'] }], categories: ['Fillers'] });
  w.finish({ complete: true });
  const brain = seeded();
  const k = await ask(brain, 'What is Zorblax?', { provider: 'null', knowledge: dir, route: 'direct' });
  assert.equal(k.route, 'knowledge');
  const kOff = await withSwitch(false, () => ask(brain, 'What is Zorblax?', { provider: 'null', knowledge: dir, route: 'direct' }));
  assert.equal(k.text, kOff.text);
  assert.ok(!k.text.startsWith(FALLTHROUGH_HEAD));
  // a region asked and not reached answers from memory with the old text (not this item's path)
  const deadCell = async () => ({ ok: false, text: '', reason: 'mock: connection refused' });
  const prompt = 'Janet has 3 apples and buys 5 more. She gives away 2. How many apples does she have now?';
  const DOWN = { base: 'http://127.0.0.1:9', probeMs: 150, timeoutMs: 400, spawn: false, knowledge: false };
  const r = await ask(brain, prompt, { ...DOWN, provider: 'ollama', model: 'm', cell: deadCell, regions: { math: { k: 2, verify: false } } });
  assert.equal(r.route, 'math', 'the word problem reached the math region');
  assert.equal(r.provenance.region.reached, false);
  assert.equal(r.provenance.memoryHits, 0, 'a miss in memory too');
  assert.equal(r.text, r.memory, 'an unreached region keeps the memory text');
  assert.ok(r.text.startsWith('nothing in memory matches janet'), r.text);
});

test('a model that answered, a model that failed and no provider configured: only the last one falls through', async (t) => {
  const seen = [];
  const mock = http.createServer((req, res) => {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => {
      seen.push(req.url);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ model: 'mock-1', choices: [{ message: { content: 'MODEL SAID X' } }], usage: { completion_tokens: 3 } }));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  t.after(() => new Promise((r) => { mock.closeAllConnections?.(); mock.close(() => r()); }));
  const dead = http.createServer();
  await new Promise((r) => dead.listen(0, '127.0.0.1', r));
  const deadPort = dead.address().port;
  await new Promise((r) => dead.close(r));
  process.env.ASK_FALLTHROUGH_TEST_BASE = 'http://127.0.0.1:' + mock.address().port + '/v1';
  process.env.ASK_FALLTHROUGH_TEST_DEAD = 'http://127.0.0.1:' + deadPort + '/v1';
  t.after(() => { delete process.env.ASK_FALLTHROUGH_TEST_BASE; delete process.env.ASK_FALLTHROUGH_TEST_DEAD; });
  const brain = seeded();
  const q = 'write a poem about the sea';
  // a model answered: its text, untouched, on and off
  const m = await ask(brain, q, { provider: 'env', envBase: 'ASK_FALLTHROUGH_TEST_BASE', knowledge: false, converse: false });
  assert.equal(m.from, 'llm');
  assert.equal(m.text, 'MODEL SAID X');
  assert.equal(m.provenance.answer, 'model');
  assert.equal(m.provenance.llm.provider, 'env');
  const mOff = await withSwitch(false, () => ask(brain, q, { provider: 'env', envBase: 'ASK_FALLTHROUGH_TEST_BASE', knowledge: false, converse: false }));
  assert.equal(mOff.text, m.text);
  assert.equal(seen.length, 2, 'the mock model was asked twice');
  // a model asked and failed (a dead port): fellBack env, the old line alone
  const f = await ask(brain, q, { provider: 'env', envBase: 'ASK_FALLTHROUGH_TEST_DEAD', knowledge: false, converse: false, timeoutMs: 2000 });
  assert.equal(f.provenance.llm.fellBack, 'env');
  assert.equal(f.provenance.llm.ok, false);
  assert.equal(f.from, 'memory');
  assert.equal(f.text, OLD[q], 'a failed model keeps the old text');
  // no provider named and no model at the probed base: the null provider stood in, so it falls through
  const n = await ask(brain, q, { base: 'http://127.0.0.1:' + deadPort, probeMs: 300, knowledge: false, converse: false });
  assert.equal(n.provenance.llm.provider, 'null');
  assert.equal(n.provenance.llm.fellBack, null);
  assert.equal(n.text, FALLTHROUGH_HEAD + '\n' + OLD[q] + '\n' + FALLTHROUGH_TRY);
});

test('memoryMissText: the old line unless a miss with the null provider standing in', () => {
  const miss = { words: ['sea'], hits: [], pages: [], memoryHits: 0, webPages: 0 };
  const old = memoryAnswer(miss);
  assert.equal(old, 'nothing in memory matches sea.');
  assert.equal(memoryMissText(old, miss, { provider: 'null', fellBack: null }), FALLTHROUGH_HEAD + '\n' + old + '\n' + FALLTHROUGH_TRY);
  assert.equal(memoryMissText(old, miss, { provider: 'null', fellBack: 'ollama' }), old, 'a model asked and failed');
  assert.equal(memoryMissText(old, miss, { provider: 'env', fellBack: null }), old, 'a model that answered');
  assert.equal(memoryMissText(old, miss, { provider: null, fellBack: null }), old, 'no model asked (an exact answer)');
  const hit = { ...miss, hits: [{ source: 'episodic.item', id: '0', sim: 1, text: 'sea' }], memoryHits: 1 };
  assert.equal(memoryMissText('x', hit, { provider: 'null', fellBack: null }), 'x', 'a hit is not a miss');
  const empty = { words: [], hits: [], pages: [], memoryHits: 0, webPages: 0 };
  assert.equal(memoryAnswer(empty), 'nothing in memory matches this prompt.');
});

test('the server path: createHandler with no model configured prints the three lines and the same JSON fields', async () => {
  const { createHandler, NOT_CONFIGURED } = await import('../act/ask-http.mjs');
  const h = createHandler({ stateDir: path.join(TMP, 'handler') });
  for (const q of ['do my homework', 'hey how are you doing today my friend it is a lovely day']) {
    const r = await h({ method: 'POST', body: JSON.stringify({ prompt: q }), ip: '10.9.9.9', env: {} });
    assert.equal(r.status, 200);
    const j = r.json;
    assert.equal(j.text, FALLTHROUGH_HEAD + '\n' + OLD[q] + '\n' + FALLTHROUGH_TRY, q);
    assert.equal(j.from, 'memory');
    assert.equal(j.route, 'direct');
    assert.equal(j.provenance.answer, 'memory');
    assert.equal(j.provenance.memoryHits, 0);
    assert.equal(j.llm.provider, 'null');
    assert.equal(j.llm.reason, NOT_CONFIGURED);
    assert.equal(j.native, null);
    assert.equal(j.exact, null);
    assert.equal(j.model.configured, false);
  }
});

test('the bench readers: a person line, a bare miss and the native clock are read as the bar defines them', async () => {
  const { firstLineForPerson, isMiss, normaliseClock, DEV_UNCARRIED } = await import('../bench/ask-fallthrough.mjs');
  const full = FALLTHROUGH_HEAD + '\n' + OLD['do my homework'] + '\n' + FALLTHROUGH_TRY;
  assert.equal(firstLineForPerson(full), true);
  assert.equal(firstLineForPerson(OLD['do my homework']), false, 'the old line alone is not a line for a person');
  assert.equal(firstLineForPerson('from memory (knowledge tier, article "Life", confidence 0.4 at floor 0.2), best first:\n- x'), false, 'a header ending in a colon');
  assert.equal(firstLineForPerson('x'.repeat(240) + '.'), false, 'too long');
  assert.equal(firstLineForPerson(''), false);
  const j = { from: 'memory', text: OLD['do my homework'], provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, llm: { provider: 'null', fellBack: null } };
  assert.equal(isMiss(j), true);
  assert.equal(isMiss({ ...j, llm: { provider: 'null', fellBack: 'env' } }), false, 'a model that failed');
  assert.equal(isMiss({ ...j, provenance: { ...j.provenance, memoryHits: 1 } }), false, 'a hit');
  assert.equal(isMiss({ ...j, text: full }), false, 'the fall through text is not the control shape');
  assert.equal(isMiss(null), false);
  assert.equal(normaliseClock('(kind greeting, 12000 ns), x'), normaliseClock('(kind greeting, 7 ns), x'));
  assert.notEqual(normaliseClock('(kind greeting, 1 ns)'), normaliseClock('(kind thanks, 1 ns)'));
  for (const q of DEV_UNCARRIED) assert.ok(!(q in OLD), 'a development prompt of the bench is not one of the twelve here: ' + q);
});
