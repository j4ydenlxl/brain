// test/web-ask.test.mjs: the prompt box on dilation.dev (web/ask.mjs, queue item 12).
// Board 18 builder: the page now posts a refused prompt once to /api/ask; a tab answer still makes no request.
// The page must run the organism's own bytes, answer what the CLI answers, and reach nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { generateAsk, EXAMPLES, MODULES, ROOT, DIST } from '../web/ask.mjs';
import { solve } from '../act/solve.mjs';

const sha = (f) => crypto.createHash('sha256').update(readFileSync(f)).digest('hex');
const built = generateAsk();

test('every organism module the page imports is a byte for byte copy of its source, with its sha256 in the manifest', () => {
  assert.ok(built.modules >= 2, 'exact-read and exact at least');
  for (const f of built.manifest.files) {
    assert.ok(MODULES.includes(f.file));
    assert.equal(f.sha256, sha(path.join(ROOT, f.file)), f.file + ' source');
    assert.equal(f.sha256, sha(path.join(DIST, 'organism', f.file)), f.file + ' copy');
  }
  const onDisk = JSON.parse(readFileSync(path.join(DIST, 'organism', 'manifest.json'), 'utf8'));
  assert.deepEqual(onDisk.files, built.manifest.files);
});

test('the copied reader answers every page example exactly as act/solve.mjs does, and refuses the novel one', async () => {
  const read = await import(pathToFileURL(path.join(DIST, 'organism', 'act', 'exact-read.mjs')).href);
  let word = null;
  if (built.manifest.files.some((f) => f.file === 'act/word.mjs')) word = (await import(pathToFileURL(path.join(DIST, 'organism', 'act', 'word.mjs')).href)).readWord;
  for (const q of EXAMPLES) {
    const page = read.readExact(q, word ? { word } : {});
    const cli = solve(q);
    assert.equal(page ? page.answer : null, cli ? cli.answer : null, q);
    if (page) assert.equal(page.method, cli.method, q);
  }
  assert.equal(read.readExact('what is 17 times 23').answer, '391');
  assert.equal(read.readExact('write a poem about the sea'), null);
  assert.deepEqual(read.spokenLeftover('write a poem about the sea'), ['write', 'a', 'poem', 'about', 'the', 'sea']);
});

test('the page and the landing box import only the organism copies; the landing box makes no request; the page has ONE fetch, to /api/ask', () => {
  const pages = [readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8'), readFileSync(path.join(ROOT, 'web', 'src', 'index.html'), 'utf8')];
  for (const html of pages) {
    for (const m of html.matchAll(/import\s*(?:\{[^}]*\}\s*from\s*)?\(?\s*['"]([^'"]+)['"]/g)) assert.match(m[1], /^\.{1,2}\/organism\//, 'import ' + m[1]);
    assert.doesNotMatch(html, /XMLHttpRequest|WebSocket|sendBeacon|EventSource/);
  }
  assert.doesNotMatch(pages[1], /\bfetch\(/, 'the landing box answers in the tab or links to /ask');
  assert.match(pages[1], /id="askf"/);
  assert.match(pages[1], /href="\/ask"/);
  // the ask page (board 18 builder): exactly one fetch call, and its target is the same origin /api/ask
  const calls = [...pages[0].matchAll(/\bfetch\(([^,)]*)/g)].map((m) => m[1].trim());
  assert.deepEqual(calls, ['API']);
  assert.match(pages[0], /const API = '\/api\/ask';/);
  assert.doesNotMatch(pages[0], /https?:\/\/[^"'\s]*\/api\//, 'no other origin');
  for (const s of ['sk-', 'sk_', 'Bearer ', 'BRAIN_LLM_KEY=']) assert.ok(!pages[0].includes(s), s);
});

// The page script, run against a planted fetch and a small DOM: the code path, not a live network.
async function runPage() {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  let src = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const mods = {};
  for (const f of built.manifest.files) mods['../organism/' + f.file] = await import(pathToFileURL(path.join(DIST, 'organism', f.file)).href);
  src = src.replace(/import\s*\{([^}]*)\}\s*from\s*'([^']+)';/g, (m, names, from) => 'const {' + names + '} = __mods[' + JSON.stringify(from) + '];');
  const calls = [];
  let reply = null;
  const fetch = async (url, init) => { calls.push({ url, init }); return reply; };
  const el = (id) => ({ id, value: '', children: [], innerHTML: '', dataset: {}, addEventListener() {}, focus() {}, remove() {}, appendChild(c) { this.children.push(c); }, scrollIntoView() {} });
  const term = el('term'), nodes = { '#hello': el('hello'), '#term': term, '#f': el('f'), '#q': el('q') };
  const document = {
    querySelector: (s) => nodes[s] || null,
    querySelectorAll: () => [],
    createElement: () => {
      const e = el('entry');
      e.querySelector = (s) => (s === '.srv' ? { set outerHTML(v) { e.innerHTML = e.innerHTML.replace(/<div class="srv foot" data-server-pending="1">[^<]*<\/div>/, v); } } : null);
      return e;
    },
  };
  const window = {};
  const AsyncFunction = (async () => {}).constructor;
  await new AsyncFunction('__mods', 'document', 'window', 'location', 'fetch', src)(mods, document, window, { search: '' }, fetch);
  return { ask: window.__brainAsk.ask, calls, term, setReply: (r) => { reply = r; } };
}
const respond = (status, json, retry = null) => ({ status, headers: { get: (k) => (k.toLowerCase() === 'retry-after' ? retry : null) }, json: async () => json });

test('a tab answer makes no request; a refused prompt makes exactly one POST to /api/ask and prints the server footer', async () => {
  const p = await runPage();
  const t = await p.ask('what is 17 times 23');
  assert.equal(t.tab, true);
  assert.equal(t.answer, '391');
  assert.equal(p.calls.length, 0, 'a tab answer made a request');
  assert.match(p.term.children[0].innerHTML, /data-answer="391"/);
  p.setReply(respond(200, { ok: true, text: 'nothing in memory matches write, poem, about, sea.', route: 'direct', provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, llm: { provider: 'null', model: 'null', ok: true, reason: 'the model cell is not configured on this host', fellBack: null }, serverUs: 704, host: 'local', knowledge: { ready: false, why: 'no finished ingest' } }));
  const r = await p.ask('write a poem about the sea');
  assert.equal(r.tab, false);
  assert.equal(p.calls.length, 1);
  assert.equal(p.calls[0].url, '/api/ask');
  assert.equal(p.calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(p.calls[0].init.body), { prompt: 'write a poem about the sea' });
  const h = p.term.children[1].innerHTML;
  assert.match(h, /data-route="refused"/);
  assert.match(h, /data-server-done="1" data-status="200" data-srv-route="direct" data-srv-provenance="memory"/);
  assert.match(h, /704 us on the server/);
  assert.match(h, /round trip \d+ ms in this tab/);
  assert.match(h, /model none: the model cell is not configured on this host/);
  assert.match(h, /knowledge store on the server: absent/);
  p.setReply(respond(429, { ok: false, error: 'rate limited (per client: 20 asks a minute): retry after 3 s' }, '3'));
  await p.ask('write a haiku');
  assert.equal(p.calls.length, 2);
  assert.match(p.term.children[2].innerHTML, /the server answered 429: .*retry after 3 s/);
  await p.ask('2 to the power of 10');
  assert.equal(p.calls.length, 2, 'a tab answer after a server answer made a request');
});
