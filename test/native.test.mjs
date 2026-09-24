// test/native.test.mjs: Board 11, item native. The ask path answers a factual question MEMORY
// FIRST, a question it has answered before in ONE table lookup, and the semantic tier is bounded
// by bytes instead of 4,096 keys.
//
// Every claim runs against a store planted here with memory/knowledge.mjs KnowledgeWriter (the
// writer tools/ingest-wiki.mjs uses), so nothing reads the 388 MB Wikipedia store. The model cell
// is a fake ollama on 127.0.0.1 that counts every request (no real model is ever called), and it
// is closed when its test ends.
//   1. keyBits() is keyVector()'s signs lane for lane, and simBits() is simOf() exactly
//   2. the factual shapes: what, who, which, define, "X is", "what does X mean", where, when
//   3. ask() routes a factual shape to memory, and a math shape past it (even with a memory entry
//      planted under the math subject's own key)
//   4. the floor: at or above it memory answers alone; below it the model is asked with memory's
//      facts and the answer says model+memory; the direct table obeys the same floor
//   5. the direct table: a hit, a miss, a fold collision, a probe collision, growth, save and load,
//      and the binding to a store
//   6. the direct step through ask(): filled from the store on worker threads, it answers first
//      with provenance direct and prints its nanoseconds, gives the tier's own answer, learns an
//      exact answer and gives it back, and never answers with the tier off or prose on
//   7. the semantic tier's byte budget evicts the weakest, says so through its log, and reports
//      keys held and bytes; the default is 256 MB; a count cap is still honoured
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Brain } from '../core/brain.mjs';
import { RNG } from '../core/rng.mjs';
import { attachMemory } from '../memory/index.mjs';
import {
  KnowledgeWriter, KnowledgeStore, SIG_WORDS, factMembers, keyBits, keyVector, sigOf, simBits, simOf, titleWords,
} from '../memory/knowledge.mjs';
import {
  DirectTable, bindingOf, boundTo, factKey, fillFromStore, tableFromColumns, textKey, titleEntry,
} from '../memory/direct.mjs';
import { LEGACY_CAPACITY, SemanticMemory, semanticBudgetBytes } from '../memory/semantic.mjs';
import { resetProbeCache } from '../act/llm.mjs';
import {
  ANSWER_PROVENANCE, DIRECT_TIER, KNOWLEDGE, KNOWLEDGE_TIER, ask, closeKnowledge, directAnswer, factQuestion, isMathSubject,
} from '../act/prompt.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-native-'));
after(() => { closeKnowledge(); fs.rmSync(TMP, { recursive: true, force: true }); });

// Blorp's lead offers eight different things it is, so its confidence is far below the floor.
const BLORP = ['a town in Norway', 'a river', 'a song', 'a game', 'a dance', 'a bird', 'a card', 'a drink'];

function plantStore(name) {
  const dir = path.join(TMP, name);
  const w = new KnowledgeWriter(dir, { source: 'test/native.test.mjs' });
  w.addArticle({ title: 'Zorblax', pageId: 1, sections: [{ heading: '', sentences: ['Zorblax is a purple mineral found on the planet Mars.', 'Zorblax glows in the dark.'] }], categories: ['Minerals'] });
  w.addArticle({ title: 'Blorp', pageId: 2, sections: [{ heading: '', sentences: BLORP.map((x) => 'Blorp is ' + x + '.') }], categories: [] });
  w.addArticle({ title: 'Quindar', pageId: 3, sections: [{ heading: '', sentences: ['Quindar is a harbour town in Veloria.', 'Quindar was founded in 1842 by fishermen.'] }], categories: ['Towns'] });
  for (let i = 0; i < 40; i++) {
    w.addArticle({ title: 'Filler ' + i, pageId: 10 + i, sections: [{ heading: '', sentences: ['Filler ' + i + ' is a placeholder page for the test.'] }], categories: ['Fillers'] });
  }
  w.finish({ complete: true });
  return dir;
}

function newBrain(name) {
  const brain = new Brain({ name, ledger: 'runs', pruneEvery: 0 });
  attachMemory(brain, { name });
  return brain;
}

async function fakeOllama(t, response) {
  const state = { tags: 0, generate: 0, systems: [] };
  const server = http.createServer((req, res) => {
    const url = req.url || '/';
    if (url.startsWith('/api/tags')) {
      state.tags++;
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ models: [{ name: 'fixture' }] }));
    }
    if (url.startsWith('/api/generate')) {
      state.generate++;
      let raw = '';
      req.on('data', (c) => { raw += c; });
      return req.on('end', () => {
        try { state.systems.push(JSON.parse(raw).system || ''); } catch { state.systems.push(''); }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ model: 'fixture', response, eval_count: 5, prompt_eval_count: 30 }));
      });
    }
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end('{}');
  });
  server.on('connection', (s) => s.unref());
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  state.base = 'http://127.0.0.1:' + server.address().port;
  t.after(() => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); resetProbeCache(); }));
  return state;
}

const last = (a) => a.text.split('\n').pop();

// ---------------------------------------------------------------- 1. the bit sliced key
test('keyBits is the sign of keyVector lane for lane, its first words are sigOf, and simBits is simOf exactly', () => {
  const sets = [
    ['zorblax'], ['purple', 'mineral'], ['a1', 'b2', 'c3', 'd4'], ['one', 'two', 'three'],
    titleWords('The Quick Brown Fox Jumps'), factMembers(['zorblax'], 'Zorblax glows in the dark on the planet Mars.'),
  ];
  for (const m of sets) {
    const v = keyVector(m), b = keyBits(m), s = sigOf(m);
    let wrong = 0;
    for (let i = 0; i < v.length; i++) if (((b[i >>> 5] >>> (i & 31)) & 1) !== (v[i] > 0 ? 1 : 0)) wrong++;
    assert.equal(wrong, 0, m.join(' ') + ': ' + wrong + ' lanes differ');
    for (let w = 0; w < SIG_WORDS; w++) assert.equal(b[w] >>> 0, s[w], 'signature word ' + w + ' of ' + m.join(' '));
  }
  for (const a of sets) for (const c of sets) assert.equal(simBits(keyBits(a), keyBits(c)), simOf(keyVector(a), keyVector(c)), a.join(' ') + ' | ' + c.join(' '));
  assert.equal(keyBits([]), null, 'no members is keyVector\'s zero vector');
  assert.equal(simBits(null, keyBits(['x'])), 0);
});

// ---------------------------------------------------------------- 2. the shapes
test('the factual shapes: what, who, which, define, X is, what does X mean, where, when; a task is none of them', () => {
  assert.deepEqual(factQuestion('What is Zorblax?'), { kind: 'what', subject: 'Zorblax', shape: 'definition' });
  assert.deepEqual(factQuestion('who was Albert Einstein'), { kind: 'what', subject: 'Albert Einstein', shape: 'definition' });
  assert.deepEqual(factQuestion('Which is Zorblax?'), { kind: 'what', subject: 'Zorblax', shape: 'definition' });
  assert.deepEqual(factQuestion('Define Zorblax'), { kind: 'what', subject: 'Zorblax', shape: 'define' });
  assert.deepEqual(factQuestion('Zorblax is?'), { kind: 'what', subject: 'Zorblax', shape: 'x-is' });
  assert.deepEqual(factQuestion('What does Zorblax mean?'), { kind: 'what', subject: 'Zorblax', shape: 'meaning' });
  assert.deepEqual(factQuestion('What is the meaning of Zorblax?'), { kind: 'what', subject: 'Zorblax', shape: 'meaning' });
  assert.deepEqual(factQuestion('Where is Quindar?'), { kind: 'where', subject: 'Quindar', shape: 'where' });
  assert.deepEqual(factQuestion('When was Quindar founded?'), { kind: 'when', subject: 'Quindar', shape: 'when' });
  assert.equal(factQuestion('What is 17 * 23? Answer with the number only.'), null, 'an instruction after the question makes it a task');
  assert.equal(factQuestion('it is?'), null);
  assert.equal(factQuestion('How do I bake bread?'), null);
});

// ---------------------------------------------------------------- 3. routing
test('ask() routes a factual shape to memory and a math shape past it', async (t) => {
  const dir = plantStore('route');
  const ol = await fakeOllama(t, 'the model says something else entirely');
  const brain = newBrain('native-route');
  const o = { knowledge: dir, provider: 'ollama', model: 'fixture', base: ol.base, probeMs: 2000, route: 'direct', direct: false };
  for (const q of ['What is Zorblax?', 'Who is Zorblax?', 'Which is Zorblax?', 'Define Zorblax', 'Zorblax is?', 'What does Zorblax mean?']) {
    const a = await ask(brain, q, o);
    assert.equal(a.provenance.answer, 'memory', q);
    assert.equal(a.provenance.title, 'Zorblax', q);
    assert.equal(last(a), 'answer [knowledge "Zorblax"]: purple mineral', q);
    assert.equal(a.provenance.llm.provider, null, q);
  }
  const where = await ask(brain, 'Where is Quindar?', o);
  assert.equal(where.provenance.answer, 'memory');
  assert.equal(where.provenance.knowledge.kind, 'locate.where');
  assert.equal(last(where), 'answer [knowledge "Quindar"]: Veloria');
  const when = await ask(brain, 'When was Quindar founded?', o);
  assert.equal(when.provenance.answer, 'memory');
  assert.equal(last(when), 'answer [knowledge "Quindar"]: 1842');
  assert.equal(ol.tags + ol.generate, 0, 'the model was reached for a factual question');

  // The math shape goes past memory, even with a memory entry planted under its own key: the
  // tier is not asked, the planted entry is not read, and what answers is the exact path or,
  // for a wording solve() does not parse, the model.
  assert.equal(factQuestion('What is 17 * 23?'), null);
  assert.equal(factQuestion('What is the square root of 16?'), null);
  assert.equal(isMathSubject('17 times 23'), true);
  for (const s of ['Sin City', 'COVID-19', '2-methylpentane', 'Apollo 11', 'Tan Dun']) {
    assert.equal(isMathSubject(s), false, s);
    assert.equal(factQuestion('What is ' + s + '?').subject, s, s);
  }
  const planted = new DirectTable({ capacity: 8 });
  planted.set(factKey('17 * 23', 'what'), { source: 'memory', answer: 'a planted wrong answer', title: 'Planted', confidence: 1, item: -1 });
  assert.equal(directAnswer('What is 17 * 23?', { direct: planted, knowledge: dir }), null, 'the planted entry answered a math subject');
  const asked0 = KNOWLEDGE_TIER.asked;
  const m = await ask(brain, 'What is 17 * 23?', { ...o, direct: planted });
  console.log('route: math provenance=' + m.provenance.answer + ' tier asked +' + (KNOWLEDGE_TIER.asked - asked0) + ' model calls ' + ol.generate);
  assert.equal(KNOWLEDGE_TIER.asked, asked0, 'the tier was asked a math question');
  assert.ok(m.provenance.answer === 'model' || m.provenance.answer === 'model+exact', 'a math wording is answered by the model or by the math region, never by memory: got ' + m.provenance.answer);
  assert.equal(m.provenance.knowledge ?? null, null);
  assert.ok(ol.generate >= 1, 'the model was asked at least once; the math region makes several calls: ' + ol.generate);
  const genAfterMath = ol.generate;
  const exact = await ask(brain, 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: 17 * 23', { ...o, direct: planted });
  console.log('route: exact provenance=' + exact.provenance.answer + ' last=' + last(exact));
  assert.equal(exact.provenance.answer, 'exact');
  assert.equal(last(exact), '391');
  assert.equal(KNOWLEDGE_TIER.asked, asked0);
  assert.equal(ol.generate, genAfterMath, 'the model was asked a question the exact path answers');
});

// ---------------------------------------------------------------- 4. the floor
test('the floor: memory alone at or above it; below it the model is shown memory and the answer is model+memory', async (t) => {
  const dir = plantStore('floor');
  const ol = await fakeOllama(t, 'Blorp is a small town in Norway.');
  const brain = newBrain('native-floor');
  const o = { knowledge: dir, provider: 'ollama', model: 'fixture', base: ol.base, probeMs: 2000, route: 'direct', direct: false };

  const a = await ask(brain, 'What is Blorp?', o);
  const k = a.provenance.knowledge;
  console.log('floor: Blorp confidence=' + k.confidence + ' floor=' + KNOWLEDGE.floor + ' provenance=' + a.provenance.answer + ' generate=' + ol.generate);
  assert.ok(k.confidence < KNOWLEDGE.floor, 'confidence ' + k.confidence);
  assert.equal(k.above, false);
  assert.equal(a.provenance.answer, 'model+memory');
  assert.ok(ANSWER_PROVENANCE.includes('model+memory'));
  assert.equal(a.text, 'Blorp is a small town in Norway.');
  assert.equal(ol.generate, 1);
  assert.match(ol.systems[0], /knowledge "Blorp"/);
  assert.match(ol.systems[0], /below the confidence floor/);

  // The same question with the floor moved to zero: memory answers alone and the model is not asked.
  const b = await ask(brain, 'What is Blorp?', { ...o, knowledgeFloor: 0 });
  assert.equal(b.provenance.answer, 'memory');
  assert.equal(ol.generate, 1);

  // The tier off: the model alone, provenance model.
  const c = await ask(brain, 'What is Blorp?', { ...o, knowledge: false });
  assert.equal(c.provenance.answer, 'model');
  assert.equal(ol.generate, 2);

  // The direct table obeys the same floor: an entry below it does not answer.
  const table = new DirectTable({ capacity: 8 });
  table.set(factKey('Blorp'), { source: 'memory', answer: 'town', title: 'Blorp', confidence: 0.125, item: -1 });
  const skipped0 = DIRECT_TIER.skipped;
  assert.equal(directAnswer('What is Blorp?', { direct: table, knowledge: dir }), null);
  assert.equal(DIRECT_TIER.skipped, skipped0 + 1);
  const hit = directAnswer('What is Blorp?', { direct: table, knowledge: dir, knowledgeFloor: 0.125 });
  assert.ok(hit, 'at the floor the entry answers');
  assert.equal(hit.entry.answer, 'town');
});

// ---------------------------------------------------------------- 5. the table
test('the direct table: a hit, a miss, a fold collision and a probe collision, growth, save and load, the binding', () => {
  const t = new DirectTable({ capacity: 8 });
  assert.equal(t.cap, 16);
  const kz = factKey('Zorblax');
  const iz = t.set(kz, { source: 'memory', answer: 'purple mineral', title: 'Zorblax', confidence: 0.9, item: 7, note: 'first' });
  // hit and miss
  assert.equal(t.get(kz), iz);
  assert.equal(t.entry(t.get(kz)).answer, 'purple mineral');
  assert.equal(t.get(factKey('Blorp')), -1);
  assert.equal(t.get(factKey('Zorblax', 'where')), -1, 'where is not what');
  assert.notEqual(factKey('Zorblax', 'where').hi + ':' + factKey('Zorblax', 'where').lo, kz.hi + ':' + kz.lo, 'a where key has its own fold');
  // a fold collision: one bag of title words, two wordings. The fold is the same, the verifier is not.
  const a = factKey('The Beatles'), b = factKey('Beatles');
  assert.equal(a.hi, b.hi); assert.equal(a.lo, b.lo);
  assert.notEqual(a.vh + ':' + a.vl, b.vh + ':' + b.vl);
  const ia = t.set(a, { source: 'memory', answer: 'band', title: 'The Beatles', confidence: 1, item: 1 });
  assert.equal(t.get(b), -1, 'the other wording is not a hit before it is stored');
  const ib = t.set(b, { source: 'memory', answer: 'insects', title: 'Beatles', confidence: 1, item: 2 });
  assert.equal(t.stats.foldCollisions, 1);
  assert.equal(t.get(a), ia); assert.equal(t.get(b), ib);
  assert.equal(t.probe(b).foldCollision, true);
  assert.equal(t.get({ ...a, vl: (a.vl ^ 1) >>> 0 }), -1, 'a verifier off by one bit is a miss');
  // a probe collision: a different fold whose home slot is taken
  const home = t.home(kz.hi, kz.lo);
  let kp = null;
  for (let i = 0; i < 100000 && !kp; i++) { const k = textKey('probe question ' + i); if (t.home(k.hi, k.lo) === home && (k.hi !== kz.hi || k.lo !== kz.lo)) kp = k; }
  assert.ok(kp, 'a key with the same home slot');
  const pc0 = t.stats.probeCollisions;
  const ip = t.set(kp, { source: 'exact', answer: '42', note: 'method' });
  assert.equal(t.stats.probeCollisions, pc0 + 1);
  assert.equal(t.get(kp), ip);
  assert.ok(t.probe(kp).probes >= 2);
  assert.equal(t.get(kz), iz, 'the first key is still found');
  // replace, not insert, for the same key
  t.set(kz, { source: 'memory', answer: 'violet mineral', title: 'Zorblax', confidence: 0.9, item: 7 });
  assert.equal(t.get(kz), iz);
  assert.equal(t.entry(iz).answer, 'violet mineral');
  assert.equal(t.stats.replaced, 1);
  assert.throws(() => t.set(factKey('x'), { source: 'model', answer: 'no' }), /filled from exact or memory/);
  // growth keeps every key
  const keys = [];
  for (let i = 0; i < 300; i++) { const k = textKey('grow ' + i); keys.push(k); t.set(k, { source: 'exact', answer: String(i), note: 'grow' }); }
  assert.ok(t.stats.grows >= 1);
  assert.ok(t.n <= t.cap / 2, 'load stays at or under one half');
  keys.forEach((k, i) => assert.equal(t.entry(t.get(k)).answer, String(i)));
  assert.equal(t.get(kz), iz); assert.equal(t.get(a), ia); assert.equal(t.get(b), ib); assert.equal(t.get(kp), ip);
  // save and load
  const meta = { format: 2, articles: 43, items: 99, facts: 50, knowledgeBytes: 1234 };
  t.meta = bindingOf(meta, 0.2);
  const file = path.join(TMP, 'table.bin');
  const w = t.save(file);
  assert.ok(w.bytes > 0);
  assert.equal(fs.existsSync(file + '.tmp'), false);
  const back = DirectTable.load(file);
  assert.equal(back.n, t.n); assert.equal(back.cap, t.cap);
  for (const k of [kz, a, b, kp, ...keys]) assert.deepEqual(back.entry(back.get(k)), t.entry(t.get(k)));
  assert.equal(back.get(factKey('Blorp')), -1);
  assert.deepEqual(back.counts(), t.counts());
  assert.equal(boundTo(back, meta), true);
  assert.equal(boundTo(back, { ...meta, facts: 51 }), false, 'a table from another ingest is refused');
  assert.equal(boundTo(new DirectTable(), meta), false, 'an unbound table is refused');
});

// ---------------------------------------------------------------- 6. the direct step through ask()
test('the direct step answers first, in one lookup, with the tier\'s own answer and its nanoseconds; it learns an exact answer', async (t) => {
  const dir = plantStore('direct');
  const ol = await fakeOllama(t, 'the model says something else entirely');
  const brain = newBrain('native-direct');
  const ks = KnowledgeStore.open(dir);
  t.after(() => ks.close());
  const cols = await fillFromStore({ storeDir: dir, pool: KNOWLEDGE.pool, from: 0, to: ks.A, workers: 2, chunk: 10 });
  assert.equal(cols.n, ks.A, 'every title of the planted store has an entry');
  const table = tableFromColumns(cols, { meta: bindingOf(ks.meta, KNOWLEDGE.floor) });
  assert.equal(boundTo(table, ks.meta), true);
  // the workers' entries are the main thread's
  for (let i = 0; i < cols.n; i++) {
    const e = titleEntry(ks, cols.asked[i], KNOWLEDGE.pool);
    assert.equal(cols.answers[i], e.answer, cols.asked[i]);
    assert.equal(cols.titles[i], e.title, cols.asked[i]);
    assert.equal(cols.conf[i], Math.fround(e.confidence), cols.asked[i]);
  }
  const o = { knowledge: dir, provider: 'ollama', model: 'fixture', base: ol.base, probeMs: 2000, route: 'direct' };
  const tier = await ask(brain, 'What is Zorblax?', { ...o, direct: false });
  const hits0 = DIRECT_TIER.hits;
  const d = await ask(brain, 'What is Zorblax?', { ...o, direct: table });
  console.log('direct: provenance=' + d.provenance.answer + ' source=' + d.provenance.source + ' lookupNs=' + d.provenance.lookupNs + ' keyNs=' + d.provenance.keyNs + ' first line: ' + d.text.split('\n')[0]);
  assert.equal(d.provenance.answer, 'direct');
  assert.equal(d.provenance.source, 'memory');
  assert.equal(d.route, 'lookup');
  assert.equal(d.provenance.title, 'Zorblax');
  assert.equal(last(d), 'answer [direct "Zorblax"]: purple mineral');
  assert.equal(last(d).split(']: ')[1], last(tier).split(']: ')[1], 'the table gives the tier\'s answer');
  assert.ok(Number.isInteger(d.provenance.lookupNs) && d.provenance.lookupNs >= 0);
  assert.match(d.text.split('\n')[0], /one lookup in \d+ ns/, 'the answer prints its nanoseconds');
  assert.equal(d.provenance.llm.provider, null);
  assert.equal(DIRECT_TIER.hits, hits0 + 1);
  for (const q of ['Who is Zorblax?', 'Define Zorblax', 'Zorblax is?', 'What does Zorblax mean?']) {
    assert.equal((await ask(brain, q, { ...o, direct: table })).provenance.answer, 'direct', q);
  }
  assert.equal(ol.tags + ol.generate, 0, 'the model was reached');
  // below the floor in the table: not a hit, and the ask goes on to the tier and the model
  const blorp = await ask(brain, 'What is Blorp?', { ...o, direct: table });
  assert.equal(blorp.provenance.answer, 'model+memory');
  // the tier off, or prose asked for: a memory entry never answers
  assert.equal(directAnswer('What is Zorblax?', { direct: table, knowledge: false }), null);
  assert.equal(directAnswer('What is Zorblax?', { direct: table, knowledge: dir, prose: true }), null);
  assert.equal(directAnswer('What is Zorblax?', { direct: false, knowledge: dir }), null);
  // a planted store that is not the default one never loads the default table
  assert.equal(directAnswer('What is Zorblax?', { knowledge: dir }), null);

  // learning: an exact answer goes into a learning table and comes back by its text key
  const learn = new DirectTable({ capacity: 8, learn: true });
  const q = 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: 2 + 3';
  const first = await ask(brain, q, { ...o, direct: learn });
  assert.equal(first.provenance.answer, 'exact');
  assert.equal(learn.counts().exact, 1);
  const again = await ask(brain, q, { ...o, direct: learn });
  assert.equal(again.provenance.answer, 'direct');
  assert.equal(again.provenance.source, 'exact');
  assert.equal(last(again), last(first));
  assert.equal(again.provenance.method, first.provenance.method);
  assert.equal((await ask(brain, q.replace('2 + 3', '3 + 2'), { ...o, direct: learn })).provenance.answer, 'exact', 'another question is not a hit');
  assert.equal(ol.generate, 1, 'only the Blorp question reached the model');
});

// ---------------------------------------------------------------- 7. the byte budget
function randomHv(d, seed) {
  const r = new RNG(seed), v = new Int8Array(d);
  for (let i = 0; i < d; i++) v[i] = (r.u32() & 1) ? 1 : -1;
  return v;
}

test('the semantic tier is bounded by a declared byte budget: it evicts the weakest, prints keys held and bytes, and a count cap still binds', () => {
  const d = 1024;
  const probe = new SemanticMemory({ d });
  const bpk = probe.bytesPerKey(true);
  const logged = [];
  const s = new SemanticMemory({ d, budgetBytes: 3 * bpk + 1, log: (l) => logged.push(l) });
  assert.equal(s.capacity, 3);
  for (let i = 0; i < 5; i++) s.learn('k' + i, randomHv(d, 'budget ' + i), { strength: i + 1 });
  const b = s.budget();
  console.log('budget: ' + b.line);
  assert.equal(b.keys, 3);
  assert.equal(s.size(), 3);
  assert.equal(b.dropped, 2);
  assert.ok(b.bytes <= b.budgetBytes, b.bytes + ' bytes over ' + b.budgetBytes);
  assert.equal(b.bytes, 3 * bpk);
  assert.equal(logged.length, 2, 'the first eviction and the second (a power of two) are printed');
  assert.match(logged[0], /^semantic tier: 3 keys held, \d+ bytes of a \d+ byte budget .*1 dropped$/);
  assert.match(logged[1], /2 dropped$/);
  assert.match(b.line, /3 keys held, \d+ bytes/);
  assert.equal(s.byName.has('k0'), false, 'the weakest went first');
  assert.equal(s.byName.has('k4'), true);

  // the default: 256 MB, not 4,096 keys (unless the environment declares another)
  if (process.env.BRAIN_SEMANTIC_BUDGET_MB === undefined) {
    const def = new SemanticMemory({});
    assert.equal(def.budgetBytes, 256 * 1048576);
    assert.equal(def.capacity, Math.floor(256 * 1048576 / def.bytesPerKey(true)));
    assert.ok(def.capacity > LEGACY_CAPACITY, 'room for ' + def.capacity + ' keys');
    assert.equal(def.countCap, null);
  }
  // the flag: the environment's BRAIN_SEMANTIC_BUDGET_MB, and budgetMb over it
  const saved = process.env.BRAIN_SEMANTIC_BUDGET_MB;
  try {
    process.env.BRAIN_SEMANTIC_BUDGET_MB = '3';
    assert.equal(semanticBudgetBytes({}), 3 * 1048576);
    assert.equal(semanticBudgetBytes({ budgetMb: 2 }), 2 * 1048576);
    assert.equal(semanticBudgetBytes({ budgetBytes: 5 }), 5);
  } finally {
    if (saved === undefined) delete process.env.BRAIN_SEMANTIC_BUDGET_MB; else process.env.BRAIN_SEMANTIC_BUDGET_MB = saved;
  }
  // a count cap asked for is still honoured beside the budget
  const capped = new SemanticMemory({ d, capacity: 2 });
  for (let i = 0; i < 4; i++) capped.learn('c' + i, randomHv(d, 'cap ' + i));
  assert.equal(capped.size(), 2);
  // a checkpoint keeps its budget; an old one's 4096 was the default, not a choice
  const back = SemanticMemory.from(s.serialize());
  assert.equal(back.budgetBytes, s.budgetBytes);
  assert.equal(back.bytes(), s.bytes());
  const old = { ...s.serialize(), capacity: LEGACY_CAPACITY };
  delete old.budgetBytes;
  assert.equal(SemanticMemory.from(old).countCap, null);
});
