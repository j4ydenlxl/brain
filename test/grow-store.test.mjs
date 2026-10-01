// test/grow-store.test.mjs: the cell-store writer and the promoter (grow/store.mjs; grow/CONTRACT.md).
// Author: board 37 store builder, 2026-09-30.
// The store side runs against an http stub on 127.0.0.1 that emulates the GitHub contents API (GET 404, PUT 201,
// GET 200 with sha, PUT 200, a stale sha 409, the blob API past a size threshold) through --api-base: no token is
// needed, and the first shard runs with a dummy GITHUB_TOKEN set that no request may carry. An independent ustar
// reader decodes the shard. Promote runs on temp grown/ dirs: each guard has a case that trips it alone.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderIndexMjs, GROWN_BODY, NO_TRANSPORT, CLOUD_ENV, makeTransport, conjunctionFailures, candidatesOf, promote } from '../grow/store.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE = path.join(ROOT, 'grow', 'store.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-store-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } });
const REPO = 'test/cells';

// No real token and no cloud-VM marker reaches a child unless a test sets one (a dummy) on purpose.
function childEnv(extra = {}) {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (/^(GITHUB_TOKEN|GH_TOKEN|GH_ENTERPRISE_TOKEN)$/i.test(k) || CLOUD_ENV.includes(k.toUpperCase())) delete env[k];
  return { ...env, ...extra };
}
const DUMMY_TOKEN = 'dummy-token-for-the-stub-test';

function run(args, { env = childEnv() } = {}) {
  return new Promise((resolve) => {
    const ch = spawn(process.execPath, [STORE, ...args], { cwd: ROOT, env, windowsHide: true });
    let stdout = '';
    let stderr = '';
    ch.stdout.on('data', (d) => { stdout += d; });
    ch.stderr.on('data', (d) => { stderr += d; });
    ch.on('close', (code) => resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
  });
}
const json = (r) => { assert.equal(r.code, 0, 'exit ' + r.code + ': ' + r.stderr); const lines = r.stdout.split('\n'); assert.equal(lines.length, 1, 'one JSON line'); return JSON.parse(lines[0]); };

// ---- the contents API stub

const gitSha = (buf) => crypto.createHash('sha1').update('blob ' + buf.length + '\0').update(buf).digest('hex');
const wrap = (b64) => b64.replace(/.{1,60}/g, '$&\n');

function startStub({ repo = REPO, bigAt = Infinity } = {}) {
  const files = new Map();
  const log = [];
  const hooks = { beforePut: null };
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const u = new URL(req.url, 'http://stub');
      const where = decodeURIComponent(u.pathname);
      const send = (status, obj) => {
        log.push({ method: req.method, path: where, status, ref: u.searchParams.get('ref'), auth: 'authorization' in req.headers });
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(JSON.stringify(obj));
      };
      const pre = '/repos/' + repo;
      if (!where.startsWith(pre)) return send(404, { message: 'Not Found' });
      const rest = where.slice(pre.length);
      if (req.method === 'GET' && rest === '') return send(200, { full_name: repo, private: true, default_branch: 'main' });
      const blob = /^\/git\/blobs\/([0-9a-f]{40})$/.exec(rest);
      if (req.method === 'GET' && blob) {
        for (const buf of files.values()) if (gitSha(buf) === blob[1]) return send(200, { sha: blob[1], size: buf.length, encoding: 'base64', content: wrap(buf.toString('base64')) });
        return send(404, { message: 'Not Found' });
      }
      const m = /^\/contents\/(.+)$/.exec(rest);
      if (!m) return send(404, { message: 'Not Found' });
      const p = m[1];
      if (req.method === 'GET') {
        const buf = files.get(p);
        if (!buf) return send(404, { message: 'Not Found' });
        const big = buf.length > bigAt;
        return send(200, { type: 'file', name: path.posix.basename(p), path: p, sha: gitSha(buf), size: buf.length, encoding: big ? 'none' : 'base64', content: big ? '' : wrap(buf.toString('base64')) });
      }
      if (req.method === 'PUT') {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (hooks.beforePut) hooks.beforePut(p, files);
        const cur = files.get(p);
        if (body.branch !== 'main') return send(422, { message: 'branch is not main' });
        if (typeof body.message !== 'string' || !body.message) return send(422, { message: 'no commit message' });
        if (cur && !body.sha) return send(422, { message: 'Invalid request. "sha" wasn\'t supplied.' });
        if (cur && body.sha !== gitSha(cur)) return send(409, { message: p + ' does not match ' + body.sha });
        if (!cur && body.sha) return send(422, { message: 'sha given for a file that does not exist' });
        const buf = Buffer.from(body.content, 'base64');
        files.set(p, buf);
        return send(cur ? 200 : 201, { content: { path: p, sha: gitSha(buf) }, commit: { sha: 'c'.repeat(40), message: body.message } });
      }
      return send(405, { message: 'method not allowed' });
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
    files, log, hooks, base: 'http://127.0.0.1:' + server.address().port,
    close: () => new Promise((q) => server.close(q)),
  })));
}
const calls = (stub, p, from = 0) => stub.log.slice(from).filter((l) => l.path.endsWith('/contents/' + p)).map((l) => l.method + ' ' + l.status);

// ---- an independent ustar reader

function untar(buf) {
  const out = [];
  let off = 0;
  while (off + 512 <= buf.length) {
    const h = buf.subarray(off, off + 512);
    if (h.every((b) => b === 0)) break;
    const str = (a, n) => h.subarray(a, a + n).toString('utf8').replace(/\0[\s\S]*$/, '');
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 0x20 : h[i];
    if (sum !== parseInt(str(148, 8).trim(), 8)) throw new Error('bad header checksum at byte ' + off);
    if (h.subarray(257, 263).toString('latin1') !== 'ustar\0') throw new Error('no ustar magic at byte ' + off);
    const prefix = str(345, 155);
    const name = (prefix ? prefix + '/' : '') + str(0, 100);
    const size = parseInt(str(124, 12), 8);
    const type = String.fromCharCode(h[156]);
    off += 512;
    out.push({ name, type, data: Buffer.from(buf.subarray(off, off + size)) });
    off += Math.ceil(size / 512) * 512;
  }
  return out;
}

function diskFiles(dir, prefix) {
  const out = new Map();
  const walk = (abs, rel) => {
    for (const n of fs.readdirSync(abs)) {
      const a = path.join(abs, n);
      const r = rel ? rel + '/' + n : n;
      if (fs.statSync(a).isDirectory()) walk(a, r);
      else out.set(prefix + '/' + r, fs.readFileSync(a));
    }
  };
  walk(dir, '');
  return out;
}

// ---- fixture candidates

function makeCandidate(laneDir, { id, cls, metaCls = cls, gen = 1, lane, q, can, reply, survived, sibling = false, siblingSrc = "export const WORD = 'marigold';\n", extraSrc = '', heldout = { n: 2, ok: 2, score: 1 }, verdictPatch = {}, resultPatch = {}, noResult = false }) {
  const dir = path.join(laneDir, id);
  fs.mkdirSync(dir, { recursive: true });
  const src = [
    sibling ? "import { WORD } from './words.mjs';" : '',
    'export const meta = { id: ' + JSON.stringify(id) + ', class: ' + JSON.stringify(metaCls) + ', generation: ' + gen + ', lane: ' + JSON.stringify(lane) + ', grownFrom: [' + JSON.stringify(q) + '], version: 1 };',
    'export function can(q) { return ' + can + '.test(String(q)); }',
    'export function answer(q) { return can(q) ? ' + (sibling ? JSON.stringify(reply + ' ') + ' + WORD' : JSON.stringify(reply)) + ' : null; }',
    'export const examples = [{ q: ' + JSON.stringify(q) + ', expect: { notRefusal: true } }];',
    extraSrc,
  ].filter(Boolean).join('\n') + '\n';
  fs.writeFileSync(path.join(dir, 'cell.mjs'), src);
  if (sibling) fs.writeFileSync(path.join(dir, 'words.mjs'), siblingSrc);
  fs.writeFileSync(path.join(dir, 'test.mjs'), "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport * as c from './cell.mjs';\ntest('can', () => assert.equal(c.can(c.examples[0].q), true));\n");
  fs.writeFileSync(path.join(dir, 'examples.jsonl'), JSON.stringify({ q, expect: { notRefusal: true } }) + '\n');
  if (!noResult) fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify({ ...goodResult(dir, id, cls), ...resultPatch }));
  fs.writeFileSync(path.join(dir, 'verdict.json'), JSON.stringify({ ...goodVerdict(dir, id, cls, survived, heldout), ...verdictPatch }));
  return dir;
}

// A result and a verdict that carry the whole CONTRACT conjunction (a loser differs only in survived and why).
function goodResult(dir, id, cls) {
  return { candidate: dir, id, class: cls, backend: 'vercel', session: 'fixture', cpuMs: 7, validate: { ok: true, errors: [] }, tests: { exitCode: 0, passed: 1, failed: 0 }, exitCode: 0, error: null };
}
function goodVerdict(dir, id, cls, survived = true, heldout = { n: 2, ok: 2, score: 1 }) {
  return { candidate: dir, id, class: cls, survived, why: survived ? [] : ['a fixture loser'], lockOk: true, judgeSha: 'fixture', examples: { n: 1, ok: 1 }, heldout, baseline: { n: 2, ok: 0, score: 0, file: 'fixture' }, control: { n: 3, shadows: 0 }, tests: { passed: 1, failed: 0 }, at: '2026-09-30T00:00:00.000Z' };
}

const ECHO = { id: 'test-echo-cell', cls: 'echo', lane: 'alpha', q: 'say the echo word', can: '/\\becho word\\b/i', reply: 'The echo word is', survived: true, sibling: true };
const LOSER = { id: 'test-loser-cell', cls: 'echo', lane: 'alpha', q: 'say the loser word', can: '/\\bloser word\\b/i', reply: 'The loser word.', survived: false };

function lane(name, specs, gen = 1) {
  const dir = path.join(TMP, 'lanes', 'gen-' + gen, name);
  for (const s of specs) makeCandidate(dir, { ...s, lane: name, gen: s.gen ?? gen });
  return dir;
}

// ---- shard and index against the stub

let stub;
before(async () => { stub = await startStub(); });
after(async () => { await stub.close(); });

test('shard: a first write creates the shard, the generation file and index.json (GET 404 then PUT 201); the tarball decodes to the lane', async () => {
  const dir = lane('alpha', [ECHO, LOSER]);
  fs.writeFileSync(path.join(dir, 'lane.json'), '{"note":"a lane-level file rides along"}\n');
  const out = json(await run(['shard', '1', 'alpha', '--dir', dir, '--repo', REPO, '--api-base', stub.base], { env: childEnv({ GITHUB_TOKEN: DUMMY_TOKEN }) }));
  const gz = stub.files.get('shards/gen-1-alpha.tar.gz');
  assert.ok(gz, 'the shard was PUT');
  assert.deepEqual(out, { shard: 'shards/gen-1-alpha.tar.gz', bytes: gz.length, candidates: 2, survivors: 1, indexCells: 2 });
  assert.deepEqual(calls(stub, 'index.json'), ['GET 404', 'GET 404', 'PUT 201']);
  assert.deepEqual(calls(stub, 'shards/gen-1-alpha.tar.gz'), ['GET 404', 'PUT 201']);
  assert.deepEqual(calls(stub, 'generations/gen-1-alpha.json'), ['GET 404', 'PUT 201']);
  assert.ok(stub.log.length >= 7, 'the stub saw the run');
  assert.ok(stub.log.every((l) => !l.auth), 'GITHUB_TOKEN was in the environment and no request carried an authorization header');
  const probe = stub.log.length;
  await fetch(stub.base + '/repos/' + REPO + '/contents/probe.txt?ref=main', { headers: { authorization: 'Bearer ' + DUMMY_TOKEN } });
  assert.equal(stub.log[probe].auth, true, 'the control: the stub does see an authorization header when one is sent');
  stub.log.splice(probe, 1);
  assert.ok(stub.log.filter((l) => l.method === 'GET' && l.path.includes('/contents/')).every((l) => l.ref === 'main'), 'every GET reads branch main');

  const entries = untar(zlib.gunzipSync(gz));
  const want = diskFiles(dir, 'gen-1-alpha');
  const got = new Map(entries.filter((e) => e.type === '0').map((e) => [e.name, e.data]));
  assert.deepEqual([...got.keys()].sort(), [...want.keys()].sort());
  for (const [n, data] of want) assert.ok(data.equals(got.get(n)), n + ' round-trips byte for byte');
  for (const f of ['cell.mjs', 'test.mjs', 'examples.jsonl', 'result.json', 'verdict.json']) {
    assert.ok(got.has('gen-1-alpha/test-echo-cell/' + f) && got.has('gen-1-alpha/test-loser-cell/' + f), f + ' of both candidates, winner and loser');
  }
  assert.ok(got.has('gen-1-alpha/test-echo-cell/words.mjs'));
  assert.ok(entries.some((e) => e.type === '5' && e.name === 'gen-1-alpha/test-loser-cell/'), 'directory entries');
  const bad = Buffer.from(zlib.gunzipSync(gz));
  bad[10] ^= 0xff;
  assert.throws(() => untar(bad), /bad header checksum/, 'the reader is a control: a flipped header byte fails it');
  const sys = spawnSync('tar', ['-tzf', '-'], { input: gz, encoding: 'utf8' });
  if (sys.error || sys.status !== 0) console.log('# tar binary not usable here: ' + (sys.error?.code || sys.stderr));
  else assert.deepEqual(sys.stdout.split(/\r?\n/).filter(Boolean).map((s) => s.replace(/\\/g, '/')).sort(), entries.map((e) => e.name).sort(), 'a system tar lists the same entries');

  const genDoc = JSON.parse(stub.files.get('generations/gen-1-alpha.json'));
  assert.equal(genDoc.generation, 1);
  assert.equal(genDoc.lane, 'alpha');
  assert.match(genDoc.at, /^\d{4}-\d\d-\d\dT/);
  assert.equal(genDoc.cpuMs, 14);
  assert.deepEqual(genDoc.candidates, [
    { id: 'test-echo-cell', class: 'echo', survived: true, heldout: { n: 2, ok: 2, score: 1 }, baseline: { n: 2, ok: 0, score: 0, file: 'fixture' } },
    { id: 'test-loser-cell', class: 'echo', survived: false, heldout: { n: 2, ok: 2, score: 1 }, baseline: { n: 2, ok: 0, score: 0, file: 'fixture' } },
  ]);
  const index = JSON.parse(stub.files.get('index.json'));
  assert.deepEqual(index, {
    shards: ['shards/gen-1-alpha.tar.gz'],
    cells: [
      { id: 'test-echo-cell', class: 'echo', generation: 1, lane: 'alpha', survived: true, shard: 'shards/gen-1-alpha.tar.gz' },
      { id: 'test-loser-cell', class: 'echo', generation: 1, lane: 'alpha', survived: false, shard: 'shards/gen-1-alpha.tar.gz' },
    ],
  });
});

test('shard: a second lane appends (GET 200 with sha then PUT 200); a re-run of the same lane replaces its own rows', async () => {
  const mark = stub.log.length;
  const dir = lane('beta', [{ id: 'test-beta-cell', cls: 'beta', q: 'say the beta word', can: '/\\bbeta word\\b/i', reply: 'Beta.', survived: false }]);
  const out = json(await run(['shard', '1', 'beta', '--dir', dir, '--repo', REPO, '--api-base', stub.base]));
  assert.deepEqual(out, { shard: 'shards/gen-1-beta.tar.gz', bytes: stub.files.get('shards/gen-1-beta.tar.gz').length, candidates: 1, survivors: 0, indexCells: 3 });
  assert.deepEqual(calls(stub, 'index.json', mark), ['GET 200', 'GET 200', 'PUT 200']);
  const index = JSON.parse(stub.files.get('index.json'));
  assert.deepEqual(index.shards, ['shards/gen-1-alpha.tar.gz', 'shards/gen-1-beta.tar.gz']);
  assert.deepEqual(index.cells.map((c) => c.id), ['test-echo-cell', 'test-loser-cell', 'test-beta-cell']);

  const mark2 = stub.log.length;
  const again = json(await run(['shard', '1', 'alpha', '--dir', path.join(TMP, 'lanes', 'gen-1', 'alpha'), '--repo', REPO, '--api-base', stub.base]));
  assert.equal(again.indexCells, 3, 'a re-run does not duplicate its rows');
  assert.deepEqual(calls(stub, 'shards/gen-1-alpha.tar.gz', mark2), ['GET 200', 'PUT 200'], 'the shard is replaced with its sha');
  const after2 = JSON.parse(stub.files.get('index.json'));
  assert.equal(after2.shards.length, 2);
  assert.deepEqual(after2.cells.map((c) => c.id).sort(), ['test-beta-cell', 'test-echo-cell', 'test-loser-cell']);
});

test('shard: an id another shard holds is refused with its line before anything is written', async () => {
  const dir = lane('gamma', [{ ...ECHO, lane: 'gamma' }]);
  const r = await run(['shard', '1', 'gamma', '--dir', dir, '--repo', REPO, '--api-base', stub.base]);
  assert.equal(r.code, 1);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, 'id test-echo-cell is already in the store from shards/gen-1-alpha.tar.gz: an id is unique across the store');
  assert.equal(stub.files.has('shards/gen-1-gamma.tar.gz'), false);
  assert.equal(stub.files.has('generations/gen-1-gamma.json'), false);
});

test('shard: a concurrent index write (409 on a stale sha) is re-read, merged and kept', async () => {
  let raced = false;
  stub.hooks.beforePut = (p, files) => {
    if (p !== 'index.json' || raced) return;
    raced = true;
    const j = JSON.parse(files.get(p));
    j.shards.push('shards/gen-1-racer.tar.gz');
    j.cells.push({ id: 'racer-cell', class: 'race', generation: 1, lane: 'racer', survived: false, shard: 'shards/gen-1-racer.tar.gz' });
    files.set(p, Buffer.from(JSON.stringify(j, null, 2) + '\n'));
  };
  const mark = stub.log.length;
  const dir = lane('delta', [{ id: 'test-delta-cell', cls: 'delta', q: 'say the delta word', can: '/\\bdelta word\\b/i', reply: 'Delta.', survived: true }]);
  try {
    const out = json(await run(['shard', '1', 'delta', '--dir', dir, '--repo', REPO, '--api-base', stub.base]));
    assert.equal(out.indexCells, 5);
    assert.equal(out.survivors, 1);
  } finally { stub.hooks.beforePut = null; }
  assert.ok(raced, 'the race fired');
  assert.deepEqual(calls(stub, 'index.json', mark), ['GET 200', 'GET 200', 'PUT 409', 'GET 200', 'PUT 200']);
  const index = JSON.parse(stub.files.get('index.json'));
  assert.ok(index.cells.some((c) => c.id === 'racer-cell'), 'the concurrent row survived the merge');
  assert.ok(index.cells.some((c) => c.id === 'test-delta-cell'));
});

test('index: prints {shards, cells, survivors}; an empty store prints zeros; a store that cannot be read fails with its line', async () => {
  assert.deepEqual(json(await run(['index', '--repo', REPO, '--api-base', stub.base])), { shards: 4, cells: 5, survivors: 2 });
  const empty = await startStub();
  try {
    assert.deepEqual(json(await run(['index', '--repo', REPO, '--api-base', empty.base])), { shards: 0, cells: 0, survivors: 0 });
    const r = await run(['index', '--repo', 'nobody/none', '--api-base', empty.base]);
    assert.equal(r.code, 1);
    assert.equal(r.stderr, 'the store nobody/none is not readable: HTTP 404 Not Found');
  } finally { await empty.close(); }
});

test('shard: an index past the contents API size is read through the blob API', async () => {
  const big = await startStub({ bigAt: 64 });
  try {
    json(await run(['shard', '1', 'alpha', '--dir', path.join(TMP, 'lanes', 'gen-1', 'alpha'), '--repo', REPO, '--api-base', big.base]));
    const mark = big.log.length;
    const out = json(await run(['shard', '1', 'beta', '--dir', path.join(TMP, 'lanes', 'gen-1', 'beta'), '--repo', REPO, '--api-base', big.base]));
    assert.equal(out.indexCells, 3);
    assert.ok(big.log.slice(mark).some((l) => l.path.includes('/git/blobs/') && l.status === 200), 'the blob API was read');
    assert.deepEqual(json(await run(['index', '--repo', REPO, '--api-base', big.base])), { shards: 2, cells: 3, survivors: 1 });
  } finally { await big.close(); }
});

test('transport: no gh and no GITHUB_TOKEN prints the line; the token goes to api.github.com only', async () => {
  const env = childEnv();
  for (const k of Object.keys(env)) if (k.toUpperCase() === 'PATH') delete env[k];
  env.PATH = path.dirname(process.execPath);
  const r = await run(['index'], { env });
  assert.equal(r.code, 1);
  assert.equal(r.stderr, NO_TRANSPORT);
  assert.equal(makeTransport({ env: {}, ghCheck: () => true }).kind, 'gh');
  assert.equal(makeTransport({ env: { GITHUB_TOKEN: 'x' }, ghCheck: () => false }).kind, 'token');
  assert.throws(() => makeTransport({ env: {}, ghCheck: () => false }), (e) => e.message === NO_TRANSPORT);
  assert.equal(makeTransport({ apiBase: 'http://127.0.0.1:9', env: { GITHUB_TOKEN: 'x' } }).kind, 'fetch', 'a stub base never gets the token');
  assert.equal(makeTransport({ apiBase: 'https://api.github.com', env: { GITHUB_TOKEN: 'x' } }).kind, 'token');
  assert.equal(makeTransport({ apiBase: 'https://API.GITHUB.COM:443/', env: { GITHUB_TOKEN: 'x' } }).kind, 'token', 'the same host, spelled otherwise');
  assert.equal(makeTransport({ apiBase: 'http://api.github.com', env: { GITHUB_TOKEN: 'x' } }).kind, 'fetch', 'never the token in cleartext');
  assert.equal(makeTransport({ apiBase: 'https://api.github.com:8443', env: { GITHUB_TOKEN: 'x' } }).kind, 'fetch', 'another port is another service');
  assert.equal(makeTransport({ apiBase: 'https://api.github.com.evil.test', env: { GITHUB_TOKEN: 'x' } }).kind, 'fetch');
});

test('CLI: --help prints usage; bad arguments fail with one line', async () => {
  const h = await run(['--help']);
  assert.equal(h.code, 0);
  assert.match(h.stdout, /^usage: node grow\/store\.mjs/);
  for (const [args, line] of [
    [['shard', 'x', 'alpha'], 'generation "x" is not a whole number'],
    [['shard', '1', 'Bad Lane'], /^lane "Bad Lane" is not a short word/],
    [['shard', '1'], 'shard takes <gen> <lane> (see --help)'],
    [['index', '--nope', 'x'], 'unknown flag --nope (see --help)'],
    [['frob'], 'unknown verb frob (shard, promote, index, verify-local; see --help)'],
    [['shard', '1', 'empty', '--dir', path.join(TMP, 'nowhere'), '--api-base', 'http://127.0.0.1:9'], 'no lane directory at ' + path.join(TMP, 'nowhere')],
  ]) {
    const r = await run(args);
    assert.equal(r.code, 1, args.join(' '));
    assert.equal(r.stdout, '');
    if (line instanceof RegExp) assert.match(r.stderr, line); else assert.equal(r.stderr, line);
  }
});

// ---- promote and verify-local on a temp grown/

function snapshot(dir) {
  const out = {};
  const walk = (abs, rel) => { for (const n of fs.readdirSync(abs).sort()) { const a = path.join(abs, n); const r = rel + '/' + n; if (fs.statSync(a).isDirectory()) walk(a, r); else out[r] = fs.readFileSync(a, 'utf8'); } };
  walk(dir, '');
  return out;
}

function tempGrown(name) {
  const g = path.join(TMP, name);
  fs.mkdirSync(path.join(g, 'cells'), { recursive: true });
  fs.writeFileSync(path.join(g, 'index.json'), JSON.stringify({ generation: 0, cells: [] }, null, 2) + '\n');
  fs.writeFileSync(path.join(g, 'index.mjs'), renderIndexMjs({ generation: 0, cells: [] }));
  fs.writeFileSync(path.join(g, 'cells', '.keep'), '');
  return g;
}

test('the generated index.mjs keeps the generation-0 body verbatim', () => {
  const real = fs.readFileSync(path.join(ROOT, 'grown', 'index.mjs'), 'utf8');
  const at = real.indexOf('/** The first survivor');
  assert.ok(at > 0);
  assert.equal(real.slice(at), GROWN_BODY, 'the body promote writes is the body in grown/index.mjs');
  const realIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'grown', 'index.json'), 'utf8'));
  if (realIndex.cells.length === 0) assert.equal(renderIndexMjs(realIndex), real, 'generation 0 renders to the file byte for byte');
});

test('promote: one survivor copied with its sibling, the loser not; index.json and index.mjs regenerated and importable; a duplicate refused', async () => {
  const g = tempGrown('grown-a');
  const dir = path.join(TMP, 'lanes', 'gen-1', 'alpha');
  const out = json(await run(['promote', '1', 'alpha', '--dir', dir, '--grown', g]));
  assert.deepEqual(out, { promoted: ['test-echo-cell'], cells: 1, generation: 1 });
  assert.deepEqual(fs.readdirSync(path.join(g, 'cells')).sort(), ['.keep', 'test-echo-cell-words.mjs', 'test-echo-cell.mjs']);
  const copied = fs.readFileSync(path.join(g, 'cells', 'test-echo-cell.mjs'), 'utf8');
  assert.match(copied, /^import \{ WORD \} from '\.\/test-echo-cell-words\.mjs';$/m);
  assert.doesNotMatch(copied, /'\.\/words\.mjs'/);
  const idx = JSON.parse(fs.readFileSync(path.join(g, 'index.json'), 'utf8'));
  assert.equal(idx.generation, 1);
  assert.equal(idx.cells.length, 1);
  const row = idx.cells[0];
  assert.match(row.promotedAt, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual({ ...row, promotedAt: 'x' }, { id: 'test-echo-cell', class: 'echo', generation: 1, lane: 'alpha', file: 'cells/test-echo-cell.mjs', heldout: { score: 1, n: 2 }, promotedAt: 'x' });
  const mjs = fs.readFileSync(path.join(g, 'index.mjs'), 'utf8');
  assert.match(mjs, /^\/\/ order\. Do not edit by hand: the next promote rewrites it\. Generation 1: 1 cell\.$/m);
  assert.match(mjs, /^import \* as c0 from '\.\/cells\/test-echo-cell\.mjs';$/m);
  assert.match(mjs, /^export const GROWN = Object\.freeze\(\[c0\]\);$/m);
  assert.ok(mjs.endsWith(GROWN_BODY));
  assert.equal(mjs, renderIndexMjs(idx));
  assert.equal(spawnSync(process.execPath, ['--check', path.join(g, 'index.mjs')]).status, 0);
  const mod = await import(pathToFileURL(path.join(g, 'index.mjs')).href);
  assert.equal(mod.GROWN.length, 1);
  const hit = mod.grownAnswer(mod.GROWN[0].examples[0].q);
  assert.deepEqual(hit, { id: 'test-echo-cell', class: 'echo', generation: 1, answer: 'The echo word is marigold' });
  assert.equal(mod.grownAnswer('say the loser word'), null, 'the loser was not promoted');
  assert.equal(mod.grownAnswer('what is the capital of France'), null);

  assert.deepEqual(json(await run(['verify-local', '--grown', g])), { cells: 1, answers: [{ id: 'test-echo-cell', q: 'say the echo word', ok: true }] });

  const before = snapshot(g);
  const dup = await run(['promote', '1', 'alpha', '--dir', dir, '--grown', g]);
  assert.equal(dup.code, 1);
  assert.equal(dup.stderr, 'duplicate id test-echo-cell: grown/index.json already holds it, a promote never overwrites a cell');
  assert.deepEqual(snapshot(g), before, 'the refused promote changed nothing');
});

test('promote: a survivor shadowed by an earlier cell fails the proof and grown/ is rolled back; a contract breach is refused before any write', async () => {
  const g = tempGrown('grown-b');
  json(await run(['promote', '1', 'alpha', '--dir', path.join(TMP, 'lanes', 'gen-1', 'alpha'), '--grown', g]));
  const before = snapshot(g);
  const shadowDir = lane('shadow', [{ id: 'test-shadowed-cell', cls: 'echo', gen: 2, q: 'say the echo word twice', can: '/\\becho word twice\\b/i', reply: 'Twice.', survived: true }], 2);
  const r = await run(['promote', '2', 'shadow', '--dir', shadowDir, '--grown', g]);
  assert.equal(r.code, 1);
  assert.equal(r.stderr, 'test-shadowed-cell does not answer its own examples[0].q through grownAnswer (got test-echo-cell) (rolled back: grown/ is as it was)');
  assert.deepEqual(snapshot(g), before, 'the failed proof left grown/ exactly as it was');

  const breachDir = lane('breach', [{ id: 'test-breach-cell', cls: 'echo', gen: 2, q: 'say the breach word', can: '/\\bbreach word\\b/i', reply: 'Breach.', survived: true, extraSrc: 'export const leak = () => process.env;' }], 2);
  const b = await run(['promote', '2', 'breach', '--dir', breachDir, '--grown', g]);
  assert.equal(b.code, 1);
  assert.equal(b.stderr, 'test-breach-cell: the cell fails the contract: the source uses process');
  assert.deepEqual(snapshot(g), before);

  const none = json(await run(['promote', '1', 'beta', '--dir', path.join(TMP, 'lanes', 'gen-1', 'beta'), '--grown', g]));
  assert.deepEqual(none, { promoted: [], cells: 1, generation: 1 }, 'a lane with no survivor promotes nothing');
  assert.deepEqual(snapshot(g), before);
});

test('verify-local: a cell another cell shadows fails with its line', async () => {
  const g = tempGrown('grown-c');
  const cellsDir = path.join(g, 'cells');
  const write = (id, can, q) => fs.writeFileSync(path.join(cellsDir, id + '.mjs'), 'export const meta = { id: ' + JSON.stringify(id) + ", class: 'x', generation: 1, lane: 'l', grownFrom: [], version: 1 };\nexport function can(q) { return " + can + '; }\nexport function answer(q) { return ' + JSON.stringify(id) + '; }\nexport const examples = [{ q: ' + JSON.stringify(q) + ', expect: {} }];\n');
  write('greedy-cell', 'true', 'anything');
  write('starved-cell', "q === 'mine'", 'mine');
  const idx = { generation: 1, cells: ['greedy-cell', 'starved-cell'].map((id) => ({ id, class: 'x', generation: 1, lane: 'l', file: 'cells/' + id + '.mjs', heldout: { score: 1, n: 1 }, promotedAt: 'x' })) };
  fs.writeFileSync(path.join(g, 'index.mjs'), renderIndexMjs(idx));
  const r = await run(['verify-local', '--grown', g]);
  assert.equal(r.code, 1);
  assert.equal(r.stderr, 'verify-local: 1 of 2 cells do not answer their own examples[0].q: starved-cell');
});

// ---- every guard of promote, each tripped alone

const ROLLED = ' (rolled back: grown/ is as it was)';
let seq = 0;
/** One survivor lane of its own: a fresh lane dir, a candidate whose only defect is the one the case names. */
function one(gen, spec) {
  const name = 'g' + (++seq);
  const id = spec.id || 'test-guard-' + seq + '-cell';
  const w = 'guard' + seq + ' word';
  return { id, dir: lane(name, [{ cls: 'guard', q: 'say the ' + w, can: '/\\b' + w + '\\b/i', reply: 'Guard ' + seq + '.', survived: true, ...spec, id }], gen), lane: name };
}

test('conjunctionFailures: a whole conjunction passes; each clause broken alone is named alone', () => {
  const V = goodVerdict('d', 'x-cell', 'c');
  const R = goodResult('d', 'x-cell', 'c');
  assert.deepEqual(conjunctionFailures(V, R, {}), [], 'the control: the fixture verdict carries the whole conjunction');
  const cases = [
    [{ survived: 'true' }, {}, 'survived is not true'],
    [{ why: ['a reason'] }, {}, 'why is not an empty list'],
    [{ why: undefined }, {}, 'why is not an empty list'],
    [{ lockOk: false }, {}, 'lockOk is not true'],
    [{ tests: { passed: 1, failed: 3 } }, {}, 'verdict tests are not failed 0 with at least one passed'],
    [{ tests: { passed: 0, failed: 0 } }, {}, 'verdict tests are not failed 0 with at least one passed'],
    [{ control: { n: 3, shadows: 1 } }, {}, 'control is not shadows 0 over at least one row'],
    [{ control: { n: 0, shadows: 0 } }, {}, 'control is not shadows 0 over at least one row'],
    [{ examples: { n: 2, ok: 1 } }, {}, 'not every example is ok'],
    [{ examples: { n: 0, ok: 0 } }, {}, 'not every example is ok'],
    [{ heldout: { n: 2, ok: 0, score: 0 }, baseline: { n: 2, ok: 2, score: 1 } }, {}, 'heldout.score is not above baseline.score'],
    [{ heldout: { n: 2, ok: 0, score: 0 } }, {}, 'heldout.score is not above baseline.score'],
    [{ heldout: null }, {}, 'heldout.score is not above baseline.score'],
    [{ baseline: null }, {}, 'heldout.score is not above baseline.score'],
    [{}, { validate: { ok: false, errors: ['x'] } }, 'result.json validate.ok is not true'],
    [{}, { tests: { exitCode: 1, passed: 1, failed: 0 } }, 'result.json tests are not exit code 0 with failed 0'],
    [{}, { tests: { exitCode: 0, passed: 1, failed: 2 } }, 'result.json tests are not exit code 0 with failed 0'],
    [{}, { error: 'the sandbox timed out' }, 'result.json records a sandbox error'],
    [{}, { exitCode: 3 }, 'result.json exitCode is 3'],
    [{}, { backend: 'here' }, 'result.json backend is here and this is not a cloud VM: a candidate never runs on his PC'],
    [{}, { backend: 'laptop' }, 'result.json backend is "laptop", not vercel or here'],
  ];
  for (const [vp, rp, line] of cases) assert.deepEqual(conjunctionFailures({ ...V, ...vp }, { ...R, ...rp }, {}), [line], JSON.stringify([vp, rp]));
  assert.deepEqual(conjunctionFailures(V, null, {}), ['there is no result.json']);
  for (const k of CLOUD_ENV) assert.deepEqual(conjunctionFailures(V, { ...R, backend: 'here' }, { [k]: 'true' }), [], 'a here run on a cloud VM (' + k + ') passes');
});

test('promote: a survived:true verdict that fails its own conjunction is refused before any write, clause by clause', async () => {
  const g = tempGrown('grown-conj');
  const before = snapshot(g);
  const cases = [
    [{ verdictPatch: { lockOk: false } }, 'lockOk is not true'],
    [{ verdictPatch: { heldout: { n: 2, ok: 0, score: 0 }, baseline: { n: 2, ok: 2, score: 1 } } }, 'heldout.score is not above baseline.score'],
    [{ resultPatch: { validate: { ok: false, errors: ['x'] } } }, 'result.json validate.ok is not true'],
    [{ resultPatch: { backend: 'here' } }, 'result.json backend is here and this is not a cloud VM: a candidate never runs on his PC'],
    [{ noResult: true }, 'there is no result.json'],
  ];
  for (const [spec, clause] of cases) {
    const c = one(1, spec);
    await assert.rejects(promote({ gen: 1, lane: c.lane, dir: c.dir, grownDir: g, env: {} }), (e) => {
      assert.equal(e.message, c.id + ': verdict.json says survived true but the conjunction fails: ' + clause);
      return true;
    });
  }
  const all = one(1, { verdictPatch: { lockOk: false, control: { n: 3, shadows: 1 } }, resultPatch: { backend: 'here', tests: { exitCode: 0, passed: 1, failed: 3 } } });
  const r = await run(['promote', '1', all.lane, '--dir', all.dir, '--grown', g]);
  assert.equal(r.code, 1);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, all.id + ': verdict.json says survived true but the conjunction fails: lockOk is not true; control is not shadows 0 over at least one row; result.json tests are not exit code 0 with failed 0; result.json backend is here and this is not a cloud VM: a candidate never runs on his PC');
  assert.deepEqual(snapshot(g), before, 'no refused survivor reached grown/');

  const here = one(1, { resultPatch: { backend: 'here' } });
  assert.equal((await run(['promote', '1', here.lane, '--dir', here.dir, '--grown', g])).code, 1, 'a here run refused on this machine');
  assert.deepEqual(json(await run(['promote', '1', here.lane, '--dir', here.dir, '--grown', g], { env: childEnv({ GITHUB_ACTIONS: 'true' }) })), { promoted: [here.id], cells: 1, generation: 1 }, 'the same run promoted on a cloud VM');
});

test('promote: survived must be the boolean true; a string "true" is a loser in promote and in the store row', async () => {
  const g = tempGrown('grown-str');
  const before = snapshot(g);
  const c = one(1, { verdictPatch: { survived: 'true' } });
  assert.equal(candidatesOf(c.dir)[0].survived, false);
  assert.deepEqual(json(await run(['promote', '1', c.lane, '--dir', c.dir, '--grown', g])), { promoted: [], cells: 0, generation: 0 });
  assert.deepEqual(snapshot(g), before);
});

test('store row: a survived:true verdict that fails the conjunction is a loser in candidatesOf, shard and index too, not only in promote', async () => {
  const kept = one(1, { verdictPatch: { survived: true, why: ['a clause the verdict kept'] } });
  assert.equal(candidatesOf(kept.dir)[0].survived, false, 'why not empty');
  const redTests = one(1, { resultPatch: { tests: { exitCode: 1, passed: 1, failed: 0 } } });
  assert.equal(candidatesOf(redTests.dir)[0].survived, false, 'result.json tests exit 1');
  const noResult = one(1, { noResult: true });
  assert.equal(candidatesOf(noResult.dir)[0].survived, false, 'no result.json');
  const out = json(await run(['shard', '1', kept.lane, '--dir', kept.dir, '--repo', REPO, '--api-base', stub.base], { env: childEnv({ GITHUB_TOKEN: DUMMY_TOKEN }) }));
  assert.deepEqual([out.candidates, out.survivors], [1, 0]);
  // the control: the whole conjunction is a survivor in the same row
  const whole = one(1, {});
  assert.equal(candidatesOf(whole.dir)[0].survived, true);
});

test('promote: generation is the max, meta.generation must be the promoted one, and generation 0 holds no survivor', async () => {
  const g = tempGrown('grown-gen');
  const late = one(2, { gen: 2 });
  assert.deepEqual(json(await run(['promote', '2', late.lane, '--dir', late.dir, '--grown', g])), { promoted: [late.id], cells: 1, generation: 2 });
  const early = one(1, { gen: 1 });
  assert.deepEqual(json(await run(['promote', '1', early.lane, '--dir', early.dir, '--grown', g])), { promoted: [early.id], cells: 2, generation: 2 }, 'a later promote of an earlier generation keeps the max');
  const idx = JSON.parse(fs.readFileSync(path.join(g, 'index.json'), 'utf8'));
  assert.equal(idx.generation, 2);
  assert.deepEqual(idx.cells.map((c) => [c.id, c.generation]), [[late.id, 2], [early.id, 1]]);
  assert.match(fs.readFileSync(path.join(g, 'index.mjs'), 'utf8'), /Generation 2: 2 cells\.$/m);

  const before = snapshot(g);
  const mix = one(3, { gen: 1 });
  const m = await run(['promote', '3', mix.lane, '--dir', mix.dir, '--grown', g]);
  assert.equal(m.code, 1);
  assert.equal(m.stderr, mix.id + ': meta.generation is 1, not the promoted generation 3' + ROLLED);
  assert.deepEqual(snapshot(g), before);

  const zero = one(0, { gen: 1 });
  const z = await run(['promote', '0', zero.lane, '--dir', zero.dir, '--grown', g]);
  assert.equal(z.code, 1);
  assert.equal(z.stderr, 'generation 0 holds a survivor but a cell generation is an integer from 1');
  assert.deepEqual(snapshot(g), before);
});

test('promote: a sibling may not use a forbidden construct, reach outside the cell directory or import a bare specifier', async () => {
  const g = tempGrown('grown-sib');
  const before = snapshot(g);
  const cases = [
    ["export const WORD = String(process.env.HOME);\n", (id) => id + ': the sibling words.mjs uses process'],
    ["export const WORD = 'x'; export const f = () => fetch('https://example.test');\n", (id) => id + ': the sibling words.mjs uses fetch()'],
    ["export { WORD } from './../outside.mjs';\n", (id) => id + ': words.mjs imports "./../outside.mjs" from outside the cell directory'],
    ["import { WORD as W } from './sub/../../outside.mjs';\nexport const WORD = W;\n", (id) => id + ': words.mjs imports "./sub/../../outside.mjs" from outside the cell directory'],
    ["import fs from 'node:fs';\nexport const WORD = 'x';\n", (id) => id + ': words.mjs imports "node:fs", not a relative file in the cell directory'],
  ];
  for (const [siblingSrc, line] of cases) {
    const c = one(1, { sibling: true, siblingSrc });
    fs.writeFileSync(path.join(path.dirname(c.dir), 'outside.mjs'), "export const WORD = 'outside';\n");
    const r = await run(['promote', '1', c.lane, '--dir', c.dir, '--grown', g]);
    assert.equal(r.code, 1, siblingSrc);
    assert.equal(r.stderr, line(c.id));
  }
  assert.deepEqual(snapshot(g), before);
});

test('promote: a verdict or result naming another id, and a meta.class the verdict does not say, are refused', async () => {
  const g = tempGrown('grown-ids');
  const before = snapshot(g);
  for (const [spec, file] of [[{ verdictPatch: { id: 'someone-else' } }, 'verdict.json'], [{ resultPatch: { id: 'someone-else' } }, 'result.json']]) {
    const c = one(1, spec);
    const r = await run(['promote', '1', c.lane, '--dir', c.dir, '--grown', g]);
    assert.equal(r.code, 1);
    assert.equal(r.stderr, c.id + '/' + file + ' names id someone-else, not its directory ' + c.id);
  }
  const k = one(1, { cls: 'guard', metaCls: 'other' });
  const r = await run(['promote', '1', k.lane, '--dir', k.dir, '--grown', g]);
  assert.equal(r.code, 1);
  assert.equal(r.stderr, k.id + ': meta.class is other but the verdict says guard' + ROLLED);
  assert.deepEqual(snapshot(g), before);
});

test('promote: the regenerated index.mjs is checked (node --check, cell count, cell order) and a bad one is rolled back', async () => {
  const pairLane = lane('pair', [
    { id: 'test-pair-a-cell', cls: 'pair', q: 'say the first pair word', can: '/\\bfirst pair word\\b/i', reply: 'First.', survived: true },
    { id: 'test-pair-b-cell', cls: 'pair', q: 'say the second pair word', can: '/\\bsecond pair word\\b/i', reply: 'Second.', survived: true },
  ]);
  const cases = [
    [() => 'export const GROWN = [;\n', (g) => (m) => m.startsWith('node --check ' + path.join(g, 'index.mjs') + ' failed: ') && m.endsWith(ROLLED)],
    [(idx) => renderIndexMjs({ ...idx, cells: idx.cells.slice(0, 1) }), () => (m) => m === 'grown/index.mjs exports 1 cells, grown/index.json lists 2' + ROLLED],
    [(idx) => renderIndexMjs({ ...idx, cells: idx.cells.slice().reverse() }), () => (m) => m === 'grown/index.mjs cell 0 is test-pair-b-cell, grown/index.json says test-pair-a-cell' + ROLLED],
  ];
  for (const [i, [render, want]] of cases.entries()) {
    const g = tempGrown('grown-render-' + i);
    const before = snapshot(g);
    await assert.rejects(promote({ gen: 1, lane: 'pair', dir: pairLane, grownDir: g, env: {}, render }), (e) => {
      assert.ok(want(g)(e.message), e.message);
      return true;
    });
    assert.deepEqual(snapshot(g), before, 'case ' + i + ' rolled back');
  }
  const g = tempGrown('grown-render-ok');
  assert.deepEqual(await promote({ gen: 1, lane: 'pair', dir: pairLane, grownDir: g, env: {} }), { promoted: ['test-pair-a-cell', 'test-pair-b-cell'], cells: 2, generation: 1 }, 'the control: the same lane with the real renderer promotes');
});
