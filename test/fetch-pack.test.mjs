// test/fetch-pack.test.mjs: the pack fetcher against a local server (no network): fetch, verify, no-op, repair, --check.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { fetchPack, readManifest, stateOf, parseArgs } from '../tools/fetch-pack.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-pack-'));
const src = path.join(tmp, 'src');
fs.mkdirSync(src);
const bodies = { 'a.bin': Buffer.alloc(70000, 7), 'b.txt': Buffer.from('hello pack\n') };
for (const [n, b] of Object.entries(bodies)) fs.writeFileSync(path.join(src, n), b);
const sha = (b) => createHash('sha256').update(b).digest('hex');
const server = http.createServer((req, res) => {
  const name = path.basename(req.url);
  if (!bodies[name]) { res.statusCode = 404; return res.end('no'); }
  if (name === 'b.txt' && req.headers['x-corrupt']) return res.end('wrong body');
  res.end(bodies[name]);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port + '/pack/';
const manifest = { version: 1, dir: 'unused', base, files: Object.fromEntries(Object.entries(bodies).map(([n, b]) => [n, { bytes: b.length, sha256: sha(b) }])) };
const manifestFile = path.join(tmp, 'manifest.json');
fs.writeFileSync(manifestFile, JSON.stringify(manifest));
const dir = path.join(tmp, 'dst');

test('fetches every missing file and verifies it', async () => {
  const r = await fetchPack({ dir, manifest: manifestFile, quiet: true });
  assert.equal(r.fetched, 2); assert.equal(r.failed, 0); assert.equal(r.present, 0);
  assert.equal(r.bytesFetched, 70011);
  assert.deepEqual(fs.readFileSync(path.join(dir, 'b.txt')), bodies['b.txt']);
  assert.equal(fs.existsSync(path.join(dir, 'b.txt.part')), false);
});

test('a second run is a no-op', async () => {
  const r = await fetchPack({ dir, manifest: manifestFile, quiet: true });
  assert.equal(r.present, 2); assert.equal(r.fetched, 0); assert.equal(r.bytesFetched, 0);
});

test('a wrong-size or wrong-hash file is re-fetched', async () => {
  fs.appendFileSync(path.join(dir, 'a.bin'), 'x');
  fs.writeFileSync(path.join(dir, 'b.txt'), 'hello pAck\n');
  assert.equal(await stateOf(path.join(dir, 'a.bin'), manifest.files['a.bin']), 'wrong-size');
  assert.equal(await stateOf(path.join(dir, 'b.txt'), manifest.files['b.txt']), 'wrong-hash');
  const r = await fetchPack({ dir, manifest: manifestFile, quiet: true });
  assert.equal(r.fetched, 2); assert.equal(r.failed, 0);
  assert.equal(await stateOf(path.join(dir, 'a.bin'), manifest.files['a.bin']), 'present');
});

test('--check never downloads and counts what is wrong', async () => {
  fs.unlinkSync(path.join(dir, 'a.bin'));
  const r = await fetchPack({ dir, manifest: manifestFile, quiet: true, check: true });
  assert.equal(r.failed, 1); assert.equal(r.present, 1); assert.equal(r.fetched, 0);
  assert.equal(fs.existsSync(path.join(dir, 'a.bin')), false);
});

test('a body that does not hash is refused and leaves no file', async () => {
  fs.unlinkSync(path.join(dir, 'b.txt'));
  const bad = (url) => fetch(url, { headers: { 'x-corrupt': '1' } });
  const r = await fetchPack({ dir, manifest: manifestFile, quiet: true, only: ['b.txt'], fetch: bad });
  assert.equal(r.failed, 1); assert.equal(r.fetched, 0);
  assert.match(r.rows[0].error, /verify failed/);
  assert.equal(fs.existsSync(path.join(dir, 'b.txt')), false);
  assert.equal(fs.existsSync(path.join(dir, 'b.txt.part')), false);
});

test('the committed manifest is well formed and names 13 files', () => {
  const m = readManifest(new URL('../tools/pack-manifest.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  assert.equal(Object.keys(m.files).length, 13);
  assert.equal(m.dir, 'bench/fixtures/wiki/pack-200');
  assert.match(m.base, /^https:\/\/.*public\.blob\.vercel-storage\.com\/pack-200\/$/);
});

test('parseArgs', () => {
  assert.deepEqual(parseArgs(['--only', 'a,b', '--check']).only, ['a', 'b']);
  assert.throws(() => parseArgs(['--nope']), /unknown argument/);
});

test.after(() => { server.close(); fs.rmSync(tmp, { recursive: true, force: true }); });
