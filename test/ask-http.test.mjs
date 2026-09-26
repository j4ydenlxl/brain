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
import { createHandler, FOOTER, LIMITS, NOT_CONFIGURED } from '../act/ask-http.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-http-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } });
const KEY = 'plantedkey-3141592653-not-a-real-key';
const post = (prompt, extra = {}) => ({ method: 'POST', body: JSON.stringify({ prompt }), ip: '10.0.0.1', env: {}, ...extra });

test('POST "what is 17 times 23" answers 391, route direct, provenance exact, an integer serverUs, the CLI footer fields', async () => {
  const h = createHandler({ stateDir: path.join(TMP, 'a') });
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
  const h = createHandler({ stateDir: path.join(TMP, 'b') });
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
  const h = createHandler({ stateDir: path.join(TMP, 'c') });
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
  const h = createHandler({ stateDir: path.join(TMP, 'd') });
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
  const h = createHandler({ stateDir: path.join(TMP, 'e') });
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
const h = m.createHandler({ stateDir: ${JSON.stringify(stateDir)} });
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
