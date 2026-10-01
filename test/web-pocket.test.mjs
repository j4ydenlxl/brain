// test/web-pocket.test.mjs: THE POCKET (web/pocket.mjs) and its router (act/cells-tab.mjs). Offline: the network is
// a stub, the service worker runs in a node vm with stubbed self, caches, fetch and clients; every temp directory
// is removed. The route rule is proved THE SERVER'S on every prompt of judge/dev/*.jsonl (never a held-out row).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { generatePocket, askColors, iconSvg, swSource, pocketVersion, ROOT, CACHE_PREFIX, SAFE_RADIUS, ICON_SIZE, START_URL, SCOPE, POCKET_HEAD, REGISTER_SW } from '../web/pocket.mjs';
import { loadCells, route, askTab, BUDGET_MS, OFFLINE_LINE, API } from '../act/cells-tab.mjs';
import { generateAsk } from '../web/ask.mjs';
import { grownAnswer } from '../grown/index.mjs';
import { renderIndexMjs } from '../grow/store.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const temps = [];
const tmp = (tag) => { const d = mkdtempSync(path.join(os.tmpdir(), 'pocket-' + tag + '-')); temps.push(d); return d; };
after(() => {
  for (const d of temps) rmSync(d, { recursive: true, force: true });
  for (const d of temps) assert.equal(existsSync(d), false, 'a temp directory was left behind: ' + d);
});
const fileFetch = async (url) => {
  const p = fileURLToPath(url);
  return existsSync(p) ? new Response(readFileSync(p)) : new Response('not found', { status: 404 });
};
const dirUrl = (d) => pathToFileURL(d + path.sep).href;
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

// ---------------------------------------------------------------- the real build, once

const REAL = {};
before(() => {
  REAL.dist = tmp('real');
  generateAsk(REAL.dist);
  REAL.result = generatePocket({ dist: REAL.dist });
  REAL.index = readJson(path.join(ROOT, 'grown', 'index.json'));
  REAL.cells = readJson(path.join(REAL.dist, 'organism', 'cells.json'));
  REAL.sw = readFileSync(path.join(REAL.dist, 'ask', 'sw.js'), 'utf8');
});

// ---------------------------------------------------------------- fixtures

const PAGE = (bg, acc) => '<!doctype html><html><head><style>\n:root { color-scheme: dark; --ink: #eeeeee; --acc: ' + acc + '; }\n* { box-sizing: border-box; }\nhtml, body { margin: 0; background: ' + bg + '; color: var(--ink); }\n</style></head><body>ask</body></html>\n';
const MODULE = 'export const x = 1;\n';

function fixtureDist(dist, { bg = '#112233', acc = '#ddeeff' } = {}) {
  mkdirSync(path.join(dist, 'ask'), { recursive: true });
  writeFileSync(path.join(dist, 'ask', 'index.html'), PAGE(bg, acc));
  mkdirSync(path.join(dist, 'organism', 'act'), { recursive: true });
  writeFileSync(path.join(dist, 'organism', 'act', 'x.mjs'), MODULE);
  writeFileSync(path.join(dist, 'organism', 'manifest.json'), JSON.stringify({ files: [{ file: 'act/x.mjs', bytes: MODULE.length, sha256: sha(MODULE) }] }));
  return dist;
}

const cellSrc = ({ id, cls, gen = 3, lane = 'direct', head = '', can, answer, tail = '' }) => [
  head,
  "export const meta = { id: '" + id + "', class: '" + cls + "', generation: " + gen + ", lane: '" + lane + "', grownFrom: ['x'], version: 1 };",
  'export function can(q) { ' + can + ' }',
  'export function answer(q) { ' + answer + ' }',
  "export const examples = [{ q: 'x', expect: { notRefusal: true } }];",
  tail,
  '',
].join('\n');

const FIXTURE_CELLS = {
  'greet-direct-g3': cellSrc({ id: 'greet-direct-g3', cls: 'greet', can: 'return q.startsWith("hello");', answer: 'return "hello from a grown cell";' }),
  'echo-direct-g3': cellSrc({ id: 'echo-direct-g3', cls: 'echo', head: "import { WORD } from './echo-direct-g3-word.mjs';", can: 'return q.startsWith("echo ");', answer: 'return WORD + ": " + q.slice(5);' }),
  'sum-neo-g3': cellSrc({ id: 'sum-neo-g3', cls: 'sum', lane: 'neo', can: 'return q.startsWith("sum of ");', answer: 'const p = q.slice(7).split(" and ").map(Number); return p.length === 2 && p.every(Number.isFinite) ? String(p[0] + p[1]) : null;', tail: 'export const colony = { cells: 2, kernel: 1 };' }),
};
const SIBLING = "export const WORD = 'echoed';\n";

/** A grown/ of three cells: two hand grown, then a NEO colony (tier "neo"), with grown/index.mjs from the store's own renderer. */
function fixtureRoot(root, { cells = FIXTURE_CELLS, rows = null } = {}) {
  const grown = path.join(root, 'grown');
  mkdirSync(path.join(grown, 'cells'), { recursive: true });
  for (const [id, src] of Object.entries(cells)) writeFileSync(path.join(grown, 'cells', id + '.mjs'), src);
  writeFileSync(path.join(grown, 'cells', 'echo-direct-g3-word.mjs'), SIBLING);
  const index = {
    generation: 3,
    cells: rows || [
      { id: 'greet-direct-g3', class: 'greet', generation: 3, lane: 'direct', file: 'cells/greet-direct-g3.mjs', heldout: { score: 1, n: 4 }, promotedAt: 'x' },
      { id: 'echo-direct-g3', class: 'echo', generation: 3, lane: 'direct', file: 'cells/echo-direct-g3.mjs', heldout: { score: 1, n: 4 }, promotedAt: 'x' },
      { id: 'sum-neo-g3', class: 'sum', generation: 3, lane: 'neo', tier: 'neo', file: 'cells/sum-neo-g3.mjs', heldout: { score: 1, n: 4, ok: 4 }, promotedAt: 'x' },
    ],
  };
  writeFileSync(path.join(grown, 'index.json'), JSON.stringify(index, null, 2));
  writeFileSync(path.join(grown, 'index.mjs'), renderIndexMjs(index));
  return root;
}

function fixture(tag, o = {}) {
  const base = tmp(tag);
  const root = fixtureRoot(path.join(base, 'root'), o);
  const dist = fixtureDist(path.join(base, 'dist'), o);
  return { root, dist };
}

// ---------------------------------------------------------------- the pocket build

test('every live cell of grown/index.json is copied byte for byte, and cells.json carries its sha256 in index order', () => {
  assert.equal(REAL.result.cells, REAL.index.cells.length);
  assert.deepEqual(REAL.cells.cells.map((r) => r.id), REAL.index.cells.map((r) => r.id));
  for (const row of REAL.cells.cells) {
    const src = readFileSync(path.join(ROOT, 'grown', ...row.file.split('/')));
    const copy = readFileSync(path.join(REAL.dist, 'organism', ...row.file.split('/')));
    assert.ok(copy.equals(src), row.id + ' is a byte copy');
    assert.equal(row.sha256, sha(src), row.id + ' carries the sha256 of its source');
    assert.equal(row.bytes, src.length);
  }
  assert.equal(REAL.cells.generation, REAL.index.generation);
});

test('a copy whose bytes are not its source throws the build', () => {
  const { root, dist } = fixture('copy');
  const bad = (src, dst) => writeFileSync(dst, Buffer.concat([readFileSync(src), Buffer.from('\n// not the source\n')]));
  assert.throws(() => generatePocket({ root, dist, copy: bad }), /differs from its source/);
});

test('a cell whose source breaks the contract is never shipped', () => {
  const cells = { ...FIXTURE_CELLS, 'greet-direct-g3': cellSrc({ id: 'greet-direct-g3', cls: 'greet', can: 'return true;', answer: 'return String(fetch("https://x.test"));' }) };
  const { root, dist } = fixture('contract', { cells });
  assert.throws(() => generatePocket({ root, dist }), /greet-direct-g3 breaks the cell contract/);
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', 'greet-direct-g3.mjs')), false);
});

test('a grown/index.json row naming a file outside grown/cells is refused', () => {
  for (const file of ['../index.mjs', 'cells/../index.mjs', 'cells/sub/x.mjs', '/etc/x.mjs', 'https://x.test/c.mjs']) {
    const rows = [{ id: 'greet-direct-g3', class: 'greet', generation: 3, lane: 'direct', file }];
    const { root, dist } = fixture('row', { rows });
    assert.throws(() => generatePocket({ root, dist }), /not a file under grown\/cells/, file);
  }
});

test('a cell sibling it imports is copied with its sha256, and the tab imports it', async () => {
  const { root, dist } = fixture('sibling');
  generatePocket({ root, dist });
  const row = readJson(path.join(dist, 'organism', 'cells.json')).cells.find((r) => r.id === 'echo-direct-g3');
  assert.deepEqual(row.deps, [{ file: 'cells/echo-direct-g3-word.mjs', bytes: SIBLING.length, sha256: sha(SIBLING) }]);
  assert.equal(readFileSync(path.join(dist, 'organism', 'cells', 'echo-direct-g3-word.mjs'), 'utf8'), SIBLING);
  const router = await loadCells(dirUrl(path.join(dist, 'organism')), { fetch: fileFetch });
  assert.equal((await route(router, 'echo hi')).text, 'echoed: hi');
});

test('the manifest: Dilation, /ask/, standalone, the ask page CSS colours, one maskable SVG icon', () => {
  const { root, dist } = fixture('manifest', { bg: '#123456', acc: '#abcdef' });
  generatePocket({ root, dist });
  const m = readJson(path.join(dist, 'ask', 'manifest.webmanifest'));
  assert.equal(m.name, 'Dilation');
  assert.equal(m.short_name, 'Dilation');
  assert.equal(m.start_url, '/ask/');
  assert.equal(m.scope, '/ask/');
  assert.equal(m.display, 'standalone');
  assert.equal(m.background_color, '#123456');
  assert.equal(m.theme_color, '#123456');
  assert.equal(m.icons.length, 1);
  assert.equal(m.icons[0].src, 'icon.svg');
  assert.equal(m.icons[0].type, 'image/svg+xml');
  assert.ok(m.icons[0].purpose.split(' ').includes('maskable'));
  const icon = readFileSync(path.join(dist, 'ask', 'icon.svg'), 'utf8');
  assert.match(icon, /<rect width="512" height="512" fill="#123456"\/>/);
  assert.match(icon, /stroke="#abcdef"/);
  const real = readJson(path.join(REAL.dist, 'ask', 'manifest.webmanifest'));
  const page = readFileSync(path.join(REAL.dist, 'ask', 'index.html'), 'utf8');
  assert.ok(page.includes('background: ' + real.background_color), 'the real manifest takes its background from the real ask page');
  assert.deepEqual(askColors(page), { background: real.background_color, theme: real.theme_color, accent: askColors(page).accent });
  assert.throws(() => askColors('<html><body>no style</body></html>'), /no <style>/);
});

test('the icon glyph lies inside the maskable safe zone and the background bleeds to every edge', () => {
  const svg = iconSvg({ background: '#000000', accent: '#ffffff' });
  assert.match(svg, new RegExp('viewBox="0 0 ' + ICON_SIZE + ' ' + ICON_SIZE + '"'));
  assert.match(svg, new RegExp('<rect width="' + ICON_SIZE + '" height="' + ICON_SIZE + '" fill="#000000"/>'));
  const glyph = svg.slice(svg.indexOf('<g id="glyph"'), svg.indexOf('</g>'));
  const sw = Number(glyph.match(/stroke-width="(\d+)"/)[1]);
  const pts = [];
  for (const m of glyph.matchAll(/points="([^"]+)"/g)) for (const p of m[1].trim().split(/\s+/)) pts.push(p.split(',').map(Number));
  for (const m of glyph.matchAll(/x1="(\d+)" y1="(\d+)" x2="(\d+)" y2="(\d+)"/g)) pts.push([+m[1], +m[2]], [+m[3], +m[4]]);
  assert.ok(pts.length >= 5);
  const c = ICON_SIZE / 2;
  for (const [x, y] of pts) assert.ok(Math.hypot(x - c, y - c) + sw / 2 <= SAFE_RADIUS, x + ',' + y + ' leaves the safe zone');
});

test('the version is a sha256 over every precached file: the same files give the same worker, one changed cell another', () => {
  const { root, dist } = fixture('version');
  const a = generatePocket({ root, dist });
  const swA = readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8');
  const b = generatePocket({ root, dist });
  assert.equal(b.version, a.version);
  assert.equal(readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8'), swA);
  const f = path.join(root, 'grown', 'cells', 'sum-neo-g3.mjs');
  writeFileSync(f, readFileSync(f, 'utf8') + '// the next generation\n');
  const c = generatePocket({ root, dist });
  assert.notEqual(c.version, a.version);
  assert.match(c.version, /^[0-9a-f]{64}$/);
  const swC = readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8');
  assert.ok(swC.includes(JSON.stringify(c.version)) && !swC.includes(a.version));
  assert.equal(pocketVersion([{ url: '/a', sha256: 'x' }]), sha('/a x'));
});

test('an organism module whose bytes are not the sha256 of organism/manifest.json throws', () => {
  const { root, dist } = fixture('module');
  writeFileSync(path.join(dist, 'organism', 'act', 'x.mjs'), 'export const x = 2;\n');
  assert.throws(() => generatePocket({ root, dist }), /organism\/act\/x\.mjs is not the bytes/);
});

test('no ask page, no pocket: the build says what writes it first', () => {
  const dist = tmp('noask');
  assert.throws(() => generatePocket({ dist }), /no ask page at .*generateAsk/);
});

test('a cell of an older generation left in organism/cells is removed; its neighbours are not', () => {
  const { root, dist } = fixture('stale');
  mkdirSync(path.join(dist, 'organism', 'cells'), { recursive: true });
  writeFileSync(path.join(dist, 'organism', 'cells', 'old-direct-g1.mjs'), 'export const old = 1;\n');
  writeFileSync(path.join(dist, 'organism', 'cells', 'notes.txt'), 'kept\n');
  generatePocket({ root, dist });
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', 'old-direct-g1.mjs')), false);
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', 'notes.txt')), true);
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', 'sum-neo-g3.mjs')), true);
});

test('node web/pocket.mjs --dist <dir> prints { cells, bytes, precache, version } as one JSON line', () => {
  const dist = tmp('cli');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'web', 'pocket.mjs'), '--dist', dist], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split(/\r?\n/);
  assert.equal(lines.length, 1);
  const out = JSON.parse(lines[0]);
  assert.deepEqual(Object.keys(out).sort(), ['bytes', 'cells', 'precache', 'version']);
  assert.deepEqual(out, REAL.result, 'the command line and generatePocket agree');
  assert.equal(out.cells, REAL.index.cells.length);
  const bad = spawnSync(process.execPath, [path.join(ROOT, 'web', 'pocket.mjs'), '--bogus'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  assert.equal(bad.status, 2);
});

test('the head line and the register line name the files the build writes, under the scope', () => {
  assert.equal(START_URL, SCOPE);
  for (const href of [...POCKET_HEAD.matchAll(/href="([^"]+)"/g)].map((m) => m[1])) {
    assert.ok(href.startsWith(SCOPE));
    assert.ok(existsSync(path.join(REAL.dist, ...href.split('/').filter(Boolean))), href);
  }
  assert.match(REGISTER_SW, /register\('\/ask\/sw\.js', \{ scope: '\/ask\/' \}\)/);
  assert.ok(existsSync(path.join(REAL.dist, 'ask', 'sw.js')));
});

// ---------------------------------------------------------------- the service worker, in a vm

const ORIGIN = 'https://dilation.dev';

/** The bytes the server would answer for every precached url of a dist. */
function served(dist, urls) {
  return new Map(urls.map((u) => [u, readFileSync(u === '/ask/' ? path.join(dist, 'ask', 'index.html') : path.join(dist, ...u.split('/').filter(Boolean)))]));
}

/** Run a worker source with stubbed self, caches, fetch and clients; fire its events by hand. */
function worker(src, files) {
  const listeners = {};
  const store = new Map();
  const net = { online: true, files: new Map(files), calls: [], redirect: new Set() };
  const flags = { skipped: 0, claimed: 0, updates: 0 };
  const keyOf = (u) => new URL(typeof u === 'string' ? u : u.url, ORIGIN).href;
  const cacheOf = (name) => {
    if (!store.has(name)) store.set(name, new Map());
    const m = store.get(name);
    return { put: async (u, r) => { m.set(keyOf(u), r); }, match: async (u) => { const r = m.get(keyOf(u)); return r ? r.clone() : undefined; } };
  };
  const caches = { open: async (name) => cacheOf(name), keys: async () => [...store.keys()], delete: async (name) => store.delete(name), has: async (name) => store.has(name) };
  const fetchStub = async (u, init = {}) => {
    const p = new URL(typeof u === 'string' ? u : u.url, ORIGIN).pathname;
    net.calls.push({ path: p, init });
    if (!net.online) throw new TypeError('Failed to fetch');
    const b = net.files.get(p);
    if (!b) return new Response('not found', { status: 404 });
    const res = new Response(b, { status: 200, headers: { 'content-type': 'text/plain' } });
    if (net.redirect.has(p)) Object.defineProperty(res, 'redirected', { value: true });
    return res;
  };
  const self = {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    location: new URL('/ask/sw.js', ORIGIN),
    skipWaiting: async () => { flags.skipped++; },
    clients: { claim: async () => { flags.claimed++; } },
    registration: { update: async () => { flags.updates++; } },
  };
  const ctx = vm.createContext({ self, caches, fetch: fetchStub, crypto: globalThis.crypto, Response, URL, console });
  vm.runInContext(src, ctx, { filename: 'sw.js' });
  const fire = (type, extra = {}) => {
    const waits = [];
    let responded = null;
    listeners[type]({ ...extra, waitUntil: (p) => { waits.push(p); }, respondWith: (p) => { responded = p; } });
    return { done: Promise.all(waits), responded, waited: waits.length };
  };
  const value = (expr) => JSON.parse(JSON.stringify(vm.runInContext(expr, ctx)));
  const cached = (name, u) => store.get(name)?.get(new URL(u, ORIGIN).href);
  const get = (u, extra = {}) => fire('fetch', { request: { url: new URL(u, ORIGIN).href, method: 'GET', mode: 'cors', ...extra } });
  return { fire, get, store, net, flags, value, cached, cache: CACHE_PREFIX + value('VERSION') };
}

const urlsOf = (src) => worker(src, new Map()).value('PRECACHE').map((f) => f.url);
async function installed() {
  const urls = urlsOf(REAL.sw);
  const w = worker(REAL.sw, served(REAL.dist, urls));
  await w.fire('install').done;
  return w;
}
const bodyOf = async (res) => Buffer.from(await res.arrayBuffer());

test('install precaches every file it lists: the ask page, the organism modules, cells.json and every cell', async () => {
  const w = await installed();
  const om = readJson(path.join(REAL.dist, 'organism', 'manifest.json'));
  const want = ['/ask/', '/ask/manifest.webmanifest', '/ask/icon.svg', ...om.files.map((f) => '/organism/' + f.file), '/organism/cells.json',
    ...REAL.cells.cells.flatMap((r) => ['/organism/' + r.file, ...r.deps.map((d) => '/organism/' + d.file)])];
  const list = w.value('PRECACHE');
  assert.deepEqual(list.map((f) => f.url).sort(), [...want].sort());
  assert.equal(list.length, REAL.result.precache);
  assert.equal(w.value('VERSION'), REAL.result.version);
  for (const u of want) {
    const res = w.cached(w.cache, u);
    assert.ok(res, u + ' is in the cache');
    assert.ok((await bodyOf(res.clone())).equals(w.net.files.get(u)), u + ' is cached with the bytes the server sent');
  }
  assert.ok(w.net.calls.every((c) => c.init.cache === 'reload'), 'install fetches past the HTTP cache');
  assert.equal(w.flags.skipped, 1);
  assert.equal(REAL.result.bytes, [...w.net.files.values()].reduce((s, b) => s + b.length, 0));
});

test('a stale file (not the bytes of this version) fails the install and nothing is cached', async () => {
  const urls = urlsOf(REAL.sw);
  const files = served(REAL.dist, urls);
  files.set('/organism/cells.json', Buffer.from('{"cells":[]}\n'));
  const w = worker(REAL.sw, files);
  await assert.rejects(w.fire('install').done, /is not the file of version/);
  assert.equal(w.store.has(w.cache), false);
  assert.equal(w.flags.skipped, 0);
});

test('activate deletes an older version cache, keeps this version and every cache that is not the pocket', async () => {
  const w = await installed();
  w.store.set(CACHE_PREFIX + 'older', new Map([['x', new Response('old')]]));
  w.store.set('someone-else', new Map());
  await w.fire('activate').done;
  assert.deepEqual([...w.store.keys()].sort(), [w.cache, 'someone-else'].sort());
  assert.equal(w.flags.claimed, 1);
});

test('a GET of a precached file is served from the cache with the network down; /ask/?q=, /ask and /ask/index.html are the ask page', async () => {
  const w = await installed();
  w.net.online = false;
  const cell = '/organism/' + REAL.cells.cells[0].file;
  const e = w.get(cell);
  assert.ok(e.responded, 'the worker answered');
  assert.ok((await bodyOf(await e.responded)).equals(w.net.files.get(cell)));
  assert.deepEqual(await e.done, ['offline'], 'the background revalidate found no network and kept the entry');
  const nav = w.get('/ask/?q=hey', { mode: 'navigate' });
  assert.ok((await bodyOf(await nav.responded)).equals(w.net.files.get('/ask/')));
  await nav.done;
  for (const name of ['/ask', '/ask/index.html', '/ask/index.html?q=hey']) {
    const other = w.get(name, { mode: 'navigate' });
    assert.ok(other.responded, name + ' is answered by the worker');
    assert.ok((await bodyOf(await other.responded)).equals(w.net.files.get('/ask/')), name + ' is the cached ask page');
    await other.done;
  }
});

test('a POST is never intercepted or cached, /api/ is never intercepted, nor a page or an origin that is not the pocket', async () => {
  const w = await installed();
  const before = [...w.store.get(w.cache).keys()];
  for (const req of [
    { url: ORIGIN + '/api/ask', method: 'POST' },
    { url: ORIGIN + '/organism/cells.json', method: 'POST' },
    { url: ORIGIN + '/api/ask', method: 'GET' },
    { url: ORIGIN + '/ladder/', method: 'GET', mode: 'navigate' },
    { url: 'https://elsewhere.test/organism/cells.json', method: 'GET' },
  ]) {
    const e = w.fire('fetch', { request: req });
    assert.equal(e.responded, null, req.method + ' ' + req.url + ' goes to the network untouched');
    assert.equal(e.waited, 0);
  }
  assert.deepEqual([...w.store.get(w.cache).keys()], before, 'nothing was cached');
});

test('the /api/ door holds even for a list that names a file under /api/', async () => {
  const src = swSource({ version: 'v1', precache: [{ url: '/api/ask', sha256: sha('x') }, { url: '/ask/', sha256: sha('page') }] });
  const w = worker(src, new Map([['/api/ask', Buffer.from('x')], ['/ask/', Buffer.from('page')]]));
  await w.fire('install').done;
  assert.equal(w.get('/api/ask').responded, null);
  assert.ok(w.get('/ask/').responded);
});

test('revalidate: the same bytes refresh the entry; other bytes are a newer generation, never mixed in, and ask for the update', async () => {
  const w = await installed();
  const cell = '/organism/' + REAL.cells.cells[1].file;
  const calls = w.net.calls.length;
  const e = w.get(cell);
  await e.responded;
  assert.deepEqual(await e.done, ['fresh']);
  assert.equal(w.net.calls.length, calls + 1);
  assert.equal(w.net.calls.at(-1).init.cache, 'no-cache');
  const old = w.net.files.get(cell);
  w.net.files.set(cell, Buffer.concat([old, Buffer.from('\n// the next generation\n')]));
  const n = w.get(cell);
  assert.ok((await bodyOf(await n.responded)).equals(old), 'cache first: this version is what is served');
  assert.deepEqual(await n.done, ['newer']);
  assert.equal(w.flags.updates, 1);
  assert.ok((await bodyOf(w.cached(w.cache, cell).clone())).equals(old), 'the newer bytes did not enter this version cache');
});

test('a precached file missing from the cache is fetched, checked, cached and served', async () => {
  const w = await installed();
  const u = '/organism/cells.json';
  w.store.get(w.cache).delete(new URL(u, ORIGIN).href);
  const e = w.get(u);
  assert.ok((await bodyOf(await e.responded)).equals(w.net.files.get(u)));
  assert.deepEqual(await e.done, ['filled']);
  assert.ok(w.cached(w.cache, u));
});

test('a redirected answer for /ask/ (the host 308s it) is cached as a plain response a navigation may use', async () => {
  const urls = urlsOf(REAL.sw);
  const w = worker(REAL.sw, served(REAL.dist, urls));
  w.net.redirect.add('/ask/');
  await w.fire('install').done;
  const res = w.cached(w.cache, '/ask/');
  assert.equal(res.redirected, false);
  assert.ok((await bodyOf(res.clone())).equals(w.net.files.get('/ask/')));
});

// ---------------------------------------------------------------- the tab router

test('the tab routes every dev prompt to the same cell with the same text as the server (grownAnswer)', async (t) => {
  const router = await loadCells(dirUrl(path.join(REAL.dist, 'organism')), { fetch: fileFetch });
  const devDir = path.join(ROOT, 'judge', 'dev');
  const rows = readdirSync(devDir).filter((f) => f.endsWith('.jsonl')).sort()
    .flatMap((f) => readFileSync(path.join(devDir, f), 'utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l)));
  let same = 0, byCell = 0;
  for (const r of rows) {
    const s = grownAnswer(r.q);
    const tab = await route(router, r.q);
    assert.deepEqual(tab ? { cell: tab.cell, class: tab.class, text: tab.text } : null, s ? { cell: s.id, class: s.class, text: s.answer } : null, r.q);
    if (tab) { byCell++; assert.ok(Number.isFinite(tab.ms) && tab.ms >= 0); }
    same++;
  }
  assert.ok(rows.length > 0);
  assert.ok(byCell > 0, 'at least one dev prompt reaches a grown cell, or the comparison proves nothing');
  t.diagnostic('dev prompts routed identically by the tab and the server: ' + same + ' of ' + rows.length + ' (' + byCell + ' by a grown cell, ' + (same - byCell) + ' by none on both)');
});

test('a NEO colony row (tier "neo") ships and routes exactly as the server renderer routes it', async () => {
  const { root, dist } = fixture('neo');
  generatePocket({ root, dist });
  const cells = readJson(path.join(dist, 'organism', 'cells.json')).cells;
  assert.deepEqual(cells.map((r) => [r.id, r.tier]), [['greet-direct-g3', null], ['echo-direct-g3', null], ['sum-neo-g3', 'neo']]);
  const server = await import(pathToFileURL(path.join(root, 'grown', 'index.mjs')).href);
  const router = await loadCells(dirUrl(path.join(dist, 'organism')), { fetch: fileFetch });
  assert.equal(router.rows.find((r) => r.id === 'sum-neo-g3').tier, 'neo');
  for (const q of ['hello there', 'sum of 2 and 3', 'echo hi', 'sum of x and y', 'nothing carries this', '']) {
    const s = server.grownAnswer(q);
    const tab = await route(router, q);
    assert.deepEqual(tab ? { cell: tab.cell, class: tab.class, text: tab.text } : null, s ? { cell: s.id, class: s.class, text: s.answer } : null, q);
  }
  assert.equal((await route(router, 'sum of 2 and 3')).cell, 'sum-neo-g3');
});

const mod = (id, can, answer) => ({ meta: { id, class: id.split('-')[0] }, can, answer });
async function memRouter(mods, { importer = null, ...o } = {}) {
  const index = { generation: 3, cells: mods.map((m) => ({ id: m.meta.id, class: m.meta.class, generation: 3, file: 'cells/' + m.meta.id + '.mjs' })) };
  const imported = [];
  const imp = importer || (async (url) => { const id = url.split('/').pop().replace(/\.mjs$/, ''); imported.push(id); return mods.find((m) => m.meta.id === id); });
  const router = await loadCells('https://pocket.test/organism/', { fetch: async () => new Response(JSON.stringify(index)), importer: imp, ...o });
  return { router, imported };
}

test('lazy: no cell is imported until a prompt reaches it, and each is imported once', async () => {
  const mods = ['aa-x', 'bb-x', 'cc-x'].map((id) => mod(id, (q) => q === id, (q) => 'answer ' + q));
  const { router, imported } = await memRouter(mods);
  assert.deepEqual(imported, []);
  assert.equal((await route(router, 'aa-x')).cell, 'aa-x');
  assert.deepEqual(imported, ['aa-x']);
  assert.equal((await route(router, 'cc-x')).text, 'answer cc-x');
  assert.deepEqual(imported, ['aa-x', 'bb-x', 'cc-x']);
  await route(router, 'bb-x');
  await route(router, 'none');
  assert.deepEqual(imported, ['aa-x', 'bb-x', 'cc-x']);
  assert.equal(await route(router, 'none'), null);
});

test('can must be exactly true, as on the server: a truthy can that is not true is a no', async () => {
  const { router } = await memRouter([mod('aa-x', () => 'yes', () => 'wrong'), mod('bb-x', () => 1, () => 'wrong'), mod('cc-x', () => true, () => 'right')]);
  assert.equal((await route(router, 'q')).cell, 'cc-x');
});

test('a cell that throws, or answers nothing, is a null and the walk goes on', async () => {
  const { router } = await memRouter([
    mod('aa-x', () => { throw new Error('can broke'); }, () => 'wrong'),
    mod('bb-x', () => true, () => { throw new Error('answer broke'); }),
    mod('cc-x', () => true, () => '   '),
    mod('dd-x', () => true, () => 42),
    mod('ee-x', () => true, () => 'right'),
  ]);
  assert.deepEqual(await route(router, 'q').then((r) => [r.cell, r.text]), ['ee-x', 'right']);
});

const spin = (ms) => { const t = Date.now(); while (Date.now() - t < ms) { /* a slow synchronous cell */ } };

test('a cell slower than the budget is a null, the next cell answers', async () => {
  const { router } = await memRouter([mod('aa-x', () => true, () => { spin(80); return 'late'; }), mod('bb-x', () => true, () => 'on time')], { budgetMs: 40 });
  assert.equal((await route(router, 'q')).cell, 'bb-x');
});

test('the budget is 1500 ms: a cell that takes 1600 ms is a null, one that takes 20 ms answers', async () => {
  assert.equal(BUDGET_MS, 1500);
  const { router } = await memRouter([mod('aa-x', (q) => q === 'slow', () => { spin(1600); return 'late'; }), mod('bb-x', (q) => q === 'quick', () => { spin(20); return 'on time'; })]);
  assert.equal(router.budgetMs, 1500);
  assert.equal(await route(router, 'slow'), null);
  assert.equal((await route(router, 'quick')).text, 'on time');
});

test('an import that never settles is a null at the budget, never a hang', { timeout: 5000 }, async () => {
  const fast = mod('bb-x', () => true, () => 'answered');
  const importer = (url) => (url.endsWith('/aa-x.mjs') ? new Promise(() => {}) : Promise.resolve(fast));
  const { router } = await memRouter([mod('aa-x', () => true, () => 'never'), fast], { importer, budgetMs: 50 });
  const t0 = Date.now();
  assert.equal((await route(router, 'q')).cell, 'bb-x');
  assert.ok(Date.now() - t0 < 1000);
});

test('a failed import is a null for that prompt and is tried again on the next', async () => {
  let tries = 0;
  const good = mod('aa-x', () => true, () => 'back');
  const importer = async () => { tries++; if (tries === 1) throw new Error('offline'); return good; };
  const { router } = await memRouter([good], { importer });
  assert.equal(await route(router, 'q'), null);
  assert.equal((await route(router, 'q')).text, 'back');
  assert.equal(tries, 2);
});

test('cells.json is data: a row naming a file outside <base>/cells/ is refused before anything is imported', async () => {
  for (const file of ['https://evil.test/cells/x.mjs', '../act/x.mjs', 'cells/../../x.mjs', '/organism/cells/x.mjs', 'cells/sub/x.mjs', '//evil.test/cells/x.mjs']) {
    let imported = 0;
    const index = { cells: [{ id: 'aa-x', class: 'aa', file }] };
    await assert.rejects(loadCells('https://pocket.test/organism/', { fetch: async () => new Response(JSON.stringify(index)), importer: async () => { imported++; return {}; } }), /not a file under cells/, file);
    assert.equal(imported, 0);
  }
});

test('browser safe: the router and the worker carry nothing of node and no static import; the router passes the web/ask.mjs copy gate', () => {
  const tab = readFileSync(path.join(ROOT, 'act', 'cells-tab.mjs'), 'utf8');
  for (const [src, what] of [[tab, 'act/cells-tab.mjs'], [REAL.sw, 'ask/sw.js']]) {
    assert.doesNotMatch(src, /\bfrom\s*['"]node:|\bprocess\b|\bBuffer\b|\brequire\b|\bimportScripts\b/, what);
    assert.doesNotMatch(src, /^\s*import\s[^'"]*?from\s*['"]/m, what + ' has no static import');
  }
  assert.doesNotMatch(tab, /\bfrom\s*['"]node:|\brequire\(|\bprocess\.|\bfetch\(/, 'act/cells-tab.mjs passes the gate of web/ask.mjs copyOrganism, so it can join MODULES');
});

test('askTab: a cell answers with no network; a miss is POSTed once to /api/ask; with no network it prints the offline line', async () => {
  const { router } = await memRouter([mod('aa-x', (q) => q === 'carried', () => 'from the pocket')]);
  const posts = [];
  const net = async (url, init) => { posts.push({ url, init }); return new Response(JSON.stringify({ text: 'from the server' }), { status: 200 }); };
  const down = async () => { throw new TypeError('Failed to fetch'); };
  const hit = await askTab(router, 'carried', { fetch: down });
  assert.deepEqual([hit.from, hit.cell, hit.text], ['cell', 'aa-x', 'from the pocket']);
  const miss = await askTab(router, 'not carried', { fetch: net });
  assert.deepEqual([miss.from, miss.status, miss.json], ['server', 200, { text: 'from the server' }]);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].url, API);
  assert.equal(posts[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(posts[0].init.body), { prompt: 'not carried' });
  const off = await askTab(router, 'not carried', { fetch: down });
  assert.deepEqual([off.from, off.line], ['offline', OFFLINE_LINE]);
  const known = await askTab(router, 'not carried', { fetch: net, online: false });
  assert.deepEqual([known.from, known.line], ['offline', OFFLINE_LINE]);
  assert.equal(posts.length, 1, 'a tab that knows it is offline does not try');
});
