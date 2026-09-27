// test/web-ask.test.mjs: the prompt box on dilation.dev (web/ask.mjs, queue item 12).
// Board 18 builder: the page now posts a refused prompt once to /api/ask; a tab answer still makes no request.
// Board 25 (item tab-converse, his 2026-09-27 09:28 EDT "Yeah but i said hey to it and it said it couldnt
// respond"): the conversation region runs in the tab FIRST, a refused prompt shows the server block before
// the tab's refusal lines, and a server answer prints once.
// The page must run the organism's own bytes, answer what the CLI answers, and reach nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { generateAsk, EXAMPLES, MODULES, ROOT, DIST, PENDING_LINE, refusedHtml, serverHtml, answerOnce, tabNativeHtml, clock } from '../web/ask.mjs';
import { solve } from '../act/solve.mjs';
import { converse } from '../act/converse.mjs';

const sha = (f) => crypto.createHash('sha256').update(readFileSync(f)).digest('hex');
const built = generateAsk();
const count = (hay, needle) => hay.split(needle).length - 1;
const ASK_PAGE_CAP = 32768;     // the /ask page alone
const ASK_TOTAL_CAP = 262144;   // the page plus every organism module it imports

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

test('the manifest carries act/converse.mjs with the sha256 of the repository file, and the page lists it beside the others', () => {
  assert.ok(MODULES.includes('act/converse.mjs'));
  const c = built.manifest.files.find((f) => f.file === 'act/converse.mjs');
  assert.ok(c, 'act/converse.mjs is in the manifest');
  assert.equal(c.sha256, sha(path.join(ROOT, 'act', 'converse.mjs')));
  assert.equal(c.bytes, readFileSync(path.join(ROOT, 'act', 'converse.mjs')).length);
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  for (const f of built.manifest.files) assert.ok(html.includes('<span class="port">' + f.file + ' ' + f.sha256.slice(0, 12) + '</span>'), f.file + ' listed');
  console.log('manifest  ' + built.manifest.files.map((f) => f.file + ' ' + f.sha256.slice(0, 12)).join(', '));
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

test('the copied conversation region answers every page example exactly as act/converse.mjs does, and carries no digit prompt', async () => {
  const copy = await import(pathToFileURL(path.join(DIST, 'organism', 'act', 'converse.mjs')).href);
  let carried = 0;
  for (const q of EXAMPLES.concat(['hey, how are you', 'tell me a joke', 'Hey', 'yo'])) {
    const a = copy.converse(q), b = converse(q);
    assert.equal(a ? a.answer : null, b ? b.answer : null, q);
    assert.equal(a ? a.kind : null, b ? b.kind : null, q);
    if (a) carried++;
    // the region never shadows the exact reader: a prompt the exact reader answers is not a turn
    if (solve(q)) assert.equal(a, null, 'the region shadowed ' + q);
  }
  assert.ok(carried >= 4, 'hey, who are you, hey how are you and tell me a joke at least: ' + carried);
  assert.equal(copy.converse('hey').kind, 'greeting');
  assert.equal(copy.converse('who are you').kind, 'identity');
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

test('the generated page imports converse from ../organism/act/converse.mjs and calls it before readExact', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  const src = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  assert.match(src, /^import \{ converse \} from '\.\.\/organism\/act\/converse\.mjs';$/m);
  const body = src.slice(src.indexOf('async function ask(q)'));
  assert.ok(body.length > 100, 'the ask function is in the page');
  const iConverse = body.indexOf('converse(q)'), iExact = body.indexOf('readExact(q, opts)'), iServer = body.indexOf('server(q)');
  assert.ok(iConverse > 0, 'ask() calls converse(q)');
  assert.ok(iExact > iConverse, 'converse(q) at ' + iConverse + ' comes before readExact(q, opts) at ' + iExact);
  assert.ok(iServer > iExact, 'the server comes after the exact reader: ' + iServer + ' > ' + iExact);
  console.log('page order  converse(q) at ' + iConverse + ', readExact(q, opts) at ' + iExact + ', server(q) at ' + iServer + ' in ask()');
});

test('the one-click prompts carry "hey" and "who are you" ahead of the exact ones, and the intro names the conversation region', () => {
  assert.deepEqual(EXAMPLES.slice(0, 2), ['hey', 'who are you']);
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  const iHey = html.indexOf('data-q="hey"'), iWho = html.indexOf('data-q="who are you"'), iExact = html.indexOf('data-q="what is 17 times 23"');
  assert.ok(iHey > 0 && iWho > iHey && iExact > iWho, 'chip order ' + iHey + ' ' + iWho + ' ' + iExact);
  assert.match(html, /conversation region/);
});

test('size cap and phone width: the page is small, and nothing in it is wider than a 375 px phone', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  const bytes = Buffer.byteLength(html);
  const total = bytes + built.manifest.files.reduce((k, f) => k + f.bytes, 0);
  assert.ok(bytes < ASK_PAGE_CAP, 'ask page ' + bytes + ' bytes over ' + ASK_PAGE_CAP);
  assert.ok(total < ASK_TOTAL_CAP, 'ask page plus modules ' + total + ' bytes over ' + ASK_TOTAL_CAP);
  console.log('size  ask/index.html ' + bytes + ' bytes (cap ' + ASK_PAGE_CAP + '), with the organism modules ' + total + ' bytes (cap ' + ASK_TOTAL_CAP + ')');
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  // no fixed width, min-width or flex-basis in px wider than the phone's content box (375 minus two 16 px gutters)
  for (const m of css.matchAll(/(?:^|[;{\s])(width|min-width|flex-basis)\s*:\s*(\d+)px/g)) assert.ok(Number(m[2]) <= 343, m[1] + ' ' + m[2] + 'px');
  assert.doesNotMatch(css, /white-space\s*:\s*(nowrap|pre)\s*;/, 'no unwrapped line');
  assert.match(css, /#term \{[^}]*overflow-wrap: anywhere/);
  assert.match(css, /\.entry pre \{[^}]*white-space: pre-wrap/);
  assert.match(css, /#q \{[^}]*min-width: 0/);
  assert.match(css, /#q \{[^}]*font-size: 16px/, 'a phone does not zoom the box on focus');
  assert.match(css, /\.chips \{[^}]*flex-wrap: wrap/);
  assert.match(css, /nav \{[^}]*flex-wrap: wrap/);
  assert.match(css, /\.chip \{[^}]*max-width: 100%/);
  assert.match(css, /main \{[^}]*padding: \d+px 16px/);
});

// The page script, run against a planted fetch and a small DOM: the code path, not a live network.
async function runPage({ order = null } = {}) {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  let src = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const mods = {};
  for (const f of built.manifest.files) mods['../organism/' + f.file] = await import(pathToFileURL(path.join(DIST, 'organism', f.file)).href);
  if (order) {
    // record the FIRST calls of each reader, in the order the page makes them (behaviour, not text)
    const rec = (name, fn) => (...a) => { if (order.length < 64) order.push(name); return fn(...a); };
    const cv = mods['../organism/act/converse.mjs'], ex = mods['../organism/act/exact-read.mjs'];
    mods['../organism/act/converse.mjs'] = { ...cv, converse: rec('converse', cv.converse) };
    mods['../organism/act/exact-read.mjs'] = { ...ex, readExact: rec('readExact', ex.readExact) };
  }
  src = src.replace(/import\s*\{([^}]*)\}\s*from\s*'([^']+)';/g, (m, names, from) => 'const {' + names + '} = __mods[' + JSON.stringify(from) + '];');
  const calls = [];
  let reply = null;
  const fetch = async (url, init) => { calls.push({ url, init }); if (reply instanceof Error) throw reply; return reply; };
  const el = (id) => ({ id, value: '', children: [], innerHTML: '', dataset: {}, addEventListener() {}, focus() {}, remove() {}, appendChild(c) { this.children.push(c); }, scrollIntoView() {} });
  const term = el('term'), nodes = { '#hello': el('hello'), '#term': term, '#f': el('f'), '#q': el('q') };
  const document = {
    querySelector: (s) => nodes[s] || null,
    querySelectorAll: () => [],
    createElement: () => {
      const e = el('entry');
      e.querySelector = (s) => (s === '.srv' ? { set outerHTML(v) { e.innerHTML = e.innerHTML.replace(/<div class="srv pending acc" data-server-pending="1">[^<]*<\/div>/, v); } } : null);
      return e;
    },
  };
  const window = {};
  const AsyncFunction = (async () => {}).constructor;
  await new AsyncFunction('__mods', 'document', 'window', 'location', 'fetch', src)(mods, document, window, { search: '' }, fetch);
  return { ask: window.__brainAsk.ask, calls, term, setReply: (r) => { reply = r; } };
}
const respond = (status, json, retry = null) => ({ status, headers: { get: (k) => (k.toLowerCase() === 'retry-after' ? retry : null) }, json: async () => json });
const SERVER_ONLY = 'summarise the history of rome';

test('a tab answer makes no request; a refused prompt makes exactly one POST to /api/ask and prints the server footer', async () => {
  assert.equal(converse(SERVER_ONLY), null, 'the server-only prompt is not a turn');
  assert.equal(solve(SERVER_ONLY), null, 'the server-only prompt is not exact');
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
  assert.equal(count(h, 'nothing in memory matches write, poem, about, sea.'), 1);
  p.setReply(respond(429, { ok: false, error: 'rate limited (per client: 20 asks a minute): retry after 3 s' }, '3'));
  await p.ask(SERVER_ONLY);
  assert.equal(p.calls.length, 2);
  assert.match(p.term.children[2].innerHTML, /the server answered 429: .*retry after 3 s/);
  await p.ask('2 to the power of 10');
  assert.equal(p.calls.length, 2, 'a tab answer after a server answer made a request');
});

test('"hey" is answered IN THE TAB by the conversation region: route direct, provenance native, model none, tokens 0, no request, the clock printed', async () => {
  const p = await runPage();
  for (const q of ['hey', 'who are you', 'hey, how are you', 'write a haiku']) {
    const want = converse(q);
    assert.ok(want, q + ' is a turn');
    const n0 = p.calls.length;
    const t = await p.ask(q);
    assert.equal(p.calls.length, n0, q + ' made a request');
    assert.equal(t.tab, true, q);
    assert.equal(t.route, 'direct');
    assert.equal(t.provenance, 'native');
    assert.equal(t.answer, want.answer, q);
    const h = p.term.children[p.term.children.length - 1].innerHTML;
    assert.match(h, /data-route="direct" data-provenance="native"/);
    assert.match(h, /model none  tokens 0  network 0/);
    const ns = Number(/data-ns="(\d+)"/.exec(h)[1]);
    assert.ok(ns >= 1, q + ' ns ' + ns);
    assert.match(h, /ns per ask on this device<\/span> \(median of 7 batches, [\d,]+ asks\)/);
    assert.equal(count(h, 'data-answer='), 1);
    // the answer comes first, the how second
    assert.ok(h.indexOf('class="ans say"') < h.indexOf('answered natively in this tab'), q + ' answer first');
    assert.doesNotMatch(h, /refuses|refused/, q + ' reads as a refusal');
    if (q === 'hey') console.log('tab hey  kind ' + t.kind + '  ' + ns + ' ns per ask (node, this host)  requests 0');
  }
});

test('the tab calls the conversation region before the exact reader, and never the exact reader for a turn it carried', async () => {
  const order = [];
  const p = await runPage({ order });
  await p.ask('what is 17 times 23');
  assert.deepEqual(order.slice(0, 2), ['converse', 'readExact']);
  order.length = 0;
  await p.ask('hey');
  assert.ok(order.length > 0 && order.every((x) => x === 'converse'), 'hey reached ' + [...new Set(order)].join(','));
  order.length = 0;
  p.setReply(respond(200, { ok: true, text: 'nothing in memory matches rome.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 5, host: 'local', knowledge: { ready: true } }));
  await p.ask(SERVER_ONLY);
  assert.deepEqual(order, ['converse', 'readExact'], 'a refused prompt asks each reader once, in order');
});

test('a refused prompt renders the SERVER block first ("asking the organism on the server ..."), the refusal lines after it, dim, every one printed', async () => {
  const unit = refusedHtml(['write', 'poem'], '"one sentence" in: hey');
  const iSrv = unit.indexOf('data-server-pending="1"'), iRef = unit.indexOf('data-refusal="1"');
  assert.ok(iSrv >= 0 && iRef > iSrv, 'server block ' + iSrv + ' before refusal ' + iRef);
  assert.ok(unit.startsWith('<div class="srv pending acc" data-server-pending="1">' + PENDING_LINE + '</div>'), 'the first visible line is the pending line');
  assert.equal(PENDING_LINE, 'asking the organism on the server ...');
  assert.match(unit, /<div class="refusal dim" data-refusal="1"><pre class="dim">no cell in this tab carries this question, so the tab refuses it, not guesses; the organism on the server answers it\.<\/pre>/);
  assert.match(unit, /tab: route refused  provenance none  model none \(the model cell is not in the browser\)  tokens 0  words the spoken reader could not read: write, poem/);
  assert.match(unit, /the word problem reader stopped at: &quot;one sentence&quot; in: hey/);
  // the same order in the page, before and after the server answers
  const p = await runPage();
  let reply;
  const gate = new Promise((ok) => { reply = ok; });
  p.setReply({ status: 200, headers: { get: () => null }, json: () => gate });
  const pending = p.ask(SERVER_ONLY);
  await new Promise((r) => setImmediate(r));
  const before = p.term.children[0].innerHTML;
  assert.ok(before.indexOf(PENDING_LINE) > 0 && before.indexOf(PENDING_LINE) < before.indexOf('data-refusal="1"'), 'pending line before the refusal lines while in flight');
  reply({ ok: true, text: 'nothing in memory matches rome.', route: 'direct', provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, llm: { provider: null, reason: 'not configured' }, serverUs: 142, host: 'iad1', knowledge: { ready: true } });
  await pending;
  const after = p.term.children[0].innerHTML;
  assert.ok(!after.includes('data-server-pending'), 'the pending line was replaced');
  const iDone = after.indexOf('data-server-done="1"'), iRef2 = after.indexOf('data-refusal="1"');
  assert.ok(iDone > 0 && iRef2 > iDone, 'server answer ' + iDone + ' before refusal lines ' + iRef2);
  assert.match(after, /data-route="refused"/, 'the tab route is still printed');
  console.log('refused order  server block at ' + iDone + ', refusal lines at ' + iRef2 + ' (' + SERVER_ONLY + ')');
});

test('a failed request prints its failure in the server block, never silence', async () => {
  const p = await runPage();
  p.setReply(new Error('Failed to fetch'));
  const r = await p.ask(SERVER_ONLY);
  assert.equal(r.tab, false);
  const h = p.term.children[0].innerHTML;
  assert.match(h, /data-server-done="1" data-status="0"/);
  assert.match(h, /the server half did not answer: Failed to fetch/);
  assert.ok(h.indexOf('data-server-done') < h.indexOf('data-refusal="1"'));
  p.setReply(respond(500, null));
  await p.ask(SERVER_ONLY);
  assert.match(p.term.children[1].innerHTML, /the server answered 500: no JSON/);
});

test('a server answer prints ONCE: a native text ending with its answer prints the head dim and the answer once', () => {
  const answer = converse('hey, how are you').answer;
  const native = { ok: true, text: 'answered natively by the conversation region (kind greeting+wellbeing, 35945 ns), with no model, no memory read and no network.\n' + answer,
    native: { kind: 'greeting+wellbeing', answer, form: 'hey how are you', ns: 35945 }, exact: null, route: 'direct',
    provenance: { answer: 'native', memoryHits: 0, webPages: 0 }, llm: { provider: null, reason: 'not asked: the native conversation region answered' }, serverUs: 142, host: 'iad1', knowledge: { ready: true } };
  const h = serverHtml({ status: 200, j: native, rttMs: 75 });
  assert.equal(count(h, answer), 2, 'the answer text once and its data attribute once');
  assert.equal(count(h, '>' + answer + '<'), 1, 'printed once');
  assert.equal(count(h, 'data-srv-answer='), 1);
  assert.match(h, /data-srv-once="tail"/);
  assert.match(h, /<pre class="srvtext dim" data-srv-head="1">answered natively by the conversation region \(kind greeting\+wellbeing, 35945 ns\), with no model, no memory read and no network\.<\/pre>/);
  assert.ok(h.indexOf('data-srv-answer') < h.indexOf('data-srv-head'), 'the answer first, the head second');
  assert.match(h, /server: route <span class="acc">direct<\/span>  provenance <span class="acc">native<\/span>/);
  assert.match(h, /142 us on the server<\/span> \(iad1\)  round trip 75 ms in this tab/);
  // the exact shape (head line, then the answer) prints the answer once too
  const ex = serverHtml({ status: 200, j: { ok: true, text: 'answered exactly by exact.arith\n391', exact: { answer: '391', ns: 900 }, route: 'direct', provenance: { answer: 'exact' }, serverUs: 770, host: 'iad1', knowledge: { ready: true } }, rttMs: 60 });
  assert.equal(count(ex, '>391<'), 1);
  assert.match(ex, /data-srv-once="tail"/);
  // the equal case (textIsTheAnswer) prints no text block at all
  const eq = serverHtml({ status: 200, j: { ...native, text: answer }, rttMs: 70 });
  assert.equal(count(eq, '>' + answer + '<'), 1);
  assert.match(eq, /data-srv-once="equal"/);
  assert.doesNotMatch(eq, /srvtext/);
  // a text with no such tail (memory, model) prints as it came
  const mem = serverHtml({ status: 200, j: { ok: true, text: 'nothing in memory matches hey.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 9, host: 'iad1', knowledge: { ready: true } }, rttMs: 70 });
  assert.match(mem, /<pre class="srvtext">nothing in memory matches hey\.<\/pre>/);
  assert.match(mem, /data-srv-once="text"/);
  // a number that only ENDS the text, not on its own line, is not a tail
  assert.equal(answerOnce({ text: 'the year was 1391', exact: { answer: '391' } }).mode, 'text');
  assert.equal(answerOnce({ text: '  391 ', exact: { answer: '391' } }).mode, 'equal');
  assert.equal(answerOnce({ text: 'a\nb\n391', exact: { answer: '391' } }).head, 'a\nb');
  console.log('once  native tail: answer printed ' + count(h, '>' + answer + '<') + ' time(s); exact tail ' + count(ex, '>391<') + '; equal ' + count(eq, '>' + answer + '<'));
});

test('the tab render functions are the page functions, and the clock prints a positive median', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  for (const fn of [refusedHtml, serverHtml, answerOnce, tabNativeHtml, clock]) assert.ok(html.includes(fn.toString()), fn.name + ' is in the page byte for byte');
  const c = clock(() => converse('hey'));
  assert.ok(Number.isInteger(c.ns) && c.ns >= 1 && c.asks >= 56, JSON.stringify(c));
  const h = tabNativeHtml(converse('hey'), c);
  assert.match(h, new RegExp('data-ns="' + c.ns + '"'));
});
