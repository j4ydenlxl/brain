// test/grow-absorb.test.mjs: ABSORB (grow/absorb.mjs, neo/sources.json; grow/NEO.md "Order 7: always burning").
// His words it serves (2026-10-01, NEO.md): "always burning, processing and scraping ... and abasorbing data so it
// constantly iterates in the cloud"; "All native btw, its ai data center in ur pocket, none of that ollama crap".
// Every test is offline: the network is an injected fetch that serves test/fixtures/absorb/ (excerpts of
// samayo/country-json (MIT), dariusk/corpora (CC0) and Bowserinator/Periodic-Table-JSON (CC-BY-SA-3.0)) or a stub
// response, and every root is a temporary directory under os.tmpdir() removed when the run ends. What it holds the
// absorber to: the host allowlist on the URL and on every redirect hop (refused before any fetch), the redirect cap,
// only 200 is data, the byte and time budgets, every adapter, both directions of a relation with 3+ templates, dev and
// held-out sets on different templates over disjoint entities plus known entities in new words, the row filters (an
// answer that fails its expect, a prompt over 300 characters, FORBIDDEN anywhere in a row, an echo), numeric ties,
// membership balance, the deterministic split and the normQ overlap rule, the cursor ring, append-only ABSORB.json,
// the ledger collision rule, the intake marks, teach.mjs check and intake on what it writes, the CLI, the files never
// opened, the source's own imports, and the seed registry.
// Author: Opus 5.5 builder (ABSORB) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_HOSTS, SOURCES, ABSORB, MAX_Q, MAX_REDIRECTS, MIN_TEMPLATES, ID_RE, FORMATS, sha256, urlRefusal, fetchBytes,
  parseCsv, recordsOf, decode, getPath, clean, numOf, fmtNum, planSingle, templateSplit, rowProblems, relationTasks, reverseOf,
  numericTasks, membershipTasks, ADAPTERS, taskNamesOf, sourceErrors, splitTask, pull, status, main, USAGE,
} from '../grow/absorb.mjs';
import { TASK_RE, MIN_ROWS, LEDGER, OPENED_MARK, REFUSED_MARK, normQ, validateTaskDir, lockedClasses, intake } from '../grow/teach.mjs';
import { expectOk } from '../judge/judge.mjs';
import { runNode, lastJson, why1 } from '../grow/generation.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIX = path.join(BRAIN, 'test', 'fixtures', 'absorb');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-absorb-test-'));
// Windows can refuse the last rmdir for a moment (a scanner or a child that just exited holds a handle): retry it
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 }); } catch { /* the OS cleans tmp */ } };
after(cleanup);
process.on('exit', cleanup);
const LOCKED = ['capital-of', 'code', 'math'];
const AT = '2026-10-01T12:00:00.000Z';
const RAW = 'https://raw.githubusercontent.com/brain-test/absorb/main/';
const read = (f) => fs.readFileSync(f, 'utf8');
const readJ = (f) => JSON.parse(read(f));
const rowsOf = (f) => read(f).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const fixBytes = (name) => fs.readFileSync(path.join(FIX, name));

// ---- the fixture registry
const T4 = (a, b, c, d) => [a, b, c, d];
const CAP = {
  id: 'fx-capitals', kind: 'json-relation', domain: 'geography', license: 'MIT', url: RAW + 'capitals.json',
  make: { relations: [{
    key: 'country', value: 'city', keyLabel: 'country', valueLabel: 'capital', task: 'fx-country-capital',
    templates: T4('what is the capital of {key}', 'name the capital city of {key}', 'which city is the capital of {key}', 'tell me the capital of {key}'),
    answer: 'The capital of {key} is {value}.',
    reverse: { task: 'fx-capital-country', templates: T4('{key} is the capital of which country', 'which country has {key} as its capital', 'of which country is {key} the capital', 'name the country whose capital is {key}'), answer: '{key} is the capital of {value}.' },
  }] },
};
const POP = { id: 'fx-population', kind: 'csv-numeric', domain: 'demographics', license: 'MIT', url: RAW + 'population.csv', make: { numerics: [{ key: 'country', value: 'population', noun: 'population', task: 'fx-population' }] } };
const DECOYS = ['carrot', 'potato', 'onion', 'garlic', 'lettuce', 'spinach', 'broccoli', 'celery', 'cabbage', 'radish', 'turnip', 'kale', 'leek', 'parsnip', 'bread', 'cheese', 'butter', 'tofu', 'honey', 'salt'];
const FRUIT = { id: 'fx-fruits', kind: 'list-membership', domain: 'food', license: 'CC0-1.0', url: RAW + 'fruits.json', make: { root: 'fruits', task: 'fx-fruit', kind: 'a fruit', decoys: DECOYS } };
const ELEM = {
  id: 'fx-elements', kind: 'json-relation', domain: 'chemistry', license: 'CC-BY-SA-3.0', url: RAW + 'elements.jsonl',
  make: { format: 'jsonl', relations: [{
    key: 'name', value: 'symbol', keyLabel: 'element', valueLabel: 'symbol', task: 'fx-element-symbol',
    templates: T4('what is the chemical symbol of {key}', 'give the symbol for {key}', 'which symbol stands for {key}', 'tell me the element symbol of {key}'),
    answer: '{value}', expect: 'equals',
    reverse: { task: 'fx-symbol-element', templates: T4('which element has the symbol {key}', 'what element is {key}', 'name the element whose symbol is {key}', 'the chemical symbol {key} stands for which element'), answer: '{key} is the symbol of {value}.' },
  }] },
};
const FX = [CAP, POP, FRUIT, ELEM];
const FX_TASKS = ['fx-country-capital', 'fx-capital-country', 'fx-population', 'fx-population-larger', 'fx-population-smaller', 'fx-population-compare', 'fx-population-sum', 'fx-fruit-member', 'fx-fruit-which', 'fx-element-symbol', 'fx-symbol-element'];

/** A fetch that serves the fixtures under RAW (404 otherwise); `over` maps a URL to a function that returns a response. */
function fixtureFetch(over = {}) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push(String(url));
    if (Object.hasOwn(over, url)) return over[url](url, init);
    const name = String(url).startsWith(RAW) ? String(url).slice(RAW.length) : null;
    if (name && fs.existsSync(path.join(FIX, name))) return new Response(fixBytes(name), { status: 200 });
    return new Response('not found', { status: 404 });
  };
  return { fn, calls };
}

let seq = 0;
/** A stub root: locked class names in judge/dev/ (sentinels never to be read), a registry, a ledger, an empty syllabus. */
function stubRoot({ sources = FX, ledger = { tasks: [], generated: 0 }, absorb = null } = {}) {
  const root = path.join(TMP, 'root-' + ++seq);
  fs.mkdirSync(path.join(root, 'judge', 'dev'), { recursive: true });
  for (const c of LOCKED) fs.writeFileSync(path.join(root, 'judge', 'dev', c + '.jsonl'), 'DEV-SENTINEL-NEVER-READ\n');
  fs.mkdirSync(path.join(root, 'neo'), { recursive: true });
  if (sources !== null) fs.writeFileSync(path.join(root, SOURCES), JSON.stringify({ sources }, null, 2) + '\n');
  if (ledger !== null) fs.writeFileSync(path.join(root, LEDGER), JSON.stringify(ledger, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'neo', 'syllabus.jsonl'), '');
  if (absorb !== null) fs.writeFileSync(path.join(root, ABSORB), typeof absorb === 'string' ? absorb : JSON.stringify(absorb) + '\n');
  return root;
}
const teachDir = (root, gen) => path.join(root, 'work', 'grow', 'gen-' + gen, 'teach');
const pullFx = (root, o = {}) => { const fx = o.fx || fixtureFetch(); return pull(root, { gen: 7, fetch: fx.fn, now: () => AT, maxSources: FX.length, ...o }); };
const cli = (args) => runNode(BRAIN, 'grow/absorb.mjs', args, { timeout: 60000 });
const teachCli = (args) => runNode(BRAIN, 'grow/teach.mjs', args, { timeout: 60000 });
/** A response object a test shapes by hand (status, headers, url, body). */
const fake = ({ status = 200, headers = {}, url = '', body = '' } = {}) => ({ status, url, headers: new Headers(headers), body: null, arrayBuffer: async () => new TextEncoder().encode(body).buffer });

// ---- the network: an allowlist on the URL and on every hop, before any socket
test('urlRefusal: https on an allowed host passes; http, another host, credentials, a port and a non-URL are refused', () => {
  assert.deepEqual([...ALLOWED_HOSTS], ['raw.githubusercontent.com']);
  assert.ok(Object.isFrozen(ALLOWED_HOSTS));
  assert.equal(urlRefusal('https://raw.githubusercontent.com/a/b/main/c.json'), '');
  assert.equal(urlRefusal('https://RAW.githubusercontent.com/a/b/main/c.json'), '');
  assert.match(urlRefusal('http://raw.githubusercontent.com/a/b/main/c.json'), /not https/);
  assert.match(urlRefusal('https://example.com/c.json'), /host example\.com is not in ALLOWED_HOSTS/);
  assert.match(urlRefusal('https://raw.githubusercontent.com.evil.example/c.json'), /not in ALLOWED_HOSTS/);
  assert.match(urlRefusal('https://user:pw@raw.githubusercontent.com/c.json'), /credentials/);
  assert.match(urlRefusal('https://raw.githubusercontent.com:8443/c.json'), /non-default port/);
  assert.match(urlRefusal('file:///etc/passwd'), /not https/);
  assert.match(urlRefusal('not a url'), /not a URL/);
});

test('fetchBytes: a disallowed host is refused before any fetch, and a redirect to one before the second fetch', async () => {
  const none = fixtureFetch();
  await assert.rejects(fetchBytes('https://example.com/data.csv', { fetch: none.fn }), /refused before the fetch: the host example\.com/);
  await assert.rejects(fetchBytes('http://raw.githubusercontent.com/x', { fetch: none.fn }), /refused before the fetch: not https/);
  assert.equal(none.calls.length, 0, 'no fetch was made');
  for (const to of ['https://evil.example/steal', 'http://raw.githubusercontent.com/x', 'https://raw.githubusercontent.com:444/x']) {
    const fx = fixtureFetch({ [RAW + 'hop.json']: () => new Response(null, { status: 302, headers: { location: to } }) });
    await assert.rejects(fetchBytes(RAW + 'hop.json', { fetch: fx.fn }), /redirect refused before the fetch/);
    assert.deepEqual(fx.calls, [RAW + 'hop.json'], 'the second hop was never fetched: ' + to);
  }
  // a redirect inside the allowlist is followed (a relative location too), each hop checked
  const ok = fixtureFetch({ [RAW + 'moved.json']: () => new Response(null, { status: 301, headers: { location: 'fruits.json' } }) });
  const got = await fetchBytes(RAW + 'moved.json', { fetch: ok.fn });
  assert.equal(got.hops, 1);
  assert.equal(got.url, RAW + 'fruits.json');
  assert.deepEqual(got.bytes, fixBytes('fruits.json'));
  assert.deepEqual(ok.calls, [RAW + 'moved.json', RAW + 'fruits.json']);
});

test('fetchBytes: the fetch is handed the URL the allowlist parsed, never the raw text', async () => {
  for (const [given, want] of [
    ['https:\\\\raw.githubusercontent.com\\a\\b.json', 'https://raw.githubusercontent.com/a/b.json'],
    ['https://@RAW.githubusercontent.com/a/./x/../b.json', 'https://raw.githubusercontent.com/a/b.json'],
    [' https://raw.githubusercontent.com:443/a/b.json ', 'https://raw.githubusercontent.com/a/b.json'],
  ]) {
    const seen = [];
    await fetchBytes(given, { fetch: async (u) => { seen.push(String(u)); return new Response('ok', { status: 200 }); } });
    assert.deepEqual(seen, [want], given);
  }
  const hops = [];
  await fetchBytes(RAW + 'a.json', { fetch: async (u) => { hops.push(String(u)); return hops.length === 1 ? new Response(null, { status: 302, headers: { location: '\\\\raw.githubusercontent.com\\c.json' } }) : new Response('ok', { status: 200 }); } });
  assert.deepEqual(hops, [RAW + 'a.json', 'https://raw.githubusercontent.com/c.json'], 'a redirect hop is handed its parsed URL too');
});

test('fetchBytes: at most MAX_REDIRECTS hops, only status 200 is data, and a response that came from another host is refused', async () => {
  let n = 0;
  const loop = fixtureFetch({ [RAW + 'loop.json']: () => new Response(null, { status: 302, headers: { location: RAW + 'loop.json?' + ++n } }) });
  const loopFn = async (u, i) => (String(u).startsWith(RAW + 'loop.json') ? new Response(null, { status: 307, headers: { location: RAW + 'loop.json?' + ++n } }) : loop.fn(u, i));
  let calls = 0;
  // the fake stops a runaway loop itself, so a fetcher without the cap fails this assertion instead of hanging the suite
  const runaway = async (u, i) => { calls++; if (calls > MAX_REDIRECTS + 5) throw new Error('runaway redirect loop'); return loopFn(u, i); };
  await assert.rejects(fetchBytes(RAW + 'loop.json', { fetch: runaway, timeoutMs: 5000 }), new RegExp('more than ' + MAX_REDIRECTS + ' redirects'));
  assert.equal(calls, MAX_REDIRECTS + 1, 'the first fetch and MAX_REDIRECTS hops, then no more');
  for (const status of [404, 500, 204, 206]) {
    await assert.rejects(fetchBytes(RAW + 'x.json', { fetch: async () => new Response(status === 204 ? null : 'body', { status }) }), new RegExp('HTTP ' + status));
  }
  await assert.rejects(fetchBytes(RAW + 'x.json', { fetch: async () => new Response(null, { status: 302 }) }), /HTTP 302 with no location/);
  // a runtime that followed a redirect by itself says where the bytes came from: that place is held to the allowlist
  await assert.rejects(fetchBytes(RAW + 'x.json', { fetch: async () => fake({ url: 'https://evil.example/x.json', body: 'a,b\n1,2\n' }) }), /refused after the fetch: .*evil\.example/);
  const same = await fetchBytes(RAW + 'x.json', { fetch: async () => fake({ url: RAW + 'x.json', body: 'a,b\n1,2\n' }) });
  assert.equal(same.bytes.toString('utf8'), 'a,b\n1,2\n');
  await assert.rejects(fetchBytes(RAW + 'x.json', { fetch: async () => undefined }), /no response/);
  await assert.rejects(fetchBytes(RAW + 'x.json', { fetch: null }), /no fetch/);
});

test('fetchBytes: the byte budget on content-length and on the stream, and the time budget', async () => {
  await assert.rejects(fetchBytes(RAW + 'x', { fetch: async () => new Response('tiny', { status: 200, headers: { 'content-length': '999999' } }), maxBytes: 1000 }), /over the byte budget: 999999 bytes, 1000 left/);
  await assert.rejects(fetchBytes(RAW + 'x', { fetch: async () => new Response('x'.repeat(5000), { status: 200 }), maxBytes: 1000 }), /over the byte budget/);
  await assert.rejects(fetchBytes(RAW + 'x', { fetch: async () => fake({ body: 'y'.repeat(2000) }), maxBytes: 1000 }), /over the byte budget/);
  const exact = await fetchBytes(RAW + 'x', { fetch: async () => new Response('z'.repeat(1000), { status: 200 }), maxBytes: 1000 });
  assert.equal(exact.bytes.length, 1000, 'exactly the budget is allowed');
  const t0 = Date.now();
  await assert.rejects(fetchBytes(RAW + 'x', { fetch: () => new Promise(() => {}), timeoutMs: 60 }), /timed out after 60 ms/);
  assert.ok(Date.now() - t0 < 5000, 'the time budget bounds a fetch that never answers');
  let signal = null;
  await assert.rejects(fetchBytes(RAW + 'x', { fetch: (u, init) => { signal = init.signal; return new Promise(() => {}); }, timeoutMs: 40 }), /timed out/);
  assert.equal(signal.aborted, true, 'the fetch is aborted, not left running');
});

test('fetchBytes: a 50 MB body with no or a lying content-length is cut at the byte budget, never read whole', async () => {
  for (const headers of [{}, { 'content-length': '10' }]) {
    let pulled = 0, cancelled = false;
    const chunk = new Uint8Array(65536).fill(97);
    const body = new ReadableStream({ pull(c) { if (pulled >= 50e6) { c.close(); return; } pulled += chunk.byteLength; c.enqueue(chunk); }, cancel() { cancelled = true; } });
    await assert.rejects(fetchBytes(RAW + 'big.csv', { fetch: async () => new Response(body, { status: 200, headers }), maxBytes: 8000000 }), /over the byte budget: more than 8000000 bytes/);
    assert.ok(pulled <= 8000000 + 2 * chunk.byteLength, 'read ' + pulled + ' bytes of 50 MB');
    assert.equal(cancelled, true, 'the stream is cancelled, not drained');
  }
});

// ---- parsing (a parser reads characters; nothing in the bytes runs)
test('parseCsv and recordsOf: quotes, CRLF, headerless columns with \\N, JSON lines, entries, explode, where and match', () => {
  assert.deepEqual(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n\r\n3,\n'), [['a', 'b'], ['x, y', 'say "hi"'], ['3', '']]);
  assert.deepEqual(parseCsv('a\tb\n1\t2', '\t'), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(parseCsv('"multi\nline",2\n'), [['multi\nline', '2']]);
  assert.deepEqual(recordsOf('1,"Goroka",\\N\n2,"Madang","MAG"\n', { columns: ['id', 'name', 'iata'] }, 'csv'), [{ id: '1', name: 'Goroka', iata: '' }, { id: '2', name: 'Madang', iata: 'MAG' }]);
  assert.deepEqual(recordsOf('{"a":1}\nnot json\n{"a":2}\n', {}, 'json'), [{ a: 1 }, { a: 2 }], 'JSON lines: a bad line is skipped');
  assert.throws(() => recordsOf('nope\nstill nope\n', {}, 'json'), /neither JSON nor JSON lines/);
  assert.deepEqual(recordsOf('{"x":{"list":["p","q"]}}', { root: 'x.list' }), [{ $: 'p' }, { $: 'q' }]);
  assert.throws(() => recordsOf('{"x":1}', { root: 'x' }), /is not an array/);
  const obj = '{"BTC":"Bitcoin","ETH":{"name":"Ether","ext":[".a",".b"]}}';
  assert.deepEqual(recordsOf(obj, { entries: true }), [{ $key: 'BTC', $value: 'Bitcoin' }, { name: 'Ether', ext: ['.a', '.b'], $key: 'ETH' }]);
  assert.deepEqual(recordsOf(obj, { entries: true, explode: 'ext' }).map((r) => r.ext), [undefined, '.a', '.b']);
  const recs = '[{"n":"a","t":"x","c":"200"},{"n":"b","t":"y","c":"1xx"},{"n":"c","t":"x","c":"404"}]';
  assert.deepEqual(recordsOf(recs, { where: { t: 'x' } }).map((r) => r.n), ['a', 'c']);
  assert.deepEqual(recordsOf(recs, { where: { t: ['x', 'y'] }, match: { c: '^[0-9]{3}$' } }).map((r) => r.n), ['a', 'c']);
  assert.deepEqual(recordsOf('{"__proto__":{"polluted":1},"k":"v"}', { entries: true }).map((r) => r.$key).sort(), ['__proto__', 'k']);
  assert.equal({}.polluted, undefined, 'a key named __proto__ is data, never a prototype');
  // a path reads own properties only: an inherited name in the registry or the bytes is never a value
  assert.equal(getPath({ a: { b: 'x' } }, 'a.b'), 'x');
  assert.equal(getPath({ x: [{ y: 'z' }] }, 'x.0.y'), 'z');
  for (const p of ['constructor', 'toString', '__proto__', 'a.constructor', 'a.hasOwnProperty', 'x.length', 'x.map']) assert.equal(getPath({ a: { b: 'x' }, x: ['p'] }, p), undefined, p);
  assert.deepEqual(recordsOf('[{"n":"a"},{"n":"b"}]', { root: '' }).map((r) => r.n), ['a', 'b']);
  assert.throws(() => recordsOf('{"x":[]}', { root: 'constructor' }), /is not an array/);
});

test('clean and numOf: control characters, markup, over-long fields and exponents are never entities; thousands commas are read', () => {
  assert.equal(clean('  New\u0000 York\n '), 'New York');
  assert.equal(clean('<script>x</script>'), null);
  assert.equal(clean('x'.repeat(121)), null);
  assert.equal(clean('x'.repeat(120)), 'x'.repeat(120));
  assert.equal(clean(''), null);
  assert.equal(clean(1e21), null);
  assert.equal(clean(42), '42');
  assert.equal(clean(true), null);
  assert.equal(clean({ a: 1 }), null);
  assert.deepEqual(numOf('1,234,567'), { n: 1234567, dec: 0, s: '1234567' });
  assert.deepEqual(numOf('18.930'), { n: 18.93, dec: 3, s: '18.93' });
  assert.equal(numOf('1e5'), null);
  assert.equal(numOf('12abc'), null);
  assert.equal(numOf(''), null);
  assert.equal(numOf(Infinity), null);
  assert.equal(fmtNum(1.5 + 2.25, 2), '3.75');
  assert.equal(fmtNum(0.1 + 0.2, 1), '0.3');
  assert.equal(fmtNum(-0.0001, 2), '0');
});

test('a hostile CSV (BOM, CRLF, quotes, formula cells, markup, a script payload, control characters) ends as inert text in a row or is dropped', async () => {
  const lines = ['﻿country,capital'];
  for (let i = 0; i < 40; i++) lines.push('Land' + String(i).padStart(2, '0') + ',City' + String(i).padStart(2, '0'));
  const hostile = [
    ['"Quote ""Land"""', '"Quote, City"'], ['=HYPERLINK("https://evil.example")', 'FormulaCity'], ['+cmd|\' /C calc\'!A0', 'PlusCity'], ['@SUM(A1)', 'AtCity'],
    ['<script>alert(1)</script>', 'ScriptCity'], ['ImgLand', '"<img src=x onerror=alert(1)>"'], ['ProcLand', 'process.exit(1)'], ['RequireLand', 'require("fs")'],
    ['CtrlLand', '"a\u0007b\u001bc"'], ['MultiLand', '"line1\r\nline2"'], ['BraceLand', '{value}'], ['{key}', 'BraceKey'],
  ];
  for (const [k, v] of hostile) lines.push(k + ',' + v);
  const csv = lines.join('\r\n') + '\r\n';
  for (const input of ['﻿[{"a":1}]', Buffer.from('﻿[{"a":1}]', 'utf8')]) assert.equal(decode(input), '[{"a":1}]', 'a byte order mark is dropped (' + typeof input + ')');
  assert.equal(recordsOf(decode('﻿[{"a":1}]'), { format: 'json' })[0].a, 1, 'a JSON document behind a BOM parses');
  const SRC = { id: 'fx-hostile', kind: 'csv-relation', domain: 'geography', license: 'MIT', url: RAW + 'hostile.csv', make: { relations: [{ key: 'country', value: 'capital', keyLabel: 'country', valueLabel: 'capital', task: 'fx-hostile', templates: T4('what is the capital of {key}', 'name the capital of {key}', 'which city is the capital of {key}', 'tell me the capital of {key}'), answer: 'The capital of {key} is {value}.' }] } };
  const root = stubRoot({ sources: [SRC] });
  const fx = fixtureFetch({ [SRC.url]: () => new Response(Buffer.from(csv, 'utf8'), { status: 200 }) });
  const out = await pullFx(root, { maxSources: 1, fx });
  assert.deepEqual(out.dirs, ['work/grow/gen-7/teach/fx-hostile', 'work/grow/gen-7/teach/fx-hostile-rev'], JSON.stringify(out));
  const all = [];
  for (const d of ['fx-hostile', 'fx-hostile-rev']) {
    const dir = path.join(teachDir(root, 7), d);
    assert.ok(validateTaskDir(dir, { n: 7 }).ok, d);
    for (const f of ['dev.jsonl', 'heldout.jsonl']) {
      const text = read(path.join(dir, f));
      assert.doesNotMatch(text, /[<>]|\\u003c|script|onerror|process|require|\\u0007|\\u001b|\\r/i, d + '/' + f + ': markup, code words and control characters are dropped');
      all.push(...rowsOf(path.join(dir, f)));
    }
  }
  const text = all.map((r) => r.q + ' | ' + r.answer).join('\n');
  // what is kept is a plain string in a JSON row: a formula cell stays the very text the source had, never run
  for (const s of ['=HYPERLINK("https://evil.example")', '+cmd|\' /C calc\'!A0', '@SUM(A1)', 'Quote "Land"', 'Quote, City', 'a b c', 'line1 line2', '{value}', '{key}']) assert.ok(text.includes(s), 'kept as text: ' + s);
  for (const r of all) assert.equal(typeof r.q, 'string');
  assert.ok(all.some((r) => /Land00|City00/.test(r.q)), 'the header after the BOM is read');
  assert.equal(globalThis.HYPERLINK, undefined);
});

// ---- the adapters
const synth =(n, f = (i) => ({ k: 'Key' + String(i).padStart(2, '0'), v: 'Val' + String(i).padStart(2, '0') })) => Array.from({ length: n }, (_, i) => f(i + 1));
const REL = (o = {}) => ({ key: 'k', value: 'v', keyLabel: 'item', valueLabel: 'tag', task: 'syn-tag', templates: T4('alpha {key}', 'beta {key}', 'gamma {key}', 'delta {key}'), answer: 'The tag of {key} is {value}.', ...o });

test('relationTasks: one task per relation and per DIRECTION, each needing at least 3 templates', () => {
  const tasks = ADAPTERS['json-relation'](fixBytes('capitals.json'), CAP.make);
  assert.deepEqual(tasks.map((t) => t.task), ['fx-country-capital', 'fx-capital-country']);
  const caps = readJ(path.join(FIX, 'capitals.json'));
  const fwd = tasks[0].rows, rev = tasks[1].rows;
  assert.ok(fwd.length >= 30 && rev.length >= 30, fwd.length + ' / ' + rev.length);
  const kabul = caps.find((r) => r.country === 'Afghanistan').city;
  const f = fwd.find((r) => r.q.endsWith(' Afghanistan')) || fwd.find((r) => /Afghanistan/.test(r.q));
  const b = rev.find((r) => r.q.includes(kabul));
  assert.ok(f || b, 'Afghanistan is asked in one direction at least');
  for (const r of fwd) { const c = caps.find((x) => r.q.endsWith(' ' + x.country) || r.q.endsWith(x.country)); assert.ok(c, r.q); assert.ok(r.answer.includes(c.city), r.answer); }
  for (const r of rev) { const c = caps.find((x) => r.q.includes(x.city)); assert.ok(c, r.q); assert.ok(r.answer.endsWith(c.country + '.'), 'the reverse answers the key: ' + r.answer); }
  // a relation that names no reverse still gets one, on the default templates with its labels
  const dflt = relationTasks(synth(60), { relations: [REL()] });
  assert.deepEqual(dflt.map((t) => t.task), ['syn-tag', 'syn-tag-rev']);
  assert.ok(dflt[1].rows.length > 0);
  assert.ok(dflt[1].rows.every((r) => /^(which item has the tag|name the item whose tag is|Val\d\d is the tag of which item|tell me the item with the tag)/.test(r.q)), dflt[1].rows[0].q);
  assert.deepEqual(reverseOf(REL()).templates.length, 4);
  assert.throws(() => relationTasks(synth(10), { relations: [REL({ templates: ['a {key}', 'b {key}'] })] }), new RegExp('syn-tag has under ' + MIN_TEMPLATES + ' templates'));
  assert.throws(() => relationTasks(synth(10), { relations: [REL({ reverse: { templates: ['a {key}', 'b {key}'] } })] }), /syn-tag-rev has under 3 templates/);
  // expect equals: the whole answer is the value
  const eq = relationTasks(synth(60), { relations: [REL({ answer: '{value}', expect: 'equals' })] })[0].rows;
  assert.ok(eq.every((r) => r.expect.equals === r.answer && /^Val\d\d$/.test(r.answer)));
});

test('the split plan: dev and held-out templates are never shared, held-out entities are half new and half known in new words', () => {
  const [t] = relationTasks(synth(60), { relations: [REL()] });
  const tplOf = (q) => q.split(' ')[0];
  const entOf = (q) => q.split(' ')[1];
  const dev = t.rows.filter((r) => r.split === 'dev'), held = t.rows.filter((r) => r.split === 'heldout');
  assert.deepEqual([...new Set(dev.map((r) => tplOf(r.q)))].sort(), ['alpha', 'beta', 'gamma']);
  assert.deepEqual([...new Set(held.map((r) => tplOf(r.q)))], ['delta']);
  const devEnts = new Set(dev.map((r) => entOf(r.q)));
  const heldEnts = held.map((r) => entOf(r.q));
  const fresh = heldEnts.filter((e) => !devEnts.has(e)), known = heldEnts.filter((e) => devEnts.has(e));
  assert.ok(fresh.length >= 5, 'held-out entities never in the dev set: ' + fresh.length);
  assert.equal(fresh.length, known.length, 'half new, half known');
  assert.equal(new Set(heldEnts).size, heldEnts.length);
  const ts = templateSplit(['a', 'b', 'c']);
  assert.deepEqual(ts, { dev: ['a', 'b'], held: ['c'] });
  assert.deepEqual(templateSplit(['a', 'b', 'c', 'd', 'e', 'f']), { dev: ['a', 'b', 'c', 'd'], held: ['e', 'f'] });
  const plan = planSingle('p', synth(60).map((r) => r.k));
  assert.equal(plan.H.filter((k) => plan.D.includes(k)).length, 0, 'H and D are disjoint');
  assert.ok(plan.S.every((k) => plan.D.includes(k)) && plan.S.length === plan.H.length);
  // through the split and teach's own rules: a held-out prompt is never a dev prompt
  const sp = splitTask(t.rows);
  assert.ok(sp.ok, sp.why);
  const devQ = new Set(sp.dev.map((r) => normQ(r.q)));
  assert.ok(sp.heldout.every((r) => !devQ.has(normQ(r.q))));
});

test('an ambiguous question is never asked: a key with two values (forward), a value two keys share (reverse)', () => {
  const recs = [...synth(40), { k: 'Twofaced', v: 'First' }, { k: 'Twofaced', v: 'Second' }, { k: 'Alpha', v: 'Shared' }, { k: 'Beta', v: 'Shared' }, { k: 'Key01', v: 'Val01' }];
  const [fwd, rev] = relationTasks(recs, { relations: [REL({ templates: T4('ask {key}', 'query {key}', 'request {key}', 'probe {key}') })] });
  assert.ok(fwd.rows.length > 0 && rev.rows.length > 0);
  assert.ok(!fwd.rows.some((r) => r.q.includes('Twofaced')), 'a key with two values is never asked forward');
  assert.ok(!rev.rows.some((r) => r.q.includes('Shared')), 'a value two keys share is never asked in reverse');
  assert.ok(fwd.rows.some((r) => r.q.endsWith(' Alpha')) && fwd.rows.some((r) => r.q.endsWith(' Beta')), 'Alpha and Beta stay askable forward');
  assert.ok(fwd.rows.some((r) => r.q.endsWith(' Key01')), 'the same pair twice is not ambiguous');
});

test('rowProblems: an answer that fails its expect, a prompt over 300 characters, FORBIDDEN anywhere in the row (expect too), an echo', () => {
  const ok = { q: 'what is the capital of Peru', expect: { contains: ['Lima'], notRefusal: true }, answer: 'The capital of Peru is Lima.' };
  assert.deepEqual(rowProblems(ok), []);
  assert.ok(rowProblems({ ...ok, answer: 'It is Cusco.' }).some((p) => /fails its own expect/.test(p)));
  assert.deepEqual(rowProblems({ ...ok, q: 'q'.repeat(MAX_Q - 4) + ' Pe?' }), []);
  assert.ok(rowProblems({ ...ok, q: 'q'.repeat(MAX_Q) + '?' }).some((p) => /q is over 300 characters/.test(p)));
  assert.ok(rowProblems({ ...ok, answer: 'Lima. ' + 'x'.repeat(600) }).some((p) => /answer is over 600/.test(p)));
  assert.ok(rowProblems({ ...ok, q: 'what does process mean in Lima' }).some((p) => /FORBIDDEN/.test(p)));
  assert.ok(rowProblems({ ...ok, answer: 'Lima, see eval(x).' }).some((p) => /FORBIDDEN/.test(p)));
  const inExpect = { ...ok, expect: { contains: ['Lima'], notContains: ['globalThis'], notRefusal: true } };
  assert.ok(expectOk(inExpect.answer, inExpect.expect), 'the row is otherwise sound');
  assert.ok(rowProblems(inExpect).some((p) => /globalThis/.test(p)), 'a FORBIDDEN pattern in expect alone is caught');
  assert.ok(rowProblems({ ...ok, q: 'is the capital of Peru Lima' }).some((p) => /echo of the prompt/.test(p)));
  assert.ok(rowProblems({ q: 'x', expect: { contains: ['y'] }, answer: 'nothing in memory matches that yet' }).length > 0);
  assert.ok(rowProblems(null).length > 0);
  // the adapters drop such rows: an entity whose name holds a FORBIDDEN word yields no row; one over 300 characters neither
  const recs = [...synth(40), { k: 'require(', v: 'Bad' }, { k: 'Long' + 'g'.repeat(110), v: 'Fine' }];
  const [t] = relationTasks(recs, { relations: [REL({ templates: T4('{key} {key} {key} a', '{key} {key} {key} b', '{key} {key} {key} c', '{key} {key} {key} d') })] });
  assert.ok(t.rows.length > 0);
  assert.ok(t.rows.every((r) => rowProblems(r).length === 0 && r.q.length <= MAX_Q));
  assert.ok(!t.rows.some((r) => r.q.includes('require(') || r.q.includes('Longggg')));
});

const NUMS = (vals) => vals.map((v, i) => ({ name: 'E' + String(i + 1).padStart(2, '0'), val: v }));
const namesIn = (q) => q.match(/E\d\d/g) || [];

test('numericTasks: value, larger, smaller, compare and sum; a tie is never asked as larger, smaller or compare', () => {
  const vals = Array.from({ length: 30 }, (_, i) => String(100 + i * 7) + (i % 3 === 0 ? '.25' : ''));
  for (let i = 0; i < 10; i++) vals[i] = '500';
  const recs = NUMS(vals);
  const byName = new Map(recs.map((r) => [r.name, numOf(r.val)]));
  const tasks = numericTasks(recs, { numerics: [{ key: 'name', value: 'val', noun: 'score', unit: 'points', task: 'syn-score' }] });
  assert.deepEqual(tasks.map((t) => t.task), ['syn-score', 'syn-score-larger', 'syn-score-smaller', 'syn-score-compare', 'syn-score-sum']);
  const [value, larger, smaller, compare, sum] = tasks;
  for (const t of tasks) assert.ok(t.rows.length >= 20, t.task + ' ' + t.rows.length);
  for (const r of value.rows) { const [a] = namesIn(r.q); assert.ok(r.answer.includes(byName.get(a).s + ' points'), r.answer); }
  for (const [t, pick] of [[larger, (a, b) => (byName.get(a).n > byName.get(b).n ? a : b)], [smaller, (a, b) => (byName.get(a).n < byName.get(b).n ? a : b)]]) {
    for (const r of t.rows) {
      const [a, b] = namesIn(r.q);
      assert.notEqual(byName.get(a).n, byName.get(b).n, 'a tie is never asked: ' + r.q);
      const win = pick(a, b), lose = win === a ? b : a;
      assert.ok(r.answer.startsWith(win + ' '), r.answer);
      assert.deepEqual(r.expect.contains, [win]);
      assert.deepEqual(r.expect.notContains, [lose]);
      assert.ok(!expectOk(r.q, r.expect), 'an echo of the prompt names both and fails');
    }
  }
  for (const r of compare.rows) { const [a, b] = namesIn(r.q); assert.notEqual(byName.get(a).n, byName.get(b).n, r.q); }
  for (const r of sum.rows) {
    const [a, b] = namesIn(r.q);
    const A = byName.get(a), B = byName.get(b);
    assert.ok(r.answer.includes(fmtNum(A.n + B.n, Math.max(A.dec, B.dec)) + ' points'), r.answer);
  }
  // a numeric with only some of the tasks, and its own templates
  const only = numericTasks(recs, { numerics: [{ key: 'name', value: 'val', noun: 'score', task: 'syn-two', tasks: ['value', 'sum'] }] });
  assert.deepEqual(only.map((t) => t.task), ['syn-two', 'syn-two-sum']);
  assert.throws(() => numericTasks(recs, { numerics: [{ key: 'name', value: 'val', noun: 'score', task: 'syn-bad', templates: { value: ['a {a}', 'b {a}'] } }] }), /syn-bad has under 3 templates/);
  // through the CSV adapter: the fixture's populations
  const pop = ADAPTERS['csv-numeric'](fixBytes('population.csv'), POP.make);
  assert.equal(pop.length, 5);
  assert.ok(pop.every((t) => splitTask(t.rows).ok), 'every population task splits into dev and held-out');
});

test('membershipTasks: yes and no balanced one to one; which needs two decoys; a decoy that is a member is dropped', () => {
  const fruits = readJ(path.join(FIX, 'fruits.json')).fruits;
  const few = ['carrot', 'potato', 'onion', 'garlic', 'lettuce', 'spinach', 'broccoli', 'celery', 'cabbage', 'radish', fruits[0]];
  const [member, which] = ADAPTERS['list-membership'](fixBytes('fruits.json'), { ...FRUIT.make, decoys: few });
  assert.deepEqual([member.task, which.task], ['fx-fruit-member', 'fx-fruit-which']);
  const yes = new Set(member.rows.filter((r) => r.answer.startsWith('Yes')).map((r) => r.answer));
  const no = new Set(member.rows.filter((r) => r.answer.startsWith('No')).map((r) => r.answer));
  assert.equal(yes.size, 10, 'as many members as decoys (10 decoys after the member one is dropped)');
  assert.equal(no.size, 10);
  assert.ok(![...no].some((a) => a.startsWith('No, ' + fruits[0] + ' ')), 'a decoy that is a member is never a no');
  for (const r of member.rows) assert.ok(expectOk(r.answer, r.expect) && !expectOk(r.q, r.expect), r.q);
  assert.ok(which.rows.length > 0);
  for (const r of which.rows) {
    const x = r.expect.contains[0];
    assert.ok(fruits.includes(x));
    assert.equal(r.expect.notContains.length, 2, 'two decoys named: ' + r.q);
    assert.ok(r.expect.notContains.every((d) => r.q.includes(d) && !fruits.includes(d)));
  }
  const one = ADAPTERS['list-membership'](fixBytes('fruits.json'), { ...FRUIT.make, decoys: ['carrot'] });
  assert.equal(one[1].rows.length, 0, 'which is never asked with fewer than two decoys');
  const full = ADAPTERS['list-membership'](fixBytes('fruits.json'), FRUIT.make);
  assert.ok(full.every((t) => splitTask(t.rows).ok), 'the fixture registry row splits');
  // decoys from a field of the same records
  const recs = [...Array.from({ length: 30 }, (_, i) => ({ m: 'Member' + i, d: 'Decoy' + i }))];
  const viaPath = membershipTasks(recs, { item: 'm', decoysPath: 'd', task: 'syn', noun: 'member' });
  assert.ok(viaPath[0].rows.some((r) => r.q.includes('Decoy')) && viaPath[0].rows.some((r) => /^is Member/.test(r.q) || r.q.includes('Member')));
  assert.ok(viaPath[0].rows.every((r) => r.q.includes(' a member')), 'the article comes from the noun');
});

test('splitTask: deterministic, a normQ repeat kept once, a held-out prompt never a dev prompt under normQ, MIN_ROWS of each', () => {
  const mk = (q, split) => ({ q, expect: { contains: ['x'], notRefusal: true }, answer: 'x', ...(split ? { split } : {}) });
  const rows = [
    ...Array.from({ length: 24 }, (_, i) => mk('dev prompt number ' + i, 'dev')),
    ...Array.from({ length: 12 }, (_, i) => mk('held prompt number ' + i, 'heldout')),
    mk('What is dev prompt number 3?', 'heldout'), mk('DEV PROMPT, number 3', 'heldout'), mk('dev prompt number 5!', 'dev'),
  ];
  const a = splitTask(rows);
  assert.ok(a.ok, a.why);
  assert.equal(a.dev.length, 24, 'the dev repeat is kept once');
  assert.equal(a.heldout.length, 13, 'the two held-out rows that are dev prompts under normQ are dropped, the other new one kept');
  const devQ = new Set(a.dev.map((r) => normQ(r.q)));
  assert.ok(a.heldout.every((r) => !devQ.has(normQ(r.q))));
  assert.ok(a.dev.concat(a.heldout).every((r) => Object.keys(r).join() === 'q,expect,answer'), 'the split tag is not written');
  const shuffled = [...rows].reverse();
  assert.deepEqual(splitTask(shuffled), a, 'the same rows in another order split the same way');
  const untagged = Array.from({ length: 45 }, (_, i) => mk('untagged prompt ' + i));
  const u = splitTask(untagged);
  assert.equal(u.heldout.length, 15, 'an untagged row goes to the held-out set every third');
  assert.deepEqual(splitTask([...untagged].reverse()), u);
  const short = splitTask(rows.slice(0, 30));
  assert.equal(short.ok, false);
  assert.match(short.why, /held-out \d+ rows \(at least 10\)/);
});

// ---- pull
test('pull: every fixture source becomes teacher-format task directories, by absorb:<id>, that teach.mjs check passes', async () => {
  const root = stubRoot();
  const fx = fixtureFetch();
  const out = await pullFx(root, { fx });
  for (const k of ['generation', 'sources', 'fetched', 'bytes', 'tasks', 'rows', 'ms', 'bytesPerSecond', 'blocked', 'cursor']) assert.ok(Object.hasOwn(out, k), 'the line has ' + k);
  assert.equal(out.generation, 7);
  assert.equal(out.sources, 4);
  assert.equal(out.fetched, 4);
  assert.deepEqual(out.blocked, []);
  assert.equal(out.cursor, 0, 'four of four: the ring is back at the start');
  assert.equal(out.bytes, ['capitals.json', 'population.csv', 'fruits.json', 'elements.jsonl'].reduce((s, f) => s + fixBytes(f).length, 0));
  assert.equal(fx.calls.length, 4, 'one GET a source');
  const names = fs.readdirSync(teachDir(root, 7)).sort();
  assert.deepEqual(names, [...FX_TASKS].sort());
  assert.equal(out.tasks, names.length);
  let rows = 0;
  for (const name of names) {
    const dir = path.join(teachDir(root, 7), name);
    const t = readJ(path.join(dir, 'task.json'));
    const src = FX.find((s) => taskNamesOf(s).includes(name));
    assert.deepEqual(Object.keys(t).sort(), ['by', 'domain', 'generation', 'rule', 'skill', 'task']);
    assert.equal(t.by, 'absorb:' + src.id);
    assert.equal(t.task, name);
    assert.equal(t.generation, 7);
    assert.equal(t.domain, src.domain);
    assert.match(t.rule, /\S/);
    const dev = rowsOf(path.join(dir, 'dev.jsonl')), held = rowsOf(path.join(dir, 'heldout.jsonl'));
    assert.ok(dev.length >= MIN_ROWS.dev && held.length >= MIN_ROWS.heldout, name + ' ' + dev.length + '/' + held.length);
    const devQ = new Set(dev.map((r) => normQ(r.q)));
    assert.ok(held.every((r) => !devQ.has(normQ(r.q))), name + ': no held-out prompt is a dev prompt under normQ');
    for (const r of [...dev, ...held]) { assert.deepEqual(Object.keys(r), ['q', 'expect', 'answer']); assert.ok(expectOk(r.answer, r.expect)); assert.ok(r.q.length <= MAX_Q); }
    const s = readJ(path.join(dir, 'source.json'));
    assert.equal(s.id, src.id); assert.equal(s.url, src.url); assert.equal(s.license, src.license);
    assert.equal(s.sha256, sha256(fixBytes(src.url.slice(RAW.length))));
    assert.ok(validateTaskDir(dir, { n: 7, locked: new Set(LOCKED) }).ok);
    rows += dev.length + held.length;
  }
  assert.equal(out.rows, rows);
  // teach.mjs check, the CLI the teacher's arms run, on every directory written
  for (const name of names) {
    const c = teachCli(['check', path.join(teachDir(root, 7), name), '--root', root]);
    assert.equal(c.code, 0, name + ': ' + why1(c) + ' ' + c.stdout);
    const j = lastJson(c.stdout);
    assert.equal(j.ok, true); assert.equal(j.task, name); assert.deepEqual(j.errors, []);
  }
  const ab = readJ(path.join(root, ABSORB));
  assert.equal(ab.cursor, 0);
  assert.deepEqual(ab.pulled.map((p) => p.id), FX.map((s) => s.id));
  for (const p of ab.pulled) for (const k of ['id', 'at', 'bytes', 'sha256', 'tasks', 'rows']) assert.ok(Object.hasOwn(p, k), k);
  assert.equal(ab.bytes, out.bytes); assert.equal(ab.rows, out.rows);
  assert.deepEqual(status(root), { sources: 4, domains: 4, pulled: 4, bytes: out.bytes, rows: out.rows, tasks: out.tasks, cursor: 0 });
});

test('pull then intake: teach.mjs intake opens every absorbed task (a stub organism), the ledger rows carry by absorb:<id>', async () => {
  const root = stubRoot();
  const out = await pullFx(root);
  const asked = [];
  const org = async (rows) => { asked.push(...rows.map((r) => r.q)); return { rows: rows.map((r) => ({ q: r.q, got: 'nothing in memory matches that yet' })) }; };
  const got = await intake(root, { gen: 7, runOrganism: org, now: () => AT });
  assert.deepEqual([...got.opened].sort(), [...FX_TASKS].sort());
  assert.deepEqual(got.refused, []);
  assert.ok(asked.length > 0, 'the organism was asked the dev prompts');
  const led = readJ(path.join(root, LEDGER));
  for (const r of led.tasks) assert.equal(r.by, 'absorb:' + FX.find((s) => taskNamesOf(s).includes(r.task)).id);
  assert.equal(out.tasks, led.tasks.length);
  for (const name of FX_TASKS) assert.ok(fs.existsSync(path.join(root, 'neo', 'tasks', name, 'heldout.jsonl')), name + ' moved to neo/tasks/');
});

test('the cursor is a ring; a source that cannot be fetched or adapted is a blocked line and the cursor still moves; pulled is append only', async () => {
  const BAD = { ...CAP, id: 'fx-missing', url: RAW + 'missing.json', make: { relations: [{ ...CAP.make.relations[0], task: 'fx-missing-a', reverse: { ...CAP.make.relations[0].reverse, task: 'fx-missing-b' } }] } };
  const WRONG = { ...CAP, id: 'fx-wrong-format', url: RAW + 'population.csv', make: { relations: [{ ...CAP.make.relations[0], task: 'fx-wrong-a', reverse: { ...CAP.make.relations[0].reverse, task: 'fx-wrong-b' } }] } };
  const root = stubRoot({ sources: [BAD, CAP, WRONG, POP] });
  const one = await pullFx(root, { maxSources: 1 });
  assert.equal(one.sources, 1); assert.equal(one.fetched, 0); assert.equal(one.cursor, 1);
  assert.equal(one.blocked.length, 1); assert.match(one.blocked[0], /^fx-missing: HTTP 404/);
  let ab = readJ(path.join(root, ABSORB));
  assert.deepEqual(ab.pulled, [], 'nothing was pulled');
  assert.equal(ab.blocked.length, 1); assert.equal(ab.blocked[0].id, 'fx-missing'); assert.match(ab.blocked[0].why, /HTTP 404/);
  const two = await pullFx(root, { maxSources: 2, gen: 8 });
  assert.equal(two.cursor, 3);
  assert.equal(two.fetched, 2);
  assert.ok(two.blocked.some((b) => /^fx-wrong-format: adapter json-relation: neither JSON nor JSON lines/.test(b)), JSON.stringify(two.blocked));
  ab = readJ(path.join(root, ABSORB));
  assert.deepEqual(ab.pulled.map((p) => p.id), ['fx-capitals', 'fx-wrong-format']);
  assert.match(ab.pulled[1].blocked, /adapter json-relation/);
  assert.equal(ab.pulled[1].tasks, 0);
  const before = JSON.stringify(ab.pulled);
  const three = await pullFx(root, { maxSources: 3, gen: 9 });
  assert.equal(three.cursor, 2, 'the ring wraps: POP, BAD, CAP, and the cursor waits at WRONG');
  assert.ok(three.blocked.some((b) => /^fx-missing: HTTP 404/.test(b)), 'the blocked source came round again');
  ab = readJ(path.join(root, ABSORB));
  assert.equal(JSON.stringify(ab.pulled.slice(0, 2)), before, 'pulled is append only');
  assert.deepEqual(ab.pulled.map((p) => p.id), ['fx-capitals', 'fx-wrong-format', 'fx-population', 'fx-capitals']);
  assert.equal(ab.blocked.length, 3);
  assert.equal(status(root).pulled, 4);
  assert.equal(status(root).cursor, 2);
});

test('a spent time or byte budget stops the pull and the sources not reached keep their place', async () => {
  const time = stubRoot({ sources: [CAP, POP, FRUIT] });
  let t = 0;
  const clocked = await pullFx(time, { maxSources: 3, maxMs: 1500, clock: () => (t += 1000) });
  assert.equal(clocked.sources, 1, 'one source, then the clock is spent');
  assert.equal(clocked.cursor, 1, 'the cursor stops at the first source not reached');
  assert.ok(clocked.blocked.some((b) => /the time budget of 1500 ms is spent; 2 sources wait for the next pull/.test(b)), JSON.stringify(clocked.blocked));
  assert.deepEqual(readJ(path.join(time, ABSORB)).blocked, [], 'a spent budget is not a failed source');
  const bytes = stubRoot({ sources: [CAP, POP, FRUIT] });
  const capLen = fixBytes('capitals.json').length;
  const b = await pullFx(bytes, { maxSources: 3, maxBytes: capLen });
  assert.equal(b.fetched, 1); assert.equal(b.bytes, capLen);
  assert.equal(b.cursor, 1);
  assert.ok(b.blocked.some((x) => /the byte budget of \d+ bytes is spent; 2 sources wait/.test(x)), JSON.stringify(b.blocked));
  // a source bigger than what is left cannot be fetched: blocked, and the cursor moves past it
  const over = stubRoot({ sources: [CAP, POP, FRUIT] });
  const o = await pullFx(over, { maxSources: 2, maxBytes: capLen - 1 });
  assert.match(o.blocked[0], /^fx-capitals: over the byte budget/);
  assert.equal(o.fetched, 1); assert.equal(o.cursor, 2);
  // each source gets only what the sources before it left, not the whole budget again
  const later = stubRoot({ sources: [FRUIT, CAP, POP] });
  const fruitLen = fixBytes('fruits.json').length;
  const l = await pullFx(later, { maxSources: 2, maxBytes: fruitLen + capLen - 1 });
  assert.equal(l.fetched, 1); assert.equal(l.bytes, fruitLen);
  assert.ok(l.bytes <= fruitLen + capLen - 1, 'the pull never holds more than its byte budget');
  assert.match(l.blocked[0], new RegExp('^fx-capitals: over the byte budget: more than ' + (capLen - 1) + ' bytes'));
  assert.equal(l.cursor, 2, 'the source over what is left is blocked and the cursor moves past it');
});

test('a task the ledger holds: from the same bytes it is known and never written; from changed bytes it is written as <task>-<sha6>', async () => {
  const root = stubRoot({ sources: [CAP] });
  await pullFx(root, { maxSources: 1 });
  await intake(root, { gen: 7, runOrganism: async (rows) => ({ rows: rows.map((r) => ({ q: r.q, got: 'nothing in memory matches that yet' })) }), now: () => AT });
  assert.deepEqual(readJ(path.join(root, LEDGER)).tasks.map((r) => r.task).sort(), ['fx-capital-country', 'fx-country-capital']);
  const again = await pullFx(root, { maxSources: 1, gen: 8 });
  assert.equal(again.known, 2); assert.equal(again.tasks, 0);
  assert.equal(fs.existsSync(teachDir(root, 8)), false, 'nothing written');
  const caps = readJ(path.join(FIX, 'capitals.json'));
  const changed = Buffer.from(JSON.stringify([...caps, { country: 'Testland', city: 'Testville' }]));
  const fx = fixtureFetch({ [CAP.url]: () => new Response(changed, { status: 200 }) });
  const moved = await pullFx(root, { maxSources: 1, gen: 9, fx });
  const six = sha256(changed).slice(0, 6);
  assert.deepEqual(fs.readdirSync(teachDir(root, 9)).sort(), ['fx-capital-country-' + six, 'fx-country-capital-' + six]);
  for (const d of fs.readdirSync(teachDir(root, 9))) { assert.match(d, TASK_RE); assert.equal(readJ(path.join(teachDir(root, 9), d, 'task.json')).skill, d.slice(0, -7)); }
  assert.equal(moved.tasks, 2);
  // intake of generation 9 never ran: the next pull of those bytes writes them again (the ledger holds neither -sha6 name)
  const twice = await pullFx(root, { maxSources: 1, gen: 10, fx });
  assert.equal(twice.tasks, 2, 'a task no intake opened is never lost');
  assert.equal(twice.known, 0);
  assert.equal(fs.readdirSync(teachDir(root, 10)).length, 2);
  // a name a teacher arm opened with other rows: the absorbed task takes the -sha6 name, from unchanged bytes too
  const arm = stubRoot({ sources: [CAP], ledger: { tasks: [{ task: 'fx-country-capital', devSha: 'a'.repeat(64), by: 'teach-g1-b1' }], generated: 0 } });
  const a = await pullFx(arm, { maxSources: 1 });
  const six0 = sha256(fixBytes('capitals.json')).slice(0, 6);
  assert.deepEqual(fs.readdirSync(teachDir(arm, 7)).sort(), ['fx-capital-country', 'fx-country-capital-' + six0]);
  assert.equal(a.known, 0);
});

test('a directory intake opened, or refused for the same bytes, is not written again; refused for other bytes it is', async () => {
  const root = stubRoot({ sources: [CAP] });
  await pullFx(root, { maxSources: 1 });
  const dirA = path.join(teachDir(root, 7), 'fx-country-capital'), dirB = path.join(teachDir(root, 7), 'fx-capital-country');
  fs.writeFileSync(path.join(dirA, OPENED_MARK), '{}\n');
  fs.writeFileSync(path.join(dirA, 'dev.jsonl'), 'SENTINEL-A\n');
  fs.writeFileSync(path.join(dirB, REFUSED_MARK), '{"why":["a test"]}\n');
  fs.writeFileSync(path.join(dirB, 'dev.jsonl'), 'SENTINEL-B\n');
  const again = await pullFx(root, { maxSources: 1 });
  assert.equal(again.known, 2); assert.equal(again.tasks, 0);
  assert.equal(read(path.join(dirA, 'dev.jsonl')), 'SENTINEL-A\n', 'an opened directory is never touched');
  assert.equal(read(path.join(dirB, 'dev.jsonl')), 'SENTINEL-B\n', 'refused for these very bytes: not written again');
  const s = readJ(path.join(dirB, 'source.json'));
  fs.writeFileSync(path.join(dirB, 'source.json'), JSON.stringify({ ...s, sha256: 'f'.repeat(64) }) + '\n');
  const third = await pullFx(root, { maxSources: 1 });
  assert.equal(third.tasks, 1);
  assert.notEqual(read(path.join(dirB, 'dev.jsonl')), 'SENTINEL-B\n', 'refused for other bytes: written again');
  assert.equal(fs.existsSync(path.join(dirB, REFUSED_MARK)), false, 'the stale refusal is removed');
  assert.ok(validateTaskDir(dirB, { n: 7 }).ok);
});

test('a written directory that teach.mjs check would refuse is removed and blocked, never left for intake', async () => {
  const root = stubRoot({ sources: [FRUIT] });
  const orig = fs.writeFileSync;
  const target = path.join('fx-fruit-which', 'heldout.jsonl');
  // a fault on the disk: the held-out file of one task lands short
  fs.writeFileSync = function (p, data, ...rest) { return orig.call(this, p, String(p).endsWith(target) ? String(data).split('\n').slice(0, 3).join('\n') + '\n' : data, ...rest); };
  let out;
  try { out = await pullFx(root, { maxSources: 1 }); } finally { fs.writeFileSync = orig; }
  assert.equal(fs.existsSync(path.join(teachDir(root, 7), 'fx-fruit-which')), false, 'the refused directory is gone');
  assert.ok(out.blocked.some((b) => /^fx-fruits: fx-fruit-which: teach check refused it: heldout\.jsonl has 3 rows, under 10/.test(b)), JSON.stringify(out.blocked));
  assert.deepEqual(out.dirs, ['work/grow/gen-7/teach/fx-fruit-member']);
  assert.equal(out.tasks, 1);
  assert.ok(validateTaskDir(path.join(teachDir(root, 7), 'fx-fruit-member'), { n: 7 }).ok);
});

test('a directory another writer left in the generation (a teacher arm, another source) is never written into', async () => {
  const OTHER = { ...CAP, id: 'fx-capitals-mirror' };
  const root = stubRoot({ sources: [CAP, OTHER] });
  const arm = path.join(teachDir(root, 7), 'fx-country-capital');
  fs.mkdirSync(arm, { recursive: true });
  const armFiles = { 'task.json': JSON.stringify({ task: 'fx-country-capital', skill: 'fx-country-capital', domain: 'geo', rule: 'r', generation: 7, by: 'teach-g7-b1' }) + '\n', 'dev.jsonl': 'ARM-DEV\n', 'next.jsonl': 'ARM-NEXT\n' };
  for (const [f, t] of Object.entries(armFiles)) fs.writeFileSync(path.join(arm, f), t);
  const six = sha256(fixBytes('capitals.json')).slice(0, 6);
  const one = await pullFx(root, { maxSources: 1 });
  for (const [f, t] of Object.entries(armFiles)) assert.equal(read(path.join(arm, f)), t, 'the arm\'s ' + f + ' is untouched');
  assert.deepEqual(fs.readdirSync(arm).sort(), Object.keys(armFiles).sort(), 'nothing added to the arm\'s directory');
  assert.deepEqual(fs.readdirSync(teachDir(root, 7)).sort(), ['fx-capital-country', 'fx-country-capital', 'fx-country-capital-' + six]);
  assert.equal(one.tasks, 2);
  // an earlier pull's directory of ANOTHER source with the same task names: neither is overwritten, the -sha6 name of
  // the arm's task is taken too, so that task is dropped
  const before = read(path.join(teachDir(root, 7), 'fx-capital-country', 'dev.jsonl'));
  const two = await pullFx(root, { maxSources: 1 });
  assert.equal(two.tasks, 1, JSON.stringify(two));
  assert.equal(readJ(path.join(teachDir(root, 7), 'fx-capital-country', 'source.json')).id, 'fx-capitals', 'the first source keeps its directory');
  assert.equal(read(path.join(teachDir(root, 7), 'fx-capital-country', 'dev.jsonl')), before);
  assert.equal(readJ(path.join(teachDir(root, 7), 'fx-capital-country-' + six, 'source.json')).id, 'fx-capitals-mirror');
  assert.equal(readJ(path.join(teachDir(root, 7), 'fx-country-capital-' + six, 'source.json')).id, 'fx-capitals', 'the -sha6 directory of the first source is not overwritten');
  assert.ok(two.dropped.some((d) => d.startsWith('fx-country-capital-' + six + ': another writer holds')), JSON.stringify(two.dropped));
  for (const [f, t] of Object.entries(armFiles)) assert.equal(read(path.join(arm, f)), t);
  // this source's own directory (its source.json names it) is written again
  const three = await pullFx(root, { maxSources: 1 });
  assert.equal(three.tasks, 2, JSON.stringify(three));
});

test('a registry row that is wrong is blocked before any fetch, and the cursor moves past it', async () => {
  const rel = CAP.make.relations[0];
  const bad = [
    [{ ...CAP, url: 'http://raw.githubusercontent.com/a/b' }, /url: not https/],
    [{ ...CAP, url: 'https://example.com/a.json' }, /not in ALLOWED_HOSTS/],
    [{ ...CAP, kind: 'xml-relation' }, /names no adapter/],
    [{ ...CAP, license: '' }, /license is not a non-empty string/],
    [{ ...CAP, domain: 7 }, /domain is not a non-empty string/],
    [{ ...CAP, id: 'Bad Id' }, /id is not/],
    [{ ...CAP, make: { relations: [{ ...rel, task: 'capital-of' }] } }, /capital-of is a locked class/],
    [{ ...CAP, make: { relations: [{ ...rel, task: 'Has Caps' }] } }, /is not a TASK_RE name/],
    [{ ...CAP, make: { relations: [{ ...rel, task: 'x'.repeat(35) }] } }, /at most 34 characters/],
    [{ ...CAP, make: { relations: [{ ...rel, templates: ['a {key}', 'b {key}'] }] } }, /needs 3 or more templates/],
    [{ ...CAP, make: { relations: [{ ...rel, templates: T4('a {key}', 'b', 'c {key}', 'd {key}') }] } }, /each with \{key\}/],
    [{ ...CAP, make: { relations: [{ ...rel, reverse: 'yes' }] } }, /reverse is not an object/],
    [{ ...CAP, make: { relations: [{ ...rel, answer: 'The capital of {key} is {value}, see process.env' }] } }, /a template uses process/],
    [{ ...CAP, make: { relations: [{ ...rel, templates: T4('a {key}', 'b {key}', 'c {key}', 'require(x) {key}') }] } }, /a template uses require/],
    [{ ...CAP, make: { relations: [{ ...rel, valueLabel: 'globalThis' }] } }, /a template uses globalThis/],
    [{ ...CAP, make: { relations: [{ ...rel, answer: 'no slot here' }] } }, /answer is not a template with \{value\}/],
    [{ ...CAP, make: { format: 'xml', relations: [rel] } }, /make.format is not one of/],
    [{ ...CAP, make: { match: { country: '([' }, relations: [rel] } }, /make.match.country is not a regular expression/],
    [{ ...CAP, make: { relations: [{ ...rel, reverse: { task: rel.task } }] } }, /names one task twice/],
    [{ ...CAP, make: null }, /make is not an object/],
    [{ ...POP, make: { numerics: [{ key: 'country', value: 'population', noun: 'population', task: 'fx-pop', tasks: ['median'] }] } }, /numeric task "median"/],
    [{ ...FRUIT, make: { ...FRUIT.make, decoys: undefined } }, /make.decoys \(a list\) or make.decoysPath/],
    [{ ...FRUIT, make: { ...FRUIT.make, tasks: ['guess'] } }, /membership task "guess"/],
  ];
  for (const [row, re] of bad) assert.ok(sourceErrors(row, new Set(LOCKED)).some((e) => re.test(e)), re + ' in ' + JSON.stringify(sourceErrors(row, new Set(LOCKED))));
  for (const s of FX) assert.deepEqual(sourceErrors(s, new Set(LOCKED)), [], s.id);
  assert.deepEqual(sourceErrors('x'), ['not a JSON object']);
  assert.ok(FORMATS.includes('jsonl') && ID_RE.test('fx-capitals'));
  const root = stubRoot({ sources: [bad[1][0], bad[6][0], CAP] });
  const fx = fixtureFetch();
  const out = await pullFx(root, { maxSources: 2, fx });
  assert.deepEqual(fx.calls, [], 'no fetch for a refused row');
  assert.equal(out.cursor, 2);
  assert.ok(out.blocked.every((b) => /refused before any fetch/.test(b)) && out.blocked.length === 2, JSON.stringify(out.blocked));
});

test('a broken neo/ABSORB.json or a missing registry fails, and the record is never rewritten', async () => {
  const broken = stubRoot({ absorb: '{ not json' });
  await assert.rejects(pullFx(broken), /neo\/ABSORB\.json is not JSON/);
  assert.equal(read(path.join(broken, ABSORB)), '{ not json', 'the record is left for a human session');
  assert.equal(fs.existsSync(teachDir(broken, 7)), false);
  const wrong = stubRoot({ absorb: { pulled: 'nope' } });
  await assert.rejects(pullFx(wrong), /is not \{ cursor, pulled/);
  const none = stubRoot({ sources: null });
  await assert.rejects(pullFx(none), /neo\/sources\.json is missing/);
  assert.throws(() => status(none), /neo\/sources\.json is missing/);
  const notList = stubRoot();
  fs.writeFileSync(path.join(notList, SOURCES), '{"sources":{}}');
  await assert.rejects(pullFx(notList), /is not \{ sources: \[\.\.\] \}/);
  const empty = stubRoot({ sources: [] });
  const out = await pullFx(empty);
  assert.equal(out.sources, 0); assert.equal(out.cursor, 0);
  const cur = stubRoot({ sources: [CAP], absorb: { cursor: 5, pulled: [], bytes: 0, rows: 0 } });
  assert.equal((await pullFx(cur, { maxSources: 1 })).fetched, 1, 'a cursor past the end is read modulo the registry');
});

test('the same bytes give the same tasks: two roots, byte-identical directories', async () => {
  const a = stubRoot(), b = stubRoot();
  await pullFx(a); await pullFx(b, { now: () => '2026-10-02T00:00:00.000Z' });
  for (const name of FX_TASKS) for (const f of ['dev.jsonl', 'heldout.jsonl', 'task.json']) assert.equal(read(path.join(teachDir(a, 7), name, f)), read(path.join(teachDir(b, 7), name, f)), name + '/' + f);
  for (const s of FX) assert.deepEqual(ADAPTERS[s.kind](fixBytes(s.url.slice(RAW.length)), s.make), ADAPTERS[s.kind](fixBytes(s.url.slice(RAW.length)), s.make));
});

// ---- the CLI
test('CLI: --help and a bare call print usage (exit 0); an unknown verb, an unknown flag, a bad number exit 2; status and pull print one JSON line', async () => {
  for (const args of [['--help'], [], ['help']]) {
    const h = cli(args);
    assert.equal(h.code, 0, args.join(' '));
    assert.equal(h.stdout.trim(), USAGE);
    assert.match(h.stdout, /^usage: node grow\/absorb\.mjs/);
  }
  const root = stubRoot();
  const v = cli(['absorb-all', '--root', root]);
  assert.equal(v.code, 2); assert.match(why1(v), /unknown verb absorb-all/);
  for (const args of [['status', '--bogus', '1'], ['pull', '--max-sources', '0'], ['pull', '--max-sources', '257'], ['pull', '--gen', 'x'], ['pull', '--max-bytes', '-1'], ['pull', '--max-ms', '1.5'], ['pull', '--fetch-timeout-ms', '0'], ['pull', '--gen']]) {
    const r = cli([...args, '--root', root]);
    assert.equal(r.code, 2, args.join(' ') + ': ' + why1(r));
    assert.equal(r.stdout, '', 'nothing on stdout');
    assert.equal(r.stderr.trim().split('\n').length, 1, 'one stderr line');
  }
  const s = cli(['status', '--root', root]);
  assert.equal(s.code, 0);
  assert.equal(s.stdout.trim().split('\n').length, 1);
  assert.deepEqual(lastJson(s.stdout), { sources: 4, domains: 4, pulled: 0, bytes: 0, rows: 0, tasks: 0, cursor: 0 });
  // a real child pull that cannot reach the network: its only row is refused before any socket opens
  const off = stubRoot({ sources: [{ ...CAP, id: 'fx-offsite', url: 'https://example.com/capitals.json' }] });
  const p = cli(['pull', '--gen', '3', '--root', off]);
  assert.equal(p.code, 0, why1(p));
  assert.equal(p.stdout.trim().split('\n').length, 1);
  const j = lastJson(p.stdout);
  assert.equal(j.generation, 3); assert.equal(j.sources, 1); assert.equal(j.fetched, 0); assert.equal(j.cursor, 0);
  assert.match(j.blocked[0], /fx-offsite: the registry row is refused before any fetch: url: the host example\.com is not in ALLOWED_HOSTS/);
  const missing = cli(['status', '--root', path.join(TMP, 'no-such-root')]);
  assert.equal(missing.code, 1); assert.equal(missing.stdout, ''); assert.match(why1(missing), /neo\/sources\.json is missing/);
  // main is the CLI as a function, and the network it uses is the one it is handed
  const fx = fixtureFetch();
  const m = await main(['pull', '--gen', '4', '--max-sources', '2', '--root', root], { fetch: fx.fn });
  assert.equal(m.generation, 4); assert.equal(m.fetched, 2); assert.equal(fx.calls.length, 2);
  assert.deepEqual(await main([]), { usage: true });
  await assert.rejects(main(['pull', '--max-sources', 'x', '--root', root]), (e) => e.code === 2);
});

// ---- the files never opened, and the source itself
test('pull and status never open state/, judge/heldout/, judge/control.jsonl, a judge/dev file or a neo/tasks/*/heldout.jsonl', async () => {
  const root = stubRoot();
  fs.mkdirSync(path.join(root, 'judge', 'heldout'), { recursive: true });
  fs.writeFileSync(path.join(root, 'judge', 'heldout', 'math.jsonl'), 'HELDOUT-SENTINEL\n');
  fs.writeFileSync(path.join(root, 'judge', 'control.jsonl'), 'CONTROL-SENTINEL\n');
  fs.mkdirSync(path.join(root, 'state', 'grow'), { recursive: true });
  fs.writeFileSync(path.join(root, 'state', 'grow', 'x.json'), '{}');
  fs.mkdirSync(path.join(root, 'neo', 'tasks', 'old-task'), { recursive: true });
  fs.writeFileSync(path.join(root, 'neo', 'tasks', 'old-task', 'heldout.jsonl'), 'TASK-HELDOUT-SENTINEL\n');
  const FORBID = /judge[\\/]heldout|control\.jsonl|[\\/]state([\\/]|$)|neo[\\/]tasks[\\/][^\\/]+[\\/]heldout\.jsonl/;
  const DEVFILE = /judge[\\/]dev[\\/][^\\/]+$/;
  const seen = [], bad = [];
  const names = ['readFileSync', 'openSync', 'readdirSync', 'statSync', 'lstatSync', 'existsSync', 'createReadStream', 'writeFileSync', 'mkdirSync', 'rmSync', 'readFile', 'open'];
  const orig = Object.fromEntries(names.map((k) => [k, fs[k]]));
  for (const k of names) {
    fs[k] = function (p, ...rest) {
      const s = String(p);
      seen.push(k + ' ' + s);
      if (FORBID.test(s) || (k !== 'readdirSync' && DEVFILE.test(s))) { bad.push(k + ' ' + s); throw new Error('the trap: ' + k + ' ' + s); }
      return orig[k].call(this, p, ...rest);
    };
  }
  let out;
  try {
    out = await pullFx(root);
    status(root);
    await main(['status', '--root', root]);
  } finally { for (const k of names) fs[k] = orig[k]; }
  assert.deepEqual(bad, []);
  assert.ok(seen.some((s) => /readdirSync .*judge[\\/]dev$/.test(s)), 'judge/dev/ is read by NAME (the locked classes)');
  assert.ok(seen.some((s) => /sources\.json/.test(s)), 'the recorder saw the reads');
  assert.equal(out.tasks, FX_TASKS.length, 'the trapped pull still did its work');
  assert.equal(read(path.join(root, 'neo', 'tasks', 'old-task', 'heldout.jsonl')), 'TASK-HELDOUT-SENTINEL\n');
});

test('grow/absorb.mjs: no model call, no eval, no new Function, no dynamic import, no child process; imports only node: builtins and local modules', () => {
  const src = read(path.join(BRAIN, 'grow', 'absorb.mjs'));
  const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*\*)/.test(l)).join('\n');
  for (const re of [/\beval\s*\(/, /\bnew\s+Function\b/, /\bimport\s*\(/, /child_process/, /\brequire\s*\(/, /\bspawn|\bexecSync|\bexecFile/, /\bvm\b\s*\./, /node:vm|worker_threads/]) assert.doesNotMatch(code, re);
  for (const re of [/localhost:11434|\/api\/generate|\/api\/chat/, /api\.anthropic\.com|api\.openai\.com|generativelanguage/, /ANTHROPIC_API_KEY|OPENAI_API_KEY/]) assert.doesNotMatch(src, re, 'no model endpoint: ' + re);
  const imports = [...src.matchAll(/^\s*import\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.deepEqual(imports, ['node:fs', 'node:path', 'node:crypto', 'node:url', './contract.mjs', './generation.mjs', './teach.mjs', '../judge/judge.mjs']);
  assert.doesNotMatch(src, /\u2014/, 'no em-dash');
  // the network is only ever reached through the injected fetch, after urlRefusal
  assert.deepEqual([...code.matchAll(/\bfetch\w*\s*\(/g)].map((m) => m[0].replace(/\s/g, '')).sort(), ['fetchBytes(', 'fetchBytes(', 'fetchFn('].sort());
});

test('the seed registry: 24+ sources across 10+ domains, all on raw.githubusercontent.com, licensed, proven by one GET, every row valid', () => {
  const reg = readJ(path.join(BRAIN, SOURCES));
  const rows = reg.sources;
  assert.ok(rows.length >= 24, 'sources: ' + rows.length);
  const domains = new Set(rows.map((s) => s.domain));
  assert.ok(domains.size >= 10, 'domains: ' + domains.size);
  const locked = new Set(lockedClasses(BRAIN));
  assert.ok(locked.size > 0, 'the real tree has locked classes in judge/dev/');
  const ids = rows.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  const names = rows.flatMap((s) => taskNamesOf(s));
  assert.equal(new Set(names).size, names.length, 'task names are unique across the registry');
  for (const s of rows) {
    assert.deepEqual(sourceErrors(s, locked), [], s.id);
    assert.equal(new URL(s.url).hostname, 'raw.githubusercontent.com', s.id);
    assert.match(s.license, /^(MIT|ODbL-1\.0|CC0-1\.0|CC-BY-4\.0|CC-BY-SA-3\.0|CC-BY-SA-4\.0|ODC-PDDL-1\.0|Unlicense)$/, s.id + ' names an open licence');
    assert.ok(s.checked && s.checked.status === 200, s.id + ' answered 200 from this machine');
    assert.ok(Number.isInteger(s.checked.bytes) && s.checked.bytes > 0 && s.checked.bytes <= 8000000, s.id + ' fits the default byte budget');
    assert.match(s.checked.sha256, /^[0-9a-f]{64}$/);
    assert.ok(!Number.isNaN(Date.parse(s.checked.at)), s.id);
  }
  assert.doesNotMatch(read(path.join(BRAIN, SOURCES)), /\u2014/, 'no em-dash');
});
