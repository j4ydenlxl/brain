// test/web-ask.test.mjs: the prompt box on dilation.dev (web/ask.mjs, queue item 12).
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

test('the page and the landing box import only the organism copies and make no request', () => {
  const pages = [readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8'), readFileSync(path.join(ROOT, 'web', 'src', 'index.html'), 'utf8')];
  for (const html of pages) {
    for (const m of html.matchAll(/import\s*(?:\{[^}]*\}\s*from\s*)?\(?\s*['"]([^'"]+)['"]/g)) assert.match(m[1], /^\.{1,2}\/organism\//, 'import ' + m[1]);
    assert.doesNotMatch(html, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource/);
  }
  assert.match(pages[1], /id="askf"/);
});
