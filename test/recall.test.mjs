// test/recall.test.mjs: the knowledge tier on the ask path (act/prompt.mjs, Board 10 item recall).
//
// Three claims, each against a store planted here with memory/knowledge.mjs KnowledgeWriter (the
// same writer tools/ingest-wiki.mjs uses), so nothing depends on the 388 MB Wikipedia store:
//   1. a planted fact is answered from memory, provenance memory, with its article title, and no
//      model cell is reached (a fake ollama counts every request it receives)
//   2. a question whose confidence is below the floor falls through to the model cell, and the
//      model is shown what the tier recalled
//   3. the store is not opened when it is absent, unfinished or damaged, never at import, and
//      never for a prompt that is not a definitional question
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { attachMemory } from '../memory/index.mjs';
import { KnowledgeWriter } from '../memory/knowledge.mjs';
import { resetProbeCache } from '../act/llm.mjs';
import { installAskRegion } from '../act/region.mjs';
import {
  ask, ASK_EVENT, KNOWLEDGE, KNOWLEDGE_TIER, closeKnowledge, knowledgeQuestion, knowledgeReady,
} from '../act/prompt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-recall-'));
// The stores hold open file descriptors; Windows will not delete a directory under them.
after(() => { closeKnowledge(); fs.rmSync(TMP, { recursive: true, force: true }); });

// Blorp's lead offers eight different things it is, one sentence each, so no answer can hold
// more than a small share of the score: the confidence is far below any sensible floor.
const BLORP = ['a town in Norway', 'a river', 'a song', 'a game', 'a dance', 'a bird', 'a card', 'a drink'];

function plantStore(name, { finish = true } = {}) {
  const dir = path.join(TMP, name);
  const w = new KnowledgeWriter(dir, { source: 'test/recall.test.mjs' });
  w.addArticle({ title: 'Zorblax', pageId: 1, sections: [{ heading: '', sentences: ['Zorblax is a purple mineral found on the planet Mars.', 'Zorblax glows in the dark.'] }], categories: ['Minerals'] });
  w.addArticle({ title: 'Blorp', pageId: 2, sections: [{ heading: '', sentences: BLORP.map((x) => 'Blorp is ' + x + '.') }], categories: [] });
  for (let i = 0; i < 40; i++) {
    w.addArticle({ title: 'Filler ' + i, pageId: 10 + i, sections: [{ heading: '', sentences: ['Filler ' + i + ' is a placeholder page for the test.'] }], categories: ['Fillers'] });
  }
  if (finish) w.finish({ complete: true });
  else for (const k of Object.keys(w.fd)) fs.closeSync(w.fd[k]); // an ingest stopped before finish(): no meta.json
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

// ---------------------------------------------------------------- the shape
test('only a definitional question is asked of the tier', () => {
  assert.equal(knowledgeQuestion('What is Zorblax?'), 'Zorblax');
  assert.equal(knowledgeQuestion('who was Albert Einstein'), 'Albert Einstein');
  assert.equal(knowledgeQuestion('What is St. Louis?'), 'St. Louis', 'a period inside the subject is part of it');
  // An instruction after the question makes it a task, not a definition.
  assert.equal(knowledgeQuestion('What is 17 * 23? Answer with the number only.'), null);
  assert.equal(knowledgeQuestion('what does the gate do with a proposal'), null);
  assert.equal(knowledgeQuestion('Here are the first terms of an exact sequence: 1, 2, 3. What is the next term?'), null);
  assert.equal(knowledgeQuestion(''), null);
});

// ---------------------------------------------------------------- 1. answered from memory
test('a planted fact is answered from the knowledge tier with provenance memory and its title, and no model cell is reached', async (t) => {
  const dir = plantStore('planted');
  const ol = await fakeOllama(t, 'the model says something else entirely');
  const brain = newBrain('recall-planted');
  const opens0 = KNOWLEDGE_TIER.opens;

  const a = await ask(brain, 'What is Zorblax?', { knowledge: dir, provider: 'ollama', model: 'fixture', base: ol.base, probeMs: 2000, route: 'direct' });
  console.log('planted: provenance=' + a.provenance.answer + ' tier=' + a.provenance.tier + ' title=' + a.provenance.title
    + ' answer=' + (a.knowledge && a.knowledge.answer) + ' confidence=' + (a.knowledge && a.knowledge.confidence)
    + ' floor=' + KNOWLEDGE.floor + ' route=' + a.route + ' ollama tags=' + ol.tags + ' generate=' + ol.generate);
  assert.equal(KNOWLEDGE_TIER.opens, opens0 + 1, 'the store was opened once, by this question');
  assert.equal(a.provenance.answer, 'memory');
  assert.equal(a.from, 'memory');
  assert.equal(a.provenance.tier, 'knowledge');
  assert.equal(a.provenance.title, 'Zorblax');
  assert.equal(a.knowledge.title, 'Zorblax');
  assert.equal(a.knowledge.answer, 'purple mineral');
  assert.ok(a.knowledge.confidence >= KNOWLEDGE.floor, 'confidence ' + a.knowledge.confidence);
  assert.equal(a.text.split('\n').pop(), 'answer [knowledge "Zorblax"]: purple mineral', 'the answer line is last');
  assert.equal(a.route, 'knowledge');
  assert.equal(a.exact, null);
  assert.equal(a.cites[0].source, 'knowledge');
  assert.equal(a.cites[0].title, 'Zorblax');
  // No model cell: the llm record says why, and the fake ollama saw no request at all.
  assert.equal(a.provenance.llm.provider, null);
  assert.match(a.provenance.llm.reason, /not asked: the knowledge tier/);
  assert.equal(ol.tags + ol.generate, 0, 'the model was reached ' + (ol.tags + ol.generate) + ' times');
  // The ledger line carries the hash and the confidence, never the words or the title.
  const asked = brain.ledger.recent(10, ASK_EVENT);
  assert.equal(asked.length, 1);
  assert.equal(asked[0].route, 'knowledge');
  assert.equal(asked[0].tier, 'knowledge');
  assert.equal(JSON.stringify(asked[0]).toLowerCase().includes('zorblax'), false, JSON.stringify(asked[0]));

  // The same question through the region route: answered before the region, so its model cell
  // is never asked either.
  const region = newBrain('recall-planted-region');
  installAskRegion(region);
  const r = await ask(region, 'What is Zorblax?', { knowledge: dir, provider: 'ollama', model: 'fixture', base: ol.base, probeMs: 2000, route: 'region' });
  assert.equal(r.provenance.answer, 'memory');
  assert.equal(r.provenance.title, 'Zorblax');
  assert.equal(r.route, 'knowledge');
  assert.equal(region.cell('ask.llm').state.asked, 0);
  assert.equal(ol.tags + ol.generate, 0);
  assert.equal(KNOWLEDGE_TIER.opens, opens0 + 1, 'a second question on the same store does not open it again');
});

// ---------------------------------------------------------------- 2. below the floor
test('a question below the confidence floor falls through to the model cell, which is shown what the tier recalled', async (t) => {
  const dir = plantStore('below');
  const ol = await fakeOllama(t, 'Blorp is a small town in Norway.');
  const brain = newBrain('recall-below');

  const a = await ask(brain, 'What is Blorp?', { knowledge: dir, provider: 'ollama', model: 'fixture', base: ol.base, probeMs: 2000, route: 'direct' });
  const k = a.provenance.knowledge;
  console.log('below: confidence=' + k.confidence + ' floor=' + k.floor + ' offered=' + k.answers + ' answers, top=' + k.answer
    + ' provenance=' + a.provenance.answer + ' generate=' + ol.generate);
  assert.ok(k, 'the attempt is in the record');
  assert.equal(k.above, false);
  assert.equal(k.title, 'Blorp');
  assert.ok(k.answers >= BLORP.length - 1, 'the tier offered ' + k.answers + ' competing answers');
  assert.ok(k.confidence < KNOWLEDGE.floor, 'confidence ' + k.confidence + ' is below the floor ' + KNOWLEDGE.floor);
  assert.equal(a.provenance.answer, 'model+memory');
  assert.equal(a.from, 'llm');
  assert.equal(a.text, 'Blorp is a small town in Norway.');
  assert.equal(a.route, 'direct');
  assert.equal(ol.generate, 1, 'the model cell was asked exactly once');
  assert.match(ol.systems[0], /knowledge "Blorp"/, 'the model saw what the tier recalled');
  assert.match(ol.systems[0], /below the confidence floor/);

  // A question the tier has nothing for at all: confidence 0, the model is asked again.
  const none = await ask(brain, 'What is Qwyjibo?', { knowledge: dir, provider: 'ollama', model: 'fixture', base: ol.base, probeMs: 2000, route: 'direct' });
  assert.equal(none.provenance.knowledge.confidence, 0);
  assert.equal(none.provenance.knowledge.above, false);
  assert.equal(none.provenance.answer, 'model');
  assert.equal(ol.generate, 2);
});

// ---------------------------------------------------------------- 3. not opened
test('the store is not opened when it is absent, unfinished or damaged, nor for a prompt that is not a definitional question', async () => {
  const brain = newBrain('recall-absent');
  const opens0 = KNOWLEDGE_TIER.opens;

  // Absent: the tier is skipped and the ask goes on exactly as before this board.
  const missing = path.join(TMP, 'no-such-store');
  assert.equal(knowledgeReady(missing).ok, false);
  const a = await ask(brain, 'What is Zorblax?', { knowledge: missing, provider: 'null', route: 'direct' });
  assert.equal(KNOWLEDGE_TIER.opens, opens0, 'an absent store was opened');
  assert.equal(a.provenance.knowledge, undefined);
  assert.equal(a.route, 'direct');
  assert.equal(a.provenance.llm.provider, 'null', 'the model cell was asked, as it always was');

  // Unfinished: the writer ran and never wrote meta.json.
  const partial = plantStore('unfinished', { finish: false });
  assert.equal(fs.existsSync(path.join(partial, 'records.bin')), true);
  assert.match(knowledgeReady(partial).reason, /no finished ingest/);
  await ask(brain, 'What is Zorblax?', { knowledge: partial, provider: 'null', route: 'direct' });
  assert.equal(KNOWLEDGE_TIER.opens, opens0, 'an unfinished ingest was opened');

  // Damaged, or a second ingest rewriting it: a file is not the size meta.json lists.
  const damaged = plantStore('damaged');
  fs.truncateSync(path.join(damaged, 'records.bin'), 10);
  assert.match(knowledgeReady(damaged).reason, /records\.bin is 10 bytes, meta\.json says/);
  await ask(brain, 'What is Zorblax?', { knowledge: damaged, provider: 'null', route: 'direct' });
  assert.equal(KNOWLEDGE_TIER.opens, opens0, 'a damaged store was opened');

  // Present but asked only prompts of another shape: still not opened. Then one definitional
  // question opens it, which is what makes the counter a measurement.
  const lazy = plantStore('lazy');
  const exact = await ask(brain, 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: 2 + 3', { knowledge: lazy, provider: 'null', route: 'direct' });
  assert.equal(exact.provenance.answer, 'exact');
  await ask(brain, 'what does the gate do with a proposal', { knowledge: lazy, provider: 'null', route: 'direct' });
  assert.equal(KNOWLEDGE_TIER.opens, opens0, 'a prompt that is not a definitional question opened the store');
  const opened = await ask(brain, 'What is Zorblax?', { knowledge: lazy, provider: 'null', route: 'direct' });
  assert.equal(opened.provenance.title, 'Zorblax');
  assert.equal(KNOWLEDGE_TIER.opens, opens0 + 1);

  // Off: knowledge:false never opens anything, even for a store that is ready.
  const off = await ask(brain, 'What is Zorblax?', { knowledge: false, provider: 'null', route: 'direct' });
  assert.equal(off.provenance.knowledge, undefined);
  assert.equal(off.route, 'direct');
});

test('importing act/prompt.mjs opens no store', () => {
  // A fresh process: the counters are read straight after the import and nothing else.
  const url = pathToFileURL(path.join(ROOT, 'act', 'prompt.mjs')).href;
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', `const m = await import(${JSON.stringify(url)}); console.log(JSON.stringify(m.KNOWLEDGE_TIER));`], { encoding: 'utf8', timeout: 60_000 });
  assert.equal(r.status, 0, r.stderr);
  const tier = JSON.parse(r.stdout.trim().split('\n').pop());
  assert.deepEqual(tier, { opens: 0, openFailures: 0, asked: 0, answered: 0, below: 0 });
});
