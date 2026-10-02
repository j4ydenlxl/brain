// test/ask-http.test.mjs: the ask over HTTP (act/ask-http.mjs, api/ask.mjs, bin/ask-serve.mjs; queue item 12).
// Author: board 18 builder.
// The handler answers what the CLI answers with the CLI footer fields, caps and rate-limits, keeps
// the key out of every byte it returns or logs, and its process reaches the model origin and nothing
// else. The model cell is exercised only against a mock listener on 127.0.0.1 and a dead port, each in
// a child process so each gets its own cold start and its own egress guard.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHandler as createHandlerAt, FOOTER, LIMITS, NOT_CONFIGURED, modelConfigured, keyNameFor, OIDC_NAME, appUrl, THREAD, REQUESTS_ROOT_NAME, appendRequest, lastOf, requestsRootFor, servingOf, threadOf } from '../act/ask-http.mjs';
import { buildRequest } from '../grow/app-slug.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-http-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } });
const KEY = 'plantedkey-3141592653-not-a-real-key';
// THE SUITE'S OWN ROOT (2026-10-02): a grown/index.mjs with no survivor and no knowledge pack, so no handler of this file
// answers from what the tree's grown/ or neo/know/ hold (the organism changes both every era). NO_NATIVE: a root with
// nothing, for the children whose module hook plants a grown cell over the tree's own index.
const FIX = fs.mkdtempSync(path.join(TMP, 'root-'));
fs.mkdirSync(path.join(FIX, 'grown'));
fs.writeFileSync(path.join(FIX, 'grown', 'index.mjs'), 'export const GROWN = Object.freeze([]);\nexport function grownAnswer() { return null; }\n');
const NO_NATIVE = path.join(TMP, 'no-native');
const createHandler = (o = {}) => createHandlerAt({ root: FIX, ...o });
const post = (prompt, extra = {}) => ({ method: 'POST', body: JSON.stringify({ prompt }), ip: '10.0.0.1', env: {}, ...extra });

test('POST "what is 17 times 23" answers 391, route direct, provenance exact, an integer serverUs, the CLI footer fields', async () => {
  const h = createHandler({ stateDir: path.join(TMP, 'a'), grown: false });
  const r = await h(post('what is 17 times 23'));
  assert.equal(r.status, 200);
  assert.equal(r.json.exact.answer, '391');
  assert.equal(r.json.route, 'direct');
  assert.equal(r.json.provenance.answer, 'exact');
  assert.ok(Number.isInteger(r.json.serverUs) && r.json.serverUs >= 0, 'serverUs ' + r.json.serverUs);
  assert.ok(Number.isInteger(r.json.exact.ns));
  for (const k of FOOTER) assert.ok(k in r.json, 'footer field ' + k);
  assert.equal(r.json.host, 'local');
  assert.equal(typeof r.json.knowledge.ready, 'boolean');
  assert.equal(r.json.llm.provider, null);
  assert.match(r.json.llm.reason, /not asked/);
  assert.equal(r.headers['content-type'], 'application/json; charset=utf-8');
  // a novel prompt with no model configured says so, in the footer, with its route
  const n = await h(post('write a poem about the sea'));
  assert.equal(n.status, 200);
  assert.equal(n.json.route, 'direct');
  assert.equal(n.json.llm.provider, 'null');
  assert.equal(n.json.llm.reason, NOT_CONFIGURED);
  assert.equal(n.json.model.configured, false);
  // the log holds the hash and the status, never the prompt
  const log = fs.readFileSync(h.logFile, 'utf8');
  assert.equal(log.trim().split('\n').length, 2);
  assert.doesNotMatch(log, /17 times 23|poem about the sea/);
  assert.match(log, /"promptHash":"[0-9a-f]{16}"/);
});

test('GET returns the usage line with the footer field names; OPTIONS has no star origin; another origin is refused', async () => {
  const h = createHandler({ stateDir: path.join(TMP, 'b'), grown: false });
  const g = await h({ method: 'GET', env: {} });
  assert.equal(g.status, 200);
  assert.match(g.json.usage, /POST/);
  assert.deepEqual(g.json.footer, FOOTER.slice());
  for (const k of ['text', 'route', 'provenance', 'llm', 'serverUs', 'host', 'knowledge']) assert.ok(g.json.footer.includes(k), k);
  const o = await h({ method: 'OPTIONS', headers: { origin: 'https://dilation.dev', host: 'dilation.dev' }, env: {} });
  assert.equal(o.status, 204);
  assert.equal(o.json, null);
  for (const [k, v] of Object.entries(o.headers)) { assert.notEqual(k.toLowerCase(), 'access-control-allow-origin'); assert.notEqual(v, '*'); }
  const x = await h(post('what is 17 times 23', { headers: { origin: 'https://evil.example', host: 'dilation.dev' } }));
  assert.equal(x.status, 403);
  const same = await h(post('what is 17 times 23', { headers: { origin: 'https://dilation.dev', host: 'dilation.dev' } }));
  assert.equal(same.status, 200);
  assert.equal((await h({ method: 'DELETE', env: {} })).status, 405);
});

test('caps: over 2000 chars is 413, a body that is not JSON is 400, no prompt is 400', async () => {
  const h = createHandler({ stateDir: path.join(TMP, 'c'), grown: false });
  assert.equal((await h(post('x'.repeat(LIMITS.promptChars)))).status, 200);
  const big = await h(post('x'.repeat(LIMITS.promptChars + 1)));
  assert.equal(big.status, 413);
  assert.equal(big.json.promptChars, 2001);
  assert.equal((await h({ method: 'POST', body: '{"prompt": nope', ip: 'y', env: {} })).status, 400);
  assert.equal((await h({ method: 'POST', body: '', ip: 'y', env: {} })).status, 400);
  assert.equal((await h({ method: 'POST', body: '{"q":"hi"}', ip: 'y', env: {} })).status, 400);
  assert.equal((await h({ method: 'POST', body: { prompt: 'what is 2 plus 2' }, ip: 'y', env: {} })).json.exact.answer, '4', 'a body the platform already parsed');
  assert.equal((await h({ method: 'POST', body: 'x'.repeat(LIMITS.bodyBytes + 1), ip: 'y', env: {} })).status, 413);
});

test('the per-IP bucket answers 429 on the 21st ask inside one minute with Retry-After, and refills on a planted clock', async () => {
  const h = createHandler({ stateDir: path.join(TMP, 'd'), grown: false });
  const T = 1_800_000_000_000;
  for (let i = 0; i < LIMITS.ipPerMin; i++) assert.equal((await h(post('what is 17 times 23', { now: T + i }))).status, 200, 'ask ' + (i + 1));
  const r = await h(post('what is 17 times 23', { now: T + 20 }));
  assert.equal(r.status, 429);
  const wait = Number(r.headers['retry-after']);
  assert.ok(Number.isInteger(wait) && wait >= 1 && wait <= 60, 'Retry-After ' + r.headers['retry-after']);
  assert.equal((await h(post('what is 17 times 23', { now: T + 20, ip: '10.0.0.2' }))).status, 200, 'another client has its own bucket');
  assert.equal((await h(post('what is 17 times 23', { now: T + 20 + wait * 1000 }))).status, 200, 'refilled after Retry-After');
  assert.equal((await h(post('what is 17 times 23', { now: T + 20 + wait * 1000 }))).status, 429, 'one token, not a full bucket');
  assert.equal((await h(post('what is 17 times 23', { now: T + 20 + 60_000 + wait * 1000 }))).status, 200, 'a minute refills');
});

test('the per-instance bucket answers 429 past 300 asks a minute from many clients', async () => {
  const h = createHandler({ stateDir: path.join(TMP, 'e'), grown: false });
  const T = 1_800_000_000_000;
  let ok = 0, limited = null;
  for (let i = 0; i < LIMITS.instancePerMin + 1; i++) {
    const r = await h({ method: 'POST', body: '{"prompt":"what is 1 plus 1"}', ip: 'client-' + i, env: {}, now: T });
    if (r.status === 200) ok++; else { limited = r; break; }
  }
  assert.equal(ok, LIMITS.instancePerMin);
  assert.equal(limited.status, 429);
  assert.match(limited.json.error, /per instance/);
  assert.ok(Number(limited.headers['retry-after']) >= 1);
});

// ---------------------------------------------------------------- the model cell, in child processes
function child(code, env) {
  return new Promise((ok) => {
    const c = spawn(process.execPath, ['--input-type=module', '-e', code], { env: { PATH: process.env.PATH, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { err += d; });
    const t = setTimeout(() => c.kill(), 60_000);
    c.on('exit', (code2) => { clearTimeout(t); ok({ code: code2, out, err }); });
  });
}
const HANDLER = pathToFileURL(path.join(ROOT, 'act', 'ask-http.mjs')).href;
const script = (stateDir) => `
const http = await import('node:http');
const own = http.createServer((q, s) => s.end('own server'));
await new Promise((r) => own.listen(0, '127.0.0.1', r));
const m = await import(${JSON.stringify(HANDLER)});
const h = m.createHandler({ stateDir: ${JSON.stringify(stateDir)}, grown: false, root: ${JSON.stringify(FIX)} });
const r = await h({ method: 'POST', body: JSON.stringify({ prompt: 'write a poem about the sea' }), ip: 'c' });
let egress = null;
try { await fetch('http://example.com/'); egress = 'reached'; } catch (e) { egress = e.code || String(e); }
let other = null;
try { await fetch('http://127.0.0.1:9/'); other = 'reached'; } catch (e) { other = e.code || String(e); }
let mine = null;
try { mine = await (await fetch('http://127.0.0.1:' + own.address().port + '/')).text(); } catch (e) { mine = e.code || String(e); }
let mineHttp = await new Promise((ok) => { const q = http.request({ host: '127.0.0.1', port: own.address().port, path: '/' }, (res) => { let t = ''; res.on('data', (d) => { t += d; }); res.on('end', () => ok(t)); }); q.on('error', (e) => ok(e.code || String(e))); q.end(); });
console.log('RESULT ' + JSON.stringify({ r, egress, other, mine, mineHttp, guard: !!globalThis.__brainEgressGuard }));
own.closeAllConnections(); own.close();
process.exit(0);
`;
const result = (o) => { const l = o.out.split('\n').find((x) => x.startsWith('RESULT ')); assert.ok(l, 'no RESULT line: ' + o.out + o.err); return JSON.parse(l.slice(7)); };

test('with BOTH names set the env provider answers through a mock on 127.0.0.1; the key never leaves; nothing else is reachable', async () => {
  const seen = [];
  const mock = http.createServer((req, res) => {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => {
      seen.push({ url: req.url, auth: req.headers.authorization, body: b });
      res.writeHead(200, { 'content-type': 'application/json' });
      // the mock echoes the header back, the way a careless provider does: the scrub must catch it
      res.end(JSON.stringify({ model: 'mock-1', choices: [{ message: { content: 'The sea is wide and grey. (header ' + req.headers.authorization + ')' } }], usage: { completion_tokens: 9 } }));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  const dir = path.join(TMP, 'mock');
  try {
    const o = await child(script(dir), { BRAIN_LLM_BASE: 'http://127.0.0.1:' + mock.address().port + '/v1', BRAIN_LLM_KEY: KEY, BRAIN_LLM_MODEL: 'mock-1' });
    const x = result(o);
    assert.equal(x.r.status, 200);
    assert.equal(x.r.json.llm.provider, 'env');
    assert.equal(x.r.json.llm.ok, true);
    assert.equal(x.r.json.llm.model, 'mock-1');
    assert.equal(x.r.json.from, 'llm');
    assert.match(x.r.json.text, /^The sea is wide and grey\./);
    assert.equal(x.r.json.model.configured, true);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].url, '/v1/chat/completions');
    assert.equal(seen[0].auth, 'Bearer ' + KEY, 'the key reached the model origin, in its one header');
    const all = JSON.stringify(x.r) + fs.readFileSync(path.join(dir, 'requests.jsonl'), 'utf8');
    assert.ok(!all.includes(KEY), 'the key value is in the response or the log');
    assert.ok(!all.includes('BRAIN_LLM_KEY='));
    assert.ok(!all.includes('127.0.0.1:' + mock.address().port), 'the base value is in the response or the log');
    assert.equal(x.guard, true);
    assert.equal(x.egress, 'EGRESS_REFUSED', 'http://example.com from the handler process');
    assert.equal(x.other, 'EGRESS_REFUSED', 'another loopback port from the handler process');
    assert.equal(x.mine, 'own server', 'fetch to a server listening in this same process (the platform bridge case)');
    assert.equal(x.mineHttp, 'own server', 'http.request to a server listening in this same process');
  } finally { mock.close(); }
});

test('against a dead port the footer prints fellBack env with the reason; with no names the guard still refuses example.com', async () => {
  const dead = http.createServer();
  await new Promise((r) => dead.listen(0, '127.0.0.1', r));
  const port = dead.address().port;
  await new Promise((r) => dead.close(r));
  const o = await child(script(path.join(TMP, 'dead')), { BRAIN_LLM_BASE: 'http://127.0.0.1:' + port + '/v1', BRAIN_LLM_KEY: KEY });
  const x = result(o);
  assert.equal(x.r.status, 200);
  assert.equal(x.r.json.llm.fellBack, 'env');
  assert.equal(x.r.json.llm.ok, false);
  assert.match(x.r.json.llm.reason, /BRAIN_LLM_BASE/);
  assert.ok(x.r.json.route, 'the route is printed');
  assert.ok(!JSON.stringify(x.r).includes(KEY));
  assert.equal(x.egress, 'EGRESS_REFUSED');
  // only one of the two names: the null provider, and the footer says the cell is not configured
  const o2 = await child(script(path.join(TMP, 'none')), { BRAIN_LLM_BASE: 'http://127.0.0.1:' + port + '/v1' });
  const y = result(o2);
  assert.equal(y.r.json.llm.provider, 'null');
  assert.equal(y.r.json.llm.reason, NOT_CONFIGURED);
  assert.equal(y.egress, 'EGRESS_REFUSED');
});

test('api/ask.mjs and bin/ask-serve.mjs are thin shells: same origin only, no key in their source', () => {
  const api = fs.readFileSync(path.join(ROOT, 'api', 'ask.mjs'), 'utf8');
  assert.match(api, /export default async function/);
  assert.doesNotMatch(api, /['"]access-control-allow-origin['"]/i, 'the shell never writes the header');
  // a key shape, not a substring: the module name ask-http carries the letters s, k and a hyphen
  assert.doesNotMatch(api, /(^|[^a-z])sk[-_]|Bearer /i);
  const serve = fs.readFileSync(path.join(ROOT, 'bin', 'ask-serve.mjs'), 'utf8');
  assert.match(serve, /'127\.0\.0\.1'/);
  assert.doesNotMatch(serve, /listen\([^)]*0\.0\.0\.0/);
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.ok(vercel.functions && vercel.functions['api/ask.mjs'], 'vercel.json names the function');
  assert.match(vercel.functions['api/ask.mjs'].includeFiles, /world\/policy\.json/);
});

test('the Vercel shell answers through a planted req and res', async () => {
  const { default: fn } = await import('../api/ask.mjs');
  const res = { statusCode: 0, headers: {}, body: null, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b === undefined ? null : b; } };
  await fn({ method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.9' }, body: { prompt: 'what is 17 times 23' }, socket: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).exact.answer, '391');
  assert.equal(res.headers['access-control-allow-origin'], undefined);
  const r2 = { ...res, statusCode: 0, headers: {}, body: null };
  await fn({ method: 'OPTIONS', headers: {}, socket: {} }, r2);
  assert.equal(r2.statusCode, 204);
  assert.equal(r2.body, null);
  const bad = { ...res, statusCode: 0, headers: {}, body: null };
  await fn({ method: 'POST', headers: { 'content-type': 'application/json' }, get body() { throw new Error('Invalid JSON'); }, socket: {} }, bad);
  assert.equal(bad.statusCode, 400);
});

test('the model cell is configured by NAME: our key when set, else the platform OIDC token beside our base url, never a value read here', () => {
  assert.equal(modelConfigured({}), false);
  assert.equal(modelConfigured({ BRAIN_LLM_BASE: 'b' }), false, 'a base url with no key is not configured');
  assert.equal(modelConfigured({ BRAIN_LLM_BASE: 'b', BRAIN_LLM_KEY: 'k' }), true);
  assert.equal(keyNameFor({ BRAIN_LLM_BASE: 'b', BRAIN_LLM_KEY: 'k', [OIDC_NAME]: 't' }), 'BRAIN_LLM_KEY', 'our key wins when both exist');
  assert.equal(modelConfigured({ BRAIN_LLM_BASE: 'b', [OIDC_NAME]: 't' }), true, 'the platform token beside our base url configures the cell');
  assert.equal(keyNameFor({ BRAIN_LLM_BASE: 'b', [OIDC_NAME]: 't' }), OIDC_NAME);
  assert.equal(modelConfigured({ [OIDC_NAME]: 't' }), false, 'the token alone, with no base url, configures nothing');
  assert.equal(keyNameFor({}), 'BRAIN_LLM_KEY');
});

// ---------------------------------------------------------------- the growing reply and the miss log (board 37, item misses)
// His NEXT-WEEK.md step 8: "The site's miss reply changes from a refusal to \"I am growing a cell for this\", and the
// miss is logged for step 1." A stub on 127.0.0.1 stands in for Supabase and COUNTS what reaches it, so "nothing was
// logged" is a count and not a belief.
async function missStub(status = 201) {
  const seen = [];
  const srv = http.createServer((req, res) => {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => {
      let body = null;
      try { body = JSON.parse(b); } catch { body = b; }
      seen.push({ method: req.method, url: req.url, apikey: req.headers.apikey, auth: req.headers.authorization, prefer: req.headers.prefer, type: req.headers['content-type'], body });
      res.writeHead(srv.status); res.end();
    });
  });
  srv.status = status;
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  return { srv, seen, url: 'http://127.0.0.1:' + srv.address().port };
}

test('a memory miss answers "I am growing a cell for this" first and POSTs one row to the miss log with the anon key; an exact answer is untouched', async () => {
  const { GROWING_HEAD } = await import('../act/ask-http.mjs');
  const stub = await missStub(201);
  try {
    const h = createHandler({ stateDir: path.join(TMP, 'grow-a'), grown: false }); // the organism without its grown cells: grown/ holds a mash cell from generation 1 on
    const env = { SUPABASE_URL: stub.url, SUPABASE_ANON_KEY: 'x' };
    // (a) the keyboard mash: 200, the growing head on the first line, logged, one POST with apikey x
    const r = await h(post('jgkafsjka', { env }));
    assert.equal(r.status, 200);
    assert.equal(r.json.from, 'memory');
    assert.ok(r.json.text.startsWith('I am growing a cell for this'), r.json.text.split('\n')[0]);
    assert.equal(r.json.text.split('\n')[0], GROWING_HEAD);
    assert.equal(r.json.growing.logged, true, r.json.growing.reason);
    assert.match(r.json.growing.reason, /201/);
    assert.equal(stub.seen.length, 1);
    const s = stub.seen[0];
    assert.equal(s.method, 'POST');
    assert.equal(s.url, '/rest/v1/misses');
    assert.equal(s.apikey, 'x');
    assert.equal(s.auth, 'Bearer x');
    assert.equal(s.prefer, 'return=minimal');
    assert.match(s.type, /application\/json/);
    assert.equal(s.body.prompt, 'jgkafsjka');
    assert.equal(s.body.reply, GROWING_HEAD, 'the reply logged is the first line a person read');
    assert.deepEqual(Object.keys(s.body).sort(), ['prompt', 'reply', 'route']);
    assert.equal(s.body.route.from, 'memory');
    assert.equal(s.body.route.host, 'local');
    // the rest of the old text follows the head: the fall through lines are still there
    assert.match(r.json.text.split('\n').slice(1).join('\n'), /nothing in memory matches/);
    // a prompt carrying a credential shape leaves scrubbed
    const tok = 'ghp_' + 'A'.repeat(30);
    const r2 = await h(post('qzxv ' + tok, { env }));
    assert.equal(r2.json.growing.logged, true);
    assert.equal(stub.seen.length, 2);
    assert.ok(!JSON.stringify(stub.seen[1].body).includes(tok), 'the token shape reached the miss log');
    // (c) an exact answer: 391, no growing field, nothing POSTed
    const x = await h(post('what is 17 times 23', { env }));
    assert.equal(x.json.exact.answer, '391');
    assert.equal('growing' in x.json, false);
    assert.doesNotMatch(x.json.text, /growing a cell/);
    // a conversational turn is not a miss either
    const hi = await h(post('hi', { env }));
    assert.equal(hi.json.from, 'native');
    assert.equal('growing' in hi.json, false);
    assert.equal(stub.seen.length, 2, 'only the two misses reached the log');
    // the control that can fail: the log refusing the row is logged false, and the second line says it was not logged
    stub.srv.status = 401;
    const bad = await h(post('jgkafsjka', { env }));
    assert.equal(bad.json.growing.logged, false);
    assert.match(bad.json.growing.reason, /answered 401/);
    assert.equal(bad.json.text.split('\n')[0], GROWING_HEAD);
    assert.equal(bad.json.text.split('\n')[1], '(' + bad.json.growing.reason + ')');
    assert.equal(stub.seen.length, 3);
  } finally { stub.srv.close(); }
});

test('without the SUPABASE names the miss still answers the growing head, logged false with the reason naming SUPABASE_URL, and no request leaves', async () => {
  const stub = await missStub(201);
  try {
    const h = createHandler({ stateDir: path.join(TMP, 'grow-b'), grown: false });
    const r = await h(post('jgkafsjka'));
    assert.equal(r.status, 200);
    assert.ok(r.json.text.startsWith('I am growing a cell for this'));
    assert.equal(r.json.growing.logged, false);
    assert.match(r.json.growing.reason, /SUPABASE_URL/);
    assert.match(r.json.text.split('\n')[1], /^\(not logged: .*SUPABASE_URL/);
    // one of the two names is not enough
    const one = await h(post('jgkafsjka', { env: { SUPABASE_URL: stub.url } }));
    assert.equal(one.json.growing.logged, false);
    assert.match(one.json.growing.reason, /SUPABASE_ANON_KEY/);
    assert.equal(stub.seen.length, 0, 'nothing reached the log without both names');
  } finally { stub.srv.close(); }
});

test('logMiss never throws: a deadline, an unreachable log and a refusal each come back as a reason with no value in it', async () => {
  const { logMiss, isMemoryMiss, missOrigin, MISS_MS } = await import('../act/ask-http.mjs');
  assert.equal(MISS_MS, 1500);
  const env = { SUPABASE_URL: 'https://example.supabase.co/', SUPABASE_ANON_KEY: 'sb_publishable_planted' };
  const row = { prompt: 'h', reply: 'I am growing a cell for this.', route: { from: 'memory' } };
  let got = null;
  const ok = await logMiss(env, row, { fetch: async (url, init) => { got = { url, init }; return new Response(null, { status: 201 }); } });
  assert.deepEqual([ok.logged, ok.status], [true, 201]);
  assert.equal(got.url, 'https://example.supabase.co/rest/v1/misses');
  assert.equal(got.init.method, 'POST');
  assert.equal(got.init.headers.apikey, 'sb_publishable_planted');
  assert.deepEqual(JSON.parse(got.init.body), row);
  const hang = (url, init) => new Promise((resolve, reject) => { init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))); });
  const slow = await logMiss(env, row, { fetch: hang, timeoutMs: 40 });
  assert.equal(slow.logged, false);
  assert.match(slow.reason, /did not answer in 40 ms/);
  const down = await logMiss(env, row, { fetch: async () => { throw Object.assign(new TypeError('egress refused: sb_publishable_planted'), { code: 'EGRESS_REFUSED' }); } });
  assert.equal(down.logged, false);
  assert.match(down.reason, /EGRESS_REFUSED/);
  for (const r of [ok, slow, down]) assert.ok(!r.reason.includes('sb_publishable_planted'), 'the key value is in a reason');
  const refused = await logMiss(env, row, { fetch: async () => new Response('{"message":"no"}', { status: 403 }) });
  assert.deepEqual([refused.logged, refused.status], [false, 403]);
  assert.equal((await logMiss({ SUPABASE_URL: 'not a url', SUPABASE_ANON_KEY: 'k' }, row, { fetch: () => { throw new Error('must not be called'); } })).logged, false);
  assert.equal(missOrigin(env), 'https://example.supabase.co');
  assert.equal(missOrigin({ SUPABASE_URL: 'https://example.supabase.co' }), null, 'no anon key, no allowlist entry');
  // what is a miss: memory, no hit, no cite; a grown cell (from cell), a hit or a cite is not
  assert.equal(isMemoryMiss({ from: 'memory', provenance: { memoryHits: 0 }, cites: [] }), true);
  assert.equal(isMemoryMiss({ from: 'cell', provenance: { memoryHits: 0 }, cites: [] }), false);
  assert.equal(isMemoryMiss({ from: 'memory', provenance: { memoryHits: 2 }, cites: [] }), false);
  assert.equal(isMemoryMiss({ from: 'memory', provenance: { memoryHits: 0 }, cites: [{ title: 't' }] }), false);
});

test('the guard allowlist gains the miss log origin and nothing else, in a child with its own cold start', async () => {
  const stub = await missStub(201);
  const other = await missStub(201);
  try {
    const code = [
      'const m = await import(' + JSON.stringify(HANDLER) + ');',
      'const h = m.createHandler({ stateDir: ' + JSON.stringify(path.join(TMP, 'grow-guard')) + ', grown: false, root: ' + JSON.stringify(FIX) + ' });',
      "const r = await h({ method: 'POST', body: JSON.stringify({ prompt: 'jgkafsjka' }), ip: 'c' });",
      'let egress = null;',
      "try { await fetch('http://example.com/'); egress = 'reached'; } catch (e) { egress = e.code || String(e); }",
      'let otherPort = null;',
      'try { await fetch(' + JSON.stringify(other.url + '/rest/v1/misses') + ", { method: 'POST', body: '{}' }); otherPort = 'reached'; } catch (e) { otherPort = e.code || String(e); }",
      "console.log('RESULT ' + JSON.stringify({ growing: r.json.growing, first: r.json.text.split(String.fromCharCode(10))[0], egress, otherPort, guard: !!globalThis.__brainEgressGuard }));",
      'process.exit(0);',
    ].join('\n');
    const x = result(await child(code, { SUPABASE_URL: stub.url, SUPABASE_ANON_KEY: 'x' }));
    assert.equal(x.guard, true);
    assert.equal(x.growing.logged, true, x.growing.reason);
    assert.match(x.first, /^I am growing a cell for this/);
    assert.equal(stub.seen.length, 1, 'the row reached the log through the guard');
    assert.equal(stub.seen[0].body.prompt, 'jgkafsjka');
    assert.equal(x.egress, 'EGRESS_REFUSED', 'example.com is still refused');
    assert.equal(x.otherPort, 'EGRESS_REFUSED', 'another loopback port is still refused: the allowlist gained one origin');
    assert.equal(other.seen.length, 0);
  } finally { stub.srv.close(); other.srv.close(); }
});

test('a grown cell planted over grown/index.mjs answers through the handler: from cell, no growing field, nothing logged', async () => {
  const stub = await missStub(201);
  const dir = fs.mkdtempSync(path.join(TMP, 'planted-'));
  const planted = path.join(dir, 'index.mjs');
  fs.writeFileSync(planted, [
    'export const GROWN = Object.freeze([]);',
    "export function grownAnswer(q) { return String(q).trim() === 'jgkafsjka' ? { id: 'mash-planted', class: 'mash', generation: 1, answer: 'That reads as a keyboard mash.' } : null; }",
  ].join('\n'));
  try {
    const code = [
      "const { registerHooks } = await import('node:module');",
      'const PLANTED = ' + JSON.stringify(pathToFileURL(planted).href) + ';',
      "registerHooks({ resolve(spec, ctx, next) { if (spec === '../grown/index.mjs' && String(ctx.parentURL).endsWith('/act/prompt.mjs')) return { url: PLANTED, shortCircuit: true }; return next(spec, ctx); } });",
      'const m = await import(' + JSON.stringify(HANDLER) + ');',
      'const h = m.createHandler({ stateDir: ' + JSON.stringify(path.join(TMP, 'grow-planted')) + ', nativeRoot: ' + JSON.stringify(NO_NATIVE) + ' });',
      "const r = await h({ method: 'POST', body: JSON.stringify({ prompt: 'jgkafsjka' }), ip: 'c' });",
      "const miss = await h({ method: 'POST', body: JSON.stringify({ prompt: 'qzxvbnmw' }), ip: 'c' });",
      "console.log('RESULT ' + JSON.stringify({ r: r.json, miss: { from: miss.json.from, growing: miss.json.growing } }));",
      'process.exit(0);',
    ].join('\n');
    const x = result(await child(code, { SUPABASE_URL: stub.url, SUPABASE_ANON_KEY: 'x' }));
    assert.equal(x.r.from, 'cell');
    assert.equal(x.r.route, 'direct');
    assert.equal(x.r.provenance.answer, 'native');
    assert.equal(x.r.provenance.method, 'mash-planted');
    assert.equal(x.r.native.kind, 'cell:mash-planted');
    assert.equal(x.r.native.answer, 'That reads as a keyboard mash.');
    // the provenance line is json.head; the text is the cell's answer alone (2026-10-02)
    assert.match(x.r.head, /^answered natively by a grown cell \(mash-planted, generation 1\)/);
    assert.equal(x.r.text, 'That reads as a keyboard mash.');
    assert.equal('growing' in x.r, false, 'a grown answer is not a miss');
    // the matched control in the same child: a prompt the planted cell does not carry is still a logged miss
    assert.equal(x.miss.from, 'memory');
    assert.equal(x.miss.growing.logged, true, x.miss.growing.reason);
    assert.equal(stub.seen.length, 1);
    assert.equal(stub.seen[0].body.prompt, 'qzxvbnmw');
  } finally { stub.srv.close(); }
});

test('Day 2, the builder arm: a build request naming a served app is answered with its URL on the first line, from app, never the growing head; an app not served still grows; the URL is the request host', async () => {
  const apps = [{ slug: 'todo', name: 'todo', generation: 2, path: '/apps/todo/' }];
  const appAnswer = (p) => { const r = buildRequest(p); const a = r && apps.find((x) => x.slug === r.slug); return a ? { ...a } : null; };
  const h = createHandler({ stateDir: path.join(TMP, 'app'), grown: false, appAnswer });
  const r = await h(post('make me a todo app', { headers: { host: 'dilation.dev', 'x-forwarded-proto': 'https' } }));
  assert.equal(r.status, 200);
  assert.equal(r.json.from, 'app');
  assert.equal(r.json.route, 'app');
  assert.deepEqual(r.json.app, { slug: 'todo', name: 'todo', generation: 2, path: '/apps/todo/', url: 'https://dilation.dev/apps/todo/' });
  assert.ok(r.json.text.split('\n')[0].includes('https://dilation.dev/apps/todo/'), r.json.text);
  assert.equal(r.json.growing, undefined, 'no growing reply for a served app');
  for (const k of FOOTER) assert.ok(k in r.json, 'footer field ' + k);
  const p = await h(post('build a todo app'));
  assert.equal(p.json.app.url, '/apps/todo/', 'no host header: the path alone');
  const n = await h(post('make me a weather app'));
  assert.notEqual(n.json.from, 'app');
  assert.equal(n.json.app, undefined);
  const none = createHandler({ stateDir: path.join(TMP, 'app-none'), grown: false });
  const z = await none(post('make me a todo app'));
  assert.notEqual(z.json.from, 'app', 'without grown cells the real list is not consulted');
  assert.equal(appUrl({ host: 'localhost:3000' }, '/apps/x/'), 'http://localhost:3000/apps/x/');
  assert.equal(appUrl({ 'x-forwarded-host': 'a.example, b.example', 'x-forwarded-proto': 'https' }, '/apps/x/'), 'https://a.example/apps/x/');
  assert.equal(appUrl({}, '/apps/x/'), '/apps/x/');
});

// ---------------------------------------------------------------- REACH (grow/NEO.md, Order 7, REACH; act/reach.mjs)
// His words: "It literally should have an octopus hold over the internet and pull up anything". A memory miss is pulled
// up from the open internet, the reply says where from, and the miss is still logged. Offline: the network reach sees
// is a planted fetch handed through createHandler's reachOpts, and it counts every call.
const reachJson = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
function reachNet(route) {
  const calls = [];
  const f = async (url, init) => { calls.push({ url: String(url), init }); const r = await route(String(url), init); return r === 'hang' ? new Promise(() => {}) : r; };
  f.calls = calls;
  return f;
}
const ZQ = 'who was zorbulan quexby'; // a lookup the organism holds nothing for (a memory miss with grown cells off)
const ZQ_EXTRACT = 'Zorbulan Quexby was a <b>planted</b> person &amp; a test fixture with the key ghp_' + 'C'.repeat(30) + '. He never lived.';
const zqRoute = (url) => {
  if (url.startsWith('https://en.wikipedia.org/w/rest.php/v1/search/page?')) return reachJson(200, { pages: [{ id: 7, key: 'Zorbulan_Quexby', title: 'Zorbulan Quexby', excerpt: '<span class="searchmatch">Zorbulan</span> Quexby', description: 'a planted page' }] });
  if (url === 'https://en.wikipedia.org/api/rest_v1/page/summary/Zorbulan_Quexby') return reachJson(200, { type: 'standard', title: 'Zorbulan Quexby', extract: ZQ_EXTRACT });
  return reachJson(404, {});
};
// the clocks of a reply are not its content: serverUs, and llm.ms (Date.now() - started in act/llm.mjs, 0 or 1 by where
// a millisecond tick falls: 1 in 1 of 300 asks measured by the hardener, which made a deepEqual below flake)
const strip = (j) => { const { serverUs, ...rest } = j; return rest.llm ? { ...rest, llm: { ...rest.llm, ms: null } } : rest; };

test('REACH hit: the reached text is the first line, its Source line next, then the growing head; from reach, json.reach { title, url, ms }; HTML and the token scrubbed; the miss STILL logged exactly as before', async () => {
  const { GROWING_HEAD } = await import('../act/ask-http.mjs');
  const stub = await missStub(201);
  try {
    const f = reachNet(zqRoute);
    const h = createHandler({ stateDir: path.join(TMP, 'reach-hit'), grown: false, reachOpts: { fetch: f } });
    const env = { SUPABASE_URL: stub.url, SUPABASE_ANON_KEY: 'x' };
    const r = await h(post(ZQ, { env }));
    assert.equal(r.status, 200);
    const lines = r.json.text.split('\n');
    assert.equal(lines[0], 'Zorbulan Quexby was a planted person & a test fixture with the key [redacted]. He never lived.');
    assert.equal(lines[1], 'Source: Zorbulan Quexby, https://en.wikipedia.org/wiki/Zorbulan_Quexby');
    assert.equal(lines[2], GROWING_HEAD, 'the growing line follows the text');
    assert.equal(lines.length, 3);
    assert.ok(!r.json.text.includes('<') && !r.json.text.includes('ghp_'), 'HTML or the token reached the reply');
    assert.equal(r.json.from, 'reach');
    assert.deepEqual(Object.keys(r.json.reach), ['title', 'url', 'ms']);
    assert.equal(r.json.reach.title, 'Zorbulan Quexby');
    assert.equal(r.json.reach.url, 'https://en.wikipedia.org/wiki/Zorbulan_Quexby');
    assert.ok(Number.isInteger(r.json.reach.ms) && r.json.reach.ms >= 0, 'ms ' + r.json.reach.ms);
    for (const k of FOOTER) assert.ok(k in r.json, 'footer field ' + k);
    assert.equal(f.calls.length, 2);
    for (const c of f.calls) assert.equal(c.init.redirect, 'manual');
    // the miss is still logged, exactly as before: the same row a BRAIN_REACH=0 run logs
    assert.equal(r.json.growing.logged, true, r.json.growing.reason);
    assert.equal(stub.seen.length, 1);
    const off = await h(post(ZQ, { env: { ...env, BRAIN_REACH: '0' } }));
    assert.equal(stub.seen.length, 2);
    assert.deepEqual(stub.seen[0].body, stub.seen[1].body, 'the logged row is the row without reach');
    assert.deepEqual(Object.keys(stub.seen[0].body).sort(), ['prompt', 'reply', 'route']);
    assert.equal(stub.seen[0].body.reply, GROWING_HEAD);
    assert.equal(stub.seen[0].body.route.from, 'memory');
    assert.equal(off.json.from, 'memory');
    assert.equal(f.calls.length, 2, 'BRAIN_REACH=0 made no call');
    // the log refusing the row: the hit stays first, the head next, the reason after it
    stub.srv.status = 401;
    const bad = await h(post(ZQ, { env }));
    assert.equal(bad.json.from, 'reach');
    assert.equal(bad.json.growing.logged, false);
    assert.deepEqual(bad.json.text.split('\n').slice(2), [GROWING_HEAD, '(' + bad.json.growing.reason + ')']);
  } finally { stub.srv.close(); }
});

test('REACH miss, timeout, refused host and BRAIN_REACH=0: the reply is exactly the reply without reach, and BRAIN_REACH=0 calls nothing', { timeout: 30_000 }, async () => {
  const cases = {
    empty: reachNet(() => reachJson(200, { pages: [] })),
    offTopic: reachNet(() => reachJson(200, { pages: [{ key: 'Zorba_the_Greek', title: 'Zorba the Greek', excerpt: 'a novel' }] })),
    timeout: reachNet(() => 'hang'),
    redirect: reachNet(() => new Response(null, { status: 302, headers: { location: 'https://evil.example/' } })),
    down: reachNet(() => { throw Object.assign(new TypeError('fetch failed'), { code: 'EGRESS_REFUSED' }); }),
  };
  const zero = reachNet(zqRoute);
  const base = createHandler({ stateDir: path.join(TMP, 'reach-off'), grown: false, reachOpts: { fetch: zero } });
  const want = strip((await base(post(ZQ, { env: { BRAIN_REACH: '0' } }))).json);
  assert.equal(zero.calls.length, 0, 'BRAIN_REACH=0: no call');
  assert.equal(want.from, 'memory');
  assert.ok(want.text.startsWith('I am growing a cell for this'));
  for (const [name, f] of Object.entries(cases)) {
    const h = createHandler({ stateDir: path.join(TMP, 'reach-' + name), grown: false, reachOpts: { fetch: f, timeoutMs: 40 } });
    const got = strip((await h(post(ZQ))).json);
    assert.deepEqual(got, want, name + ': the reply is not the reply without reach');
    assert.equal('reach' in got, false, name);
    assert.ok(f.calls.length >= 1, name + ': reach was asked');
  }
  assert.equal(cases.redirect.calls.length, 1, 'the redirect was not followed');
  // reach turned off by the handler option too
  const none = reachNet(zqRoute);
  const h0 = createHandler({ stateDir: path.join(TMP, 'reach-false'), grown: false, reach: false, reachOpts: { fetch: none } });
  assert.deepEqual(strip((await h0(post(ZQ))).json), want);
  assert.equal(none.calls.length, 0);
});

test('REACH is not asked for an answer that is not a memory miss, and none of the miss prompts of this file is reached for (no socket opens in this suite)', async () => {
  const { reachable } = await import('../act/reach.mjs');
  // (with 'what is seven times eight': arithmetic in words is a memory miss of the organism, and before the hardener's
  // fix it reached the network from this handler)
  const prompts = ['jgkafsjka', 'qzxv ghp_' + 'A'.repeat(30), 'qzxvbnmw', 'x'.repeat(LIMITS.promptChars), 'write a poem about the sea', 'make me a weather app', 'build a todo app', 'make me a todo app', 'hi', 'what is seven times eight', 'seven times eight'];
  for (const p of prompts) assert.equal(reachable(p).ok, false, p.slice(0, 40));
  const f = reachNet(zqRoute);
  const h = createHandler({ stateDir: path.join(TMP, 'reach-none'), grown: false, reachOpts: { fetch: f } });
  for (const p of [...prompts, 'what is 17 times 23']) assert.equal((await h(post(p, { ip: 'reach-none' }))).status, 200);
  assert.equal(f.calls.length, 0, 'a prompt of this file reached the network');
  const x = await h(post('what is 17 times 23', { ip: 'reach-none-2' }));
  assert.equal(x.json.exact.answer, '391');
  assert.equal('reach' in x.json, false);
});

test('REACH: the guard allowlist gains the two reach origins when reach is on and not with BRAIN_REACH=0, in children with their own cold start', async () => {
  const SERVE = pathToFileURL(path.join(ROOT, 'bin', 'serve.mjs')).href;
  const code = (dir) => [
    'const m = await import(' + JSON.stringify(HANDLER) + ');',
    'const s = await import(' + JSON.stringify(SERVE) + ');',
    'const h = m.createHandler({ stateDir: ' + JSON.stringify(dir) + ', grown: false, root: ' + JSON.stringify(FIX) + ' });',
    "const g = await h({ method: 'GET' });",
    'const allow = globalThis.__brainEgressGuard.allow;',
    "const check = (u) => s.checkEgress(allow, u).ok;",
    'let egress = null;',
    "try { await fetch('http://example.com/'); egress = 'reached'; } catch (e) { egress = e.code || String(e); }",
    "console.log('RESULT ' + JSON.stringify({ status: g.status, entries: allow.entries.map((e) => e.host + ':' + e.port), wiki: check('https://en.wikipedia.org/w/rest.php/v1/search/page?q=x'), dict: check('https://api.dictionaryapi.dev/api/v2/entries/en/x'), dewiki: check('https://de.wikipedia.org/'), plain: check('http://en.wikipedia.org/'), egress }));",
    'process.exit(0);',
  ].join('\n');
  const on = result(await child(code(path.join(TMP, 'reach-guard-on')), {}));
  const off = result(await child(code(path.join(TMP, 'reach-guard-off')), { BRAIN_REACH: '0' }));
  assert.equal(on.status, 200);
  assert.deepEqual([on.wiki, on.dict, on.dewiki, on.plain], [true, true, false, false]);
  assert.deepEqual([off.wiki, off.dict], [false, false]);
  assert.deepEqual(on.entries.filter((e) => !off.entries.includes(e)).sort(), ['api.dictionaryapi.dev:443', 'en.wikipedia.org:443'], 'reach gained the two origins and nothing else');
  assert.deepEqual(off.entries.filter((e) => !on.entries.includes(e)), []);
  assert.equal(on.egress, 'EGRESS_REFUSED', 'example.com is still refused with reach on');
});

// ---------------------------------------------------------------- the native answer, the thread and the requests (contracts c11, c10)
function knowRoot(name, { neo = true } = {}) {
  const root = fs.mkdtempSync(path.join(TMP, name + '-'));
  fs.mkdirSync(path.join(root, 'grown'));
  fs.writeFileSync(path.join(root, 'grown', 'index.mjs'), 'export const GROWN = Object.freeze([]);\nexport function grownAnswer() { return null; }\n');
  if (!neo) return root;
  const know = path.join(root, 'neo', 'know');
  fs.mkdirSync(know, { recursive: true });
  const packs = {
    'samayo-capital': { columns: ['country', 'capital'], rows: [['France', 'Paris'], ['Germany', 'Berlin'], ['Peru', 'Lima'], ['Tajikistan', 'Dushanbe']] },
    'samayo-continent': { columns: ['country', 'continent'], rows: [['France', 'Europe'], ['Germany', 'Europe'], ['Peru', 'South America']] },
  };
  for (const [id, p] of Object.entries(packs)) fs.writeFileSync(path.join(know, id + '.json'), JSON.stringify({ id, from: 'fixture', sha: 's-' + id, columns: p.columns, rows: p.rows, at: 'x' }));
  fs.writeFileSync(path.join(know, 'INDEX.json'), JSON.stringify({ packs: Object.entries(packs).map(([id, p]) => ({ id, columns: p.columns, rows: p.rows.length, sha: 's-' + id })) }));
  return root;
}

test('a native answer through the handler: route native, native.via, no head, no growing; a thread and a last carry a follow-up', async () => {
  const root = knowRoot('native');
  const h = createHandlerAt({ stateDir: path.join(TMP, 'native'), grown: false, root, reach: false });
  const r = await h(post('which country has the capital Paris'));
  assert.equal(r.status, 200);
  assert.deepEqual([r.json.from, r.json.route, r.json.text], ['native', 'native', 'France is the country whose capital is Paris.']);
  assert.deepEqual(r.json.native.via, { pack: 'samayo-capital', key: 'Paris', column: 'country', keyColumn: 'capital', op: 'lookup', packs: ['samayo-capital'] });
  assert.equal('head' in r.json, false);
  assert.equal('growing' in r.json, false, 'a native answer is not a miss');
  for (const k of FOOTER) assert.ok(k in r.json, 'footer field ' + k);
  const first = await h(post('what continent is Peru in'));
  const viaThread = await h({ method: 'POST', body: JSON.stringify({ prompt: 'and germany?', thread: ['what continent is Peru in'] }), ip: 't', env: {} });
  assert.equal(viaThread.json.text, 'The continent of Germany is Europe.');
  const viaLast = await h({ method: 'POST', body: JSON.stringify({ prompt: 'and germany?', last: first.json.native.via }), ip: 't', env: {} });
  assert.equal(viaLast.json.text, 'The continent of Germany is Europe.');
  const alone = await h({ method: 'POST', body: JSON.stringify({ prompt: 'and germany?' }), ip: 't', env: {} });
  assert.notEqual(alone.json.route, 'native', 'no thread: no follow-up');
  const off = createHandlerAt({ stateDir: path.join(TMP, 'native-off'), grown: false, root, native: false, reach: false });
  assert.notEqual((await off(post('which country has the capital Paris'))).json.route, 'native', 'o.native false');
});

test('threadOf and lastOf: the last THREAD.prompts strings, each capped; a last of three short strings or null', () => {
  assert.equal(threadOf(null), null);
  assert.equal(threadOf('a'), null);
  assert.equal(threadOf([1, '', '  ', {}]), null);
  assert.deepEqual(threadOf(['a', 'b', 'c', 'd', 'e', 'x'.repeat(LIMITS.promptChars + 1)]), ['b', 'c', 'd', 'e'].slice(-THREAD.prompts));
  assert.deepEqual(lastOf({ pack: 'p', column: 'c', keyColumn: 'k', extra: 1 }), { pack: 'p', column: 'c', keyColumn: 'k' });
  assert.equal(lastOf({ pack: 'p', column: 'c' }), null);
  assert.equal(lastOf({ pack: 'x'.repeat(THREAD.field + 1), column: 'c', keyColumn: 'k' }), null);
  assert.equal(lastOf(['p', 'c', 'k']), null);
});

test('a memory miss is appended to neo/requests.jsonl only where a root is writable: o.requestsRoot, the named variable, a runner; never otherwise', async () => {
  const runner = knowRoot('requests');
  const h = createHandlerAt({ stateDir: path.join(TMP, 'req'), grown: false, root: FIX, reach: false, requestsRoot: runner });
  const r = await h(post('qzxvbnmw ' + KEY.slice(0, 4)));
  assert.equal(r.json.growing.requested, true);
  const rows = fs.readFileSync(path.join(runner, 'neo', 'requests.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]), ['at', 'q', 'from']);
  assert.equal(rows[0].q, 'qzxvbnmw ' + KEY.slice(0, 4));
  assert.equal(rows[0].from, 'ask-http:local');
  // an answer is not a miss: nothing appended
  await h(post('what is 17 times 23'));
  assert.equal(fs.readFileSync(path.join(runner, 'neo', 'requests.jsonl'), 'utf8').split('\n').filter(Boolean).length, 1);
  // no root named (the PC, Vercel): no growing.requested field and no file anywhere
  const none = createHandlerAt({ stateDir: path.join(TMP, 'req-none'), grown: false, root: FIX, reach: false });
  const n = await none(post('qzxvbnmw'));
  assert.equal('requested' in n.json.growing, false);
  // the names: o.requestsRoot, BRAIN_REQUESTS_ROOT, GITHUB_ACTIONS on this checkout; a root without neo/ is not writable
  assert.equal(requestsRootFor({ requestsRoot: runner }, {}), path.resolve(runner));
  assert.equal(requestsRootFor({}, { [REQUESTS_ROOT_NAME]: runner }), path.resolve(runner));
  assert.equal(requestsRootFor({}, {}), null);
  assert.equal(requestsRootFor({ requestsRoot: knowRoot('bare', { neo: false }) }, {}), null);
  assert.equal(requestsRootFor({ requestsRoot: false }, { [REQUESTS_ROOT_NAME]: runner }), null);
  assert.equal(requestsRootFor({}, { GITHUB_ACTIONS: 'true' }) === null || requestsRootFor({}, { GITHUB_ACTIONS: 'true' }) === ROOT, true);
  assert.deepEqual(appendRequest(null, 'q'), { appended: false, reason: 'no writable root is named' });
  assert.equal(appendRequest(path.join(TMP, 'nowhere'), 'q').appended, false);
});

test('the cold start never loads the grown cells; a prompt the shelf reads never loads them; the first prompt that reaches them does, once', async () => {
  const root = knowRoot('cold');
  // an index that counts its own imports (generation 6's real one is 113 modules, 32 MB)
  fs.writeFileSync(path.join(root, 'grown', 'index.mjs'), 'globalThis.__coldGrownImports = (globalThis.__coldGrownImports || 0) + 1;\nexport const GROWN = Object.freeze([]);\nexport function grownAnswer() { return null; }\n');
  const h = createHandlerAt({ stateDir: path.join(TMP, 'cold'), root, reach: false });
  const a = await h(post('which country has the capital Paris'));
  assert.equal(a.json.route, 'native');
  assert.equal(globalThis.__coldGrownImports, undefined, 'the warm asks and a shelf prompt leave the cells unloaded');
  const b = await h(post('write a limerick about a qzxv'));
  assert.notEqual(b.json.route, 'native');
  assert.equal(globalThis.__coldGrownImports, 1);
  await h(post('write a limerick about a qzxw'));
  assert.equal(globalThis.__coldGrownImports, 1, 'once per instance');
});

// one level of braces, ** across directories, * inside one: the includeFiles glob as Vercel reads it
const globRe = (g) => {
  const m = /^\{(.*)\}$/.exec(g);
  const alts = m ? m[1].split(',') : [g];
  const one = (a) => a.split('**').map((p) => p.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*');
  return new RegExp('^(?:' + alts.map(one).join('|') + ')$');
};

test('the bundle: INCLUDE_FILES carries the packs, the colonies and what it carried before, never a task; GET counts what a root serves', async () => {
  const { INCLUDE_FILES } = await import('../api/ask.mjs');
  const re = globRe(INCLUDE_FILES);
  for (const f of ['neo/know/INDEX.json', 'neo/know/samayo-capital.json', 'grown/index.mjs', 'grown/index.json', 'grown/cells/country-capital-neo-g6.mjs', 'grown/apps.mjs', 'world/policy.json', 'bench/fixtures/wiki/pack-200/meta.json']) assert.match(f, re, f);
  for (const f of ['neo/tasks/capital-country/heldout.jsonl', 'neo/requests.jsonl', 'neo/LEDGER.json', 'judge/heldout/x.jsonl', 'state/x', 'bench/fixtures/other/x']) assert.doesNotMatch(f, re, f);
  // servingOf: counted from the two indexes alone
  const root = knowRoot('serving');
  assert.deepEqual(servingOf({ root }), { packs: 2, cells: 0 });
  fs.writeFileSync(path.join(root, 'grown', 'index.json'), JSON.stringify({ generation: 6, cells: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] }));
  assert.deepEqual(servingOf({ root }), { packs: 2, cells: 3 });
  assert.deepEqual(servingOf({ root: path.join(TMP, 'nowhere') }), { packs: 0, cells: 0 });
  assert.deepEqual(servingOf({ root: path.join(TMP, 'nowhere'), nativeRoot: root }), { packs: 2, cells: 0 });
  fs.writeFileSync(path.join(root, 'neo', 'know', 'INDEX.json'), '{not json');
  assert.deepEqual(servingOf({ root }), { packs: 0, cells: 3 });
  const h = createHandlerAt({ stateDir: path.join(TMP, 'serving'), root: knowRoot('serving-get'), reach: false });
  const g = await h({ method: 'GET', env: {} });
  assert.deepEqual(g.json.serving, { packs: 2, cells: 0 });
});

test('vercel.json (SURFACE) carries INCLUDE_FILES for api/ask.mjs', async () => {
  const { INCLUDE_FILES } = await import('../api/ask.mjs');
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.equal(vercel.functions['api/ask.mjs'].includeFiles, INCLUDE_FILES);
});
