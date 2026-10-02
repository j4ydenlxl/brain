// test/web-pocket.test.mjs: THE POCKET (web/pocket.mjs) and its router (act/cells-tab.mjs). Offline: the network is
// a stub, the service worker runs in a node vm with stubbed self, caches, fetch and clients; every temp directory
// is removed. Nothing here reads the tree's grown/ or neo/: every build runs on a FIXTURE tree written below (its
// grown/index.mjs rendered by grow/store.mjs renderIndexMjs, the server's own renderer), so the suite holds whatever
// the organism grows next. THE GATE (contract c2) is proved at the build and in the tab with an unmastered colony.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import {
  generatePocket, askColors, iconSvg, swSource, pocketVersion, planCore, planTasks, shipsRow, webManifest, parseArgs, ROOT, CACHE_PREFIX,
  SAFE_RADIUS, ICON_SIZE, START_URL, SCOPE, SW_URL, SW_SCOPE, POCKET_HEAD, REGISTER_SW, NO_CORE, TASK_FILE_CAP, ERA_CAP,
} from '../web/pocket.mjs';
import { loadCells, route, askTab, serves, BUDGET_MS, OFFLINE_LINE, API, MAX_TEMPLATES } from '../act/cells-tab.mjs';
import { generateAsk } from '../web/ask.mjs';
import { renderIndexMjs } from '../grow/store.mjs';
import * as CORE from '../grow/neo-core.mjs';

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
const fits = (t, q) => CORE.fitsTemplates(t, q);
/** Every file under a directory, as [relative path with /, bytes]. */
function filesUnder(dir, pre = '') {
  const out = [];
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name), rel = pre ? pre + '/' + name : name;
    if (statSync(abs).isDirectory()) out.push(...filesUnder(abs, rel));
    else out.push([rel, readFileSync(abs)]);
  }
  return out;
}

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

// Two locked cells (one with a sibling), two NEO colonies that serve (shout's can is always true: only its template
// keeps it from every prompt), and an UNMASTERED colony (serve false, held-out 0.5) whose can is always true too.
const FIXTURE_CELLS = {
  'greet-direct-g3': cellSrc({ id: 'greet-direct-g3', cls: 'greet', can: 'return q.startsWith("hello");', answer: 'return "hello from a grown cell";' }),
  'echo-direct-g3': cellSrc({ id: 'echo-direct-g3', cls: 'echo', head: "import { WORD } from './echo-direct-g3-word.mjs';", can: 'return q.startsWith("echo ");', answer: 'return WORD + ": " + q.slice(5);' }),
  'shout-neo-g3': cellSrc({ id: 'shout-neo-g3', cls: 'shout-word', lane: 'neo', can: 'return true;', answer: 'const w = String(q).trim().split(" ").pop(); return w ? w.toUpperCase() : null;', tail: 'export const colony = { cells: 1, kernel: 1 };' }),
  'reverse-neo-g3': cellSrc({ id: 'reverse-neo-g3', cls: 'reverse-word', lane: 'neo', can: 'return q.startsWith("reverse the word ");', answer: 'return q.slice(17).split("").reverse().join("");', tail: 'export const colony = { cells: 1, kernel: 1 };' }),
  'sum-neo-g3': cellSrc({ id: 'sum-neo-g3', cls: 'sum', lane: 'neo', can: 'return true;', answer: 'return "from the unmastered colony";', tail: 'export const colony = { cells: 2, kernel: 1 };' }),
};
const SIBLING = "export const WORD = 'echoed';\n";
const neoRow = (id, task, o) => ({ id, class: task, generation: 3, lane: 'neo', tier: 'neo', task, file: 'cells/' + id + '.mjs', promotedAt: 'x', ...o });
const ROWS = [
  { id: 'greet-direct-g3', class: 'greet', generation: 3, lane: 'direct', file: 'cells/greet-direct-g3.mjs', heldout: { score: 1, n: 4 }, promotedAt: 'x' },
  { id: 'echo-direct-g3', class: 'echo', generation: 3, lane: 'direct', file: 'cells/echo-direct-g3.mjs', heldout: { score: 1, n: 4 }, promotedAt: 'x' },
  neoRow('shout-neo-g3', 'shout-word', { serve: true, templates: ['shout the word {1-3}'], heldout: { score: 1, n: 4, ok: 4 } }),
  neoRow('reverse-neo-g3', 'reverse-word', { serve: true, templates: ['reverse the word {1-3}'], heldout: { score: 1, n: 4, ok: 4 } }),
  neoRow('sum-neo-g3', 'sum', { serve: false, templates: ['sum of {#1-2} and {#1-2}'], heldout: { score: 0.5, n: 4, ok: 2 } }),
];
const SILENT = 'sum-neo-g3';
const MARKER = 'HELDOUT-ONLY-ROW-7f3a';
const W = ['apple', 'river', 'stone', 'cloud', 'tiger', 'lemon', 'piano', 'candle'];
const devOf = (f) => W.map((w) => { const a = f(w); return { q: a[0], expect: { equals: a[1] }, answer: a[1] }; });
const TASKS = {
  'shout-word': devOf((w) => ['shout the word ' + w, w.toUpperCase()]),
  'reverse-word': devOf((w) => ['reverse the word ' + w, w.split('').reverse().join('')]),
  sum: W.map((w, i) => ({ q: 'sum of ' + i + ' and ' + (i + 2), expect: { equals: String(2 * i + 2) }, answer: String(2 * i + 2) })),
  'count-letters': devOf((w) => ['how many letters in ' + w, String(w.length)]),
  tiny: devOf((w) => ['tiny ' + w, w]).slice(0, 3),
};

/** A tree: grow/ (the core, unless core is false or a text), grown/ (cells, index.json, index.mjs) and neo/tasks/. */
function fixtureRoot(root, { cells = FIXTURE_CELLS, rows = ROWS, core = true, tasks = TASKS, heldoutDir = false } = {}) {
  const grown = path.join(root, 'grown');
  mkdirSync(path.join(grown, 'cells'), { recursive: true });
  for (const [id, src] of Object.entries(cells)) writeFileSync(path.join(grown, 'cells', id + '.mjs'), src);
  writeFileSync(path.join(grown, 'cells', 'echo-direct-g3-word.mjs'), SIBLING);
  const index = { generation: 3, cells: rows };
  writeFileSync(path.join(grown, 'index.json'), JSON.stringify(index, null, 2));
  writeFileSync(path.join(grown, 'index.mjs'), renderIndexMjs(index));
  mkdirSync(path.join(root, 'grow'), { recursive: true });
  if (core === true) for (const f of ['neo-core.mjs', 'neo-kernel.mjs']) copyFileSync(path.join(ROOT, 'grow', f), path.join(root, 'grow', f));
  else if (typeof core === 'string') { writeFileSync(path.join(root, 'grow', 'neo-core.mjs'), core); copyFileSync(path.join(ROOT, 'grow', 'neo-kernel.mjs'), path.join(root, 'grow', 'neo-kernel.mjs')); }
  for (const [task, dev] of Object.entries(tasks)) {
    const d = path.join(root, 'neo', 'tasks', task);
    mkdirSync(d, { recursive: true });
    writeFileSync(path.join(d, 'task.json'), JSON.stringify({ task, skill: 'fixture', domain: 'words' }));
    writeFileSync(path.join(d, 'dev.jsonl'), dev.map((r) => JSON.stringify(r)).join('\n') + '\n');
    // a held-out file: never opened by the build (a directory when heldoutDir, so a read of it would throw)
    if (heldoutDir) mkdirSync(path.join(d, 'heldout.jsonl'));
    else writeFileSync(path.join(d, 'heldout.jsonl'), JSON.stringify({ q: MARKER + ' ' + task, expect: { equals: MARKER }, answer: MARKER }) + '\n');
  }
  mkdirSync(path.join(root, 'neo', 'tasks', 'no-dev'), { recursive: true });
  writeFileSync(path.join(root, 'neo', 'tasks', 'no-dev', 'task.json'), '{}');
  return root;
}

function fixture(tag, o = {}) {
  const base = tmp(tag);
  const root = fixtureRoot(path.join(base, 'root'), o);
  const dist = fixtureDist(path.join(base, 'dist'), o);
  return { root, dist };
}

// ---------------------------------------------------------------- the build of the fixture tree, once (the real page)

const REAL = {};
before(() => {
  REAL.root = fixtureRoot(path.join(tmp('real'), 'root'));
  REAL.dist = tmp('real-dist');
  REAL.result = generateAsk(REAL.dist, { root: REAL.root }).pocket;
  REAL.index = readJson(path.join(REAL.root, 'grown', 'index.json'));
  REAL.cells = readJson(path.join(REAL.dist, 'organism', 'cells.json'));
  REAL.sw = readFileSync(path.join(REAL.dist, 'ask', 'sw.js'), 'utf8');
  REAL.tasks = readJson(path.join(REAL.dist, 'organism', 'era', 'tasks.json'));
});

// ---------------------------------------------------------------- the pocket build

test('every shipping cell of grown/index.json is copied byte for byte, and cells.json carries its sha256 in index order', () => {
  const ships = REAL.index.cells.filter((r) => r.id !== SILENT);
  assert.equal(REAL.result.cells, ships.length);
  assert.deepEqual(REAL.cells.cells.map((r) => r.id), ships.map((r) => r.id));
  for (const row of REAL.cells.cells) {
    const src = readFileSync(path.join(REAL.root, 'grown', ...row.file.split('/')));
    const copy = readFileSync(path.join(REAL.dist, 'organism', ...row.file.split('/')));
    assert.ok(copy.equals(src), row.id + ' is a byte copy');
    assert.equal(row.sha256, sha(src), row.id + ' carries the sha256 of its source');
    assert.equal(row.bytes, src.length);
  }
  assert.equal(REAL.cells.generation, REAL.index.generation);
  // a NEO row carries its task, serve true and its templates (the tab asks it only on a fit); a locked row none of them
  const shout = REAL.cells.cells.find((r) => r.id === 'shout-neo-g3');
  assert.deepEqual([shout.tier, shout.task, shout.serve, shout.templates], ['neo', 'shout-word', true, ['shout the word {1-3}']]);
  const greet = REAL.cells.cells.find((r) => r.id === 'greet-direct-g3');
  assert.deepEqual(['task', 'serve', 'templates'].filter((k) => k in greet), []);
});

test('THE GATE at the build: an unmastered colony is neither copied nor listed nor precached; with no core no NEO row ships', () => {
  assert.equal(existsSync(path.join(REAL.dist, 'organism', 'cells', SILENT + '.mjs')), false, 'the unmastered colony was copied');
  assert.ok(!REAL.cells.cells.some((r) => r.id === SILENT), 'the unmastered colony is in cells.json');
  assert.ok(!REAL.sw.includes(SILENT), 'the service worker names the unmastered colony');
  assert.equal(REAL.result.era.silent, 1);
  // the same tree with no search core: the locked cells ship, no NEO row does, and the body says why
  const { root, dist } = fixture('nocore', { core: false });
  const r = generatePocket({ root, dist });
  const cells = readJson(path.join(dist, 'organism', 'cells.json')).cells;
  assert.deepEqual(cells.map((x) => x.id), ['greet-direct-g3', 'echo-direct-g3']);
  assert.equal(r.era.core, false);
  assert.equal(r.era.silent, 3);
  assert.equal(r.era.why, NO_CORE + ': grow/neo-core.mjs does not exist');
  const list = readJson(path.join(dist, 'organism', 'era', 'tasks.json'));
  assert.deepEqual([list.core, list.why], [null, r.era.why]);
  assert.equal(existsSync(path.join(dist, 'organism', 'grow')), false, 'no core file was written');
  for (const id of ['shout-neo-g3', 'reverse-neo-g3', SILENT]) assert.equal(existsSync(path.join(dist, 'organism', 'cells', id + '.mjs')), false, id);
  // a core that holds a node: import is not the browser's core: NO_CORE, and the same gate
  const n = fixture('nodecore', { core: "import fs from 'node:fs';\nexport const x = fs;\n" });
  const rn = generatePocket(n);
  assert.equal(rn.era.core, false);
  assert.equal(rn.era.why, NO_CORE + ': grow/neo-core.mjs still holds a node: import or a require');
  assert.deepEqual(readJson(path.join(n.dist, 'organism', 'cells.json')).cells.map((x) => x.id), ['greet-direct-g3', 'echo-direct-g3']);
  // a core importing anything but its kernel is refused too
  const o = fixture('othercore', { core: "import { x } from './elsewhere.mjs';\nexport const y = x;\n" });
  assert.equal(planCore(o.root).why, NO_CORE + ': grow/neo-core.mjs imports ./elsewhere.mjs');
  assert.equal(planCore(REAL.root).ok, true);
  assert.equal(REAL.result.era.core, true);
});

test('shipsRow: a locked row ships; a NEO row only when it serves AND the core is published AND the rule is the core', () => {
  const serving = ROWS.find((r) => r.id === 'reverse-neo-g3');
  assert.equal(shipsRow(ROWS[0], false), true);
  assert.equal(shipsRow(serving, true), true);
  assert.equal(shipsRow(serving, false), false);
  assert.equal(shipsRow(serving, true, null), false);
  assert.equal(shipsRow(ROWS.find((r) => r.id === SILENT), true), false);
  assert.equal(shipsRow({ ...serving, serve: 'true' }, true), false);
  assert.equal(shipsRow({ ...serving, templates: [] }, true), false);
  assert.equal(shipsRow({ ...serving, templates: ['no slot here'] }, true), false);
  assert.equal(shipsRow({ ...serving, templates: Array.from({ length: 33 }, () => 'reverse the word {1-3}') }, true), false);
  assert.equal(shipsRow(null, true), true, 'no row is not a NEO row');
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

test('the manifest: Dilation, id, start_url and scope /ask (the path the host serves), standalone, the page colours, one maskable icon', () => {
  const { root, dist } = fixture('manifest', { bg: '#123456', acc: '#abcdef' });
  generatePocket({ root, dist });
  const m = readJson(path.join(dist, 'ask', 'manifest.webmanifest'));
  assert.equal(m.name, 'Dilation');
  assert.equal(m.short_name, 'Dilation');
  assert.deepEqual([m.id, m.start_url, m.scope], [START_URL, START_URL, SCOPE]);
  assert.equal(START_URL, '/ask');
  assert.equal(m.display, 'standalone');
  assert.equal(m.background_color, '#123456');
  assert.equal(m.theme_color, '#123456');
  assert.equal(m.icons.length, 1);
  assert.equal(m.icons[0].src, 'icon.svg');
  assert.equal(m.icons[0].type, 'image/svg+xml');
  assert.ok(m.icons[0].purpose.split(' ').includes('maskable'));
  // the published rules: start_url within scope; the page the host serves (/ask, vercel.json trailingSlash false) is
  // inside the navigation scope AND inside the service worker's scope, so the worker controls the installed app
  const within = (u, scope) => new URL(u, 'https://d.test').pathname.startsWith(new URL(scope, 'https://d.test').pathname);
  assert.ok(within(m.start_url, m.scope));
  assert.ok(within('/ask', SW_SCOPE) && within('/organism/web/pocket-era.mjs', SW_SCOPE));
  assert.ok(within('/ask?q=hey', m.scope));
  assert.ok(!within('/ask', '/ask/'), 'the old scope /ask/ does not hold the page at /ask (the defect this fixes)');
  const vercel = readJson(path.join(ROOT, 'vercel.json'));
  assert.deepEqual([vercel.cleanUrls, vercel.trailingSlash], [true, false], 'the host serves /ask, not /ask/');
  const h = vercel.headers.find((x) => x.source === SW_URL);
  assert.ok(h, 'vercel.json sends headers for ' + SW_URL);
  assert.deepEqual(h.headers.find((x) => x.key === 'Service-Worker-Allowed'), { key: 'Service-Worker-Allowed', value: SW_SCOPE }, 'the published way to widen a worker scope past its own path');
  assert.ok(vercel.functions && vercel.functions['api/ask.mjs'], 'the function entry is kept');
  const icon = readFileSync(path.join(dist, 'ask', 'icon.svg'), 'utf8');
  assert.match(icon, /<rect width="512" height="512" fill="#123456"\/>/);
  assert.match(icon, /stroke="#abcdef"/);
  const real = readJson(path.join(REAL.dist, 'ask', 'manifest.webmanifest'));
  const page = readFileSync(path.join(REAL.dist, 'ask', 'index.html'), 'utf8');
  assert.ok(page.includes('background: ' + real.background_color), 'the real manifest takes its background from the real ask page');
  assert.deepEqual(askColors(page), { background: real.background_color, theme: real.theme_color, accent: askColors(page).accent });
  assert.equal(webManifest({ background: '#000', theme: '#111' }).start_url, START_URL);
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

test('the version is a sha256 over every listed file: the same files give the same worker; a changed cell or task file another; a silent colony none', () => {
  const { root, dist } = fixture('version');
  const a = generatePocket({ root, dist });
  const swA = readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8');
  const b = generatePocket({ root, dist });
  assert.equal(b.version, a.version);
  assert.equal(readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8'), swA);
  const quiet = path.join(root, 'grown', 'cells', SILENT + '.mjs');
  writeFileSync(quiet, readFileSync(quiet, 'utf8') + '// a newer unmastered colony\n');
  assert.equal(generatePocket({ root, dist }).version, a.version, 'a colony that does not ship does not move the version');
  const f = path.join(root, 'grown', 'cells', 'reverse-neo-g3.mjs');
  writeFileSync(f, readFileSync(f, 'utf8') + '// the next generation\n');
  const c = generatePocket({ root, dist });
  assert.notEqual(c.version, a.version);
  assert.match(c.version, /^[0-9a-f]{64}$/);
  const swC = readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8');
  assert.ok(swC.includes(JSON.stringify(c.version)) && !swC.includes(a.version));
  const dev = path.join(root, 'neo', 'tasks', 'count-letters', 'dev.jsonl');
  writeFileSync(dev, readFileSync(dev, 'utf8') + JSON.stringify({ q: 'how many letters in rose', expect: { equals: '4' }, answer: '4' }) + '\n');
  assert.notEqual(generatePocket({ root, dist }).version, c.version, 'a task file is listed (lazy), so a new dev row is a new worker');
  assert.equal(pocketVersion([{ url: '/a', sha256: 'x' }]), sha('/a x'));
  assert.equal(pocketVersion([{ url: '/a', sha256: 'x' }], [{ url: '/b', sha256: 'y' }]), sha('/a x\n/b y'));
});

test('an organism module whose bytes are not the sha256 of organism/manifest.json throws', () => {
  const { root, dist } = fixture('module');
  writeFileSync(path.join(dist, 'organism', 'act', 'x.mjs'), 'export const x = 2;\n');
  assert.throws(() => generatePocket({ root, dist }), /organism\/act\/x\.mjs is not the bytes/);
});

test('no ask page, no pocket: the build says what writes it first', () => {
  const dist = tmp('noask');
  assert.throws(() => generatePocket({ root: REAL.root, dist }), /no ask page at .*generateAsk/);
});

test('a cell, a core file or a task file of an older build left in dist is removed; its neighbours are not', () => {
  const { root, dist } = fixture('stale');
  mkdirSync(path.join(dist, 'organism', 'cells'), { recursive: true });
  writeFileSync(path.join(dist, 'organism', 'cells', 'old-direct-g1.mjs'), 'export const old = 1;\n');
  writeFileSync(path.join(dist, 'organism', 'cells', SILENT + '.mjs'), 'export const old = 1;\n');
  writeFileSync(path.join(dist, 'organism', 'cells', 'notes.txt'), 'kept\n');
  mkdirSync(path.join(dist, 'organism', 'era', 'tasks'), { recursive: true });
  writeFileSync(path.join(dist, 'organism', 'era', 'tasks', 'gone.json'), '{}');
  generatePocket({ root, dist });
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', 'old-direct-g1.mjs')), false);
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', SILENT + '.mjs')), false, 'an older build of an unmastered colony is removed');
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', 'notes.txt')), true);
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', 'reverse-neo-g3.mjs')), true);
  assert.equal(existsSync(path.join(dist, 'organism', 'era', 'tasks', 'gone.json')), false);
  // the core is gone from the tree: its old copies are removed with it
  rmSync(path.join(root, 'grow', 'neo-core.mjs'));
  generatePocket({ root, dist });
  assert.deepEqual(readdirSync(path.join(dist, 'organism', 'grow')), []);
});

test('node web/pocket.mjs --dist <dir> --root <tree> prints { cells, bytes, precache, version, lazy, lazyBytes, era } as one JSON line', () => {
  const dist = tmp('cli');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'web', 'pocket.mjs'), '--dist', dist, '--root', REAL.root], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split(/\r?\n/);
  assert.equal(lines.length, 1);
  const out = JSON.parse(lines[0]);
  assert.deepEqual(Object.keys(out).sort(), ['bytes', 'cells', 'era', 'lazy', 'lazyBytes', 'precache', 'version']);
  assert.deepEqual(out, REAL.result, 'the command line and generateAsk agree');
  const bad = spawnSync(process.execPath, [path.join(ROOT, 'web', 'pocket.mjs'), '--bogus'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  assert.equal(bad.status, 2);
  assert.deepEqual(parseArgs(['--dist']), { usage: '--dist needs a directory' });
  assert.deepEqual(parseArgs(['-h']), { help: true });
});

test('the head line and the register line name the files the build writes; the worker scope / holds the page and the body', () => {
  assert.equal(START_URL, SCOPE);
  assert.equal(SW_SCOPE, '/');
  for (const href of [...POCKET_HEAD.matchAll(/href="([^"]+)"/g)].map((m) => m[1])) {
    assert.ok(href.startsWith(SCOPE + '/'));
    assert.ok(existsSync(path.join(REAL.dist, ...href.split('/').filter(Boolean))), href);
  }
  assert.match(REGISTER_SW, /register\('\/ask\/sw\.js', \{ scope: '\/' \}\)/);
  assert.ok(existsSync(path.join(REAL.dist, 'ask', 'sw.js')));
});

// ---------------------------------------------------------------- the body's files

test('the body ships: the core and the kernel byte for byte, the body module, tasks.json, and one dev-row file per unmastered task', () => {
  for (const [url, src] of [['/organism/grow/neo-core.mjs', path.join(REAL.root, 'grow', 'neo-core.mjs')], ['/organism/grow/neo-kernel.mjs', path.join(REAL.root, 'grow', 'neo-kernel.mjs')], ['/organism/web/pocket-era.mjs', path.join(ROOT, 'web', 'pocket-era.mjs')]]) {
    const copy = readFileSync(path.join(REAL.dist, ...url.split('/').filter(Boolean)));
    assert.ok(copy.equals(readFileSync(src)), url + ' is a byte copy');
    assert.ok(REAL.sw.includes(JSON.stringify({ url, sha256: sha(copy) })), url + ' is precached with its sha256');
  }
  const by = Object.fromEntries(REAL.tasks.tasks.map((t) => [t.task, t]));
  assert.deepEqual(Object.keys(by).sort(), ['count-letters', 'reverse-word', 'shout-word', 'sum']);
  assert.deepEqual([by['shout-word'].mastered, by['shout-word'].file, by['reverse-word'].mastered, by['reverse-word'].file], [true, null, true, null], 'a task the cloud serves is the cloud\'s: no file');
  assert.deepEqual([by.sum.mastered, by.sum.file], [false, 'tasks/sum.json'], 'the unmastered colony\'s task is the body\'s to grow');
  assert.deepEqual(REAL.tasks.left.map((l) => l.task + ': ' + l.why).sort(), ['no-dev: no dev.jsonl', 'tiny: 3 dev rows, under 4']);
  assert.equal(REAL.tasks.core, 'grow/neo-core.mjs');
  const file = readJson(path.join(REAL.dist, 'organism', 'era', 'tasks', 'count-letters.json'));
  assert.equal(file.task, 'count-letters');
  assert.deepEqual(file.rows, TASKS['count-letters'], 'the dev rows, { q, expect, answer } each, in file order');
  assert.equal(by['count-letters'].sha256, sha(readFileSync(path.join(REAL.dist, 'organism', 'era', 'tasks', 'count-letters.json'))));
  // the lazy list: every task file with its sha256, never in the precache
  const lazy = worker(REAL.sw, new Map()).value('LAZY').map((f) => f.url).sort();
  assert.deepEqual(lazy, ['/organism/era/tasks/count-letters.json', '/organism/era/tasks/sum.json']);
  assert.deepEqual([REAL.result.lazy, REAL.result.era.tasks, REAL.result.era.mastered, REAL.result.era.left], [2, 2, 2, 2]);
  assert.deepEqual(REAL.result.era.files.map((f) => f.url), ['/organism/grow/neo-core.mjs', '/organism/grow/neo-kernel.mjs', '/organism/web/pocket-era.mjs', '/organism/era/tasks.json', ...lazy]);
  for (const f of REAL.result.era.files) assert.equal(f.bytes, readFileSync(path.join(REAL.dist, ...f.url.split('/').filter(Boolean))).length, f.url);
});

test('a held-out row never reaches the phone: no file the build writes holds one, and the build never opens a heldout.jsonl', () => {
  for (const [rel, bytes] of filesUnder(REAL.dist)) assert.ok(!bytes.includes(MARKER), rel + ' holds a held-out row');
  // every heldout.jsonl a directory: a build that read one would throw
  const { root, dist } = fixture('heldout', { heldoutDir: true });
  const r = generatePocket({ root, dist });
  assert.equal(r.era.tasks, 2);
  assert.equal(statSync(path.join(root, 'neo', 'tasks', 'sum', 'heldout.jsonl')).isDirectory(), true);
  assert.deepEqual(filesUnder(path.join(dist, 'organism', 'era')).map(([rel]) => rel).sort(), ['tasks.json', 'tasks/count-letters.json', 'tasks/sum.json']);
});

test('the task file caps: one file over TASK_FILE_CAP, or all of them past ERA_CAP, is left out with its reason', () => {
  assert.deepEqual([TASK_FILE_CAP, ERA_CAP], [65536, 4194304]);
  const small = planTasks(REAL.root, { taskCap: 200 });
  assert.deepEqual(small.tasks.filter((t) => t.file).map((t) => t.task), []);
  assert.ok(small.left.some((l) => l.task === 'count-letters' && /bytes, over the task file cap 200$/.test(l.why)), JSON.stringify(small.left));
  const one = readFileSync(path.join(REAL.dist, 'organism', 'era', 'tasks', 'count-letters.json')).length;
  const era = planTasks(REAL.root, { eraCap: one });
  assert.deepEqual(era.tasks.filter((t) => t.file).map((t) => t.task), ['count-letters']);
  assert.deepEqual(era.left.find((l) => l.task === 'sum'), { task: 'sum', why: 'past the cap ' + one + ' on every task file together' });
  // a dev row that is not a row is dropped; a tree with no neo/tasks has no task
  const { root } = fixture('rows', { tasks: { mixed: [...TASKS['count-letters'], { q: '', expect: { equals: 'x' } }, { q: 'no expect' }, { prompt: 'how many letters in rose', expect: { equals: '4' }, reply: '4' }] } });
  const m = planTasks(root);
  const rows = JSON.parse(m.files.get('tasks/mixed.json').toString('utf8')).rows;
  assert.equal(rows.length, TASKS['count-letters'].length + 1);
  assert.deepEqual(rows.at(-1), { q: 'how many letters in rose', expect: { equals: '4' }, answer: '4' });
  assert.deepEqual(planTasks(tmp('empty')), { tasks: [], left: [], files: new Map() });
});

// ---------------------------------------------------------------- the service worker, in a vm

const ORIGIN = 'https://dilation.dev';

/** The bytes the server would answer for every listed url of a dist (/ask is the page, as the host serves it). */
function served(dist, urls) {
  return new Map(urls.map((u) => [u, readFileSync(u === '/ask' ? path.join(dist, 'ask', 'index.html') : path.join(dist, ...u.split('/').filter(Boolean)))]));
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
    location: new URL(SW_URL, ORIGIN),
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

const listOf = (src, name) => worker(src, new Map()).value(name).map((f) => f.url);
async function installed() {
  const urls = listOf(REAL.sw, 'PRECACHE').concat(listOf(REAL.sw, 'LAZY'));
  const w = worker(REAL.sw, served(REAL.dist, urls));
  await w.fire('install').done;
  return w;
}
const bodyOf = async (res) => Buffer.from(await res.arrayBuffer());

test('install precaches every file it lists: the page at /ask, the organism modules, cells.json, every cell, the core, the body and tasks.json', async () => {
  const w = await installed();
  const om = readJson(path.join(REAL.dist, 'organism', 'manifest.json'));
  const want = ['/ask', '/ask/manifest.webmanifest', '/ask/icon.svg', ...om.files.map((f) => '/organism/' + f.file), '/organism/cells.json',
    ...REAL.cells.cells.flatMap((r) => ['/organism/' + r.file, ...r.deps.map((d) => '/organism/' + d.file)]),
    '/organism/grow/neo-core.mjs', '/organism/grow/neo-kernel.mjs', '/organism/web/pocket-era.mjs', '/organism/era/tasks.json'];
  const list = w.value('PRECACHE');
  assert.deepEqual(list.map((f) => f.url).sort(), [...want].sort());
  assert.equal(list.length, REAL.result.precache);
  assert.equal(w.value('VERSION'), REAL.result.version);
  for (const u of want) {
    const res = w.cached(w.cache, u);
    assert.ok(res, u + ' is in the cache');
    assert.ok((await bodyOf(res.clone())).equals(w.net.files.get(u)), u + ' is cached with the bytes the server sent');
  }
  for (const u of listOf(REAL.sw, 'LAZY')) assert.equal(w.cached(w.cache, u), undefined, u + ' is lazy: not fetched at install');
  assert.ok(w.net.calls.every((c) => c.init.cache === 'reload'), 'install fetches past the HTTP cache');
  assert.equal(w.net.calls.length, want.length);
  assert.equal(w.flags.skipped, 1);
  assert.equal(REAL.result.bytes, want.reduce((s, u) => s + w.net.files.get(u).length, 0));
});

test('a lazy task file is fetched on first need, checked, cached and then served with the network down; other bytes are never cached', async () => {
  const w = await installed();
  const u = '/organism/era/tasks/count-letters.json';
  const first = w.get(u);
  assert.ok((await bodyOf(await first.responded)).equals(w.net.files.get(u)));
  assert.deepEqual(await first.done, ['filled']);
  assert.ok(w.cached(w.cache, u));
  w.net.online = false;
  const again = w.get(u);
  assert.ok((await bodyOf(await again.responded)).equals(readFileSync(path.join(REAL.dist, ...u.split('/').filter(Boolean)))));
  assert.deepEqual(await again.done, ['offline']);
  // a task file that is not this version's bytes: served (the network said so) but never cached, and the update asked
  w.net.online = true;
  const v = '/organism/era/tasks/sum.json';
  w.net.files.set(v, Buffer.from('{"task":"sum","rows":[]}\n'));
  const odd = w.get(v);
  await odd.responded;
  assert.deepEqual(await odd.done, ['newer']);
  assert.equal(w.cached(w.cache, v), undefined);
  assert.equal(w.flags.updates, 1);
});

test('a stale file (not the bytes of this version) fails the install and nothing is cached', async () => {
  const files = served(REAL.dist, listOf(REAL.sw, 'PRECACHE'));
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

test('a GET of a precached file is served from the cache with the network down; /ask?q=, /ask/ and /ask/index.html are the ask page', async () => {
  const w = await installed();
  w.net.online = false;
  const cell = '/organism/' + REAL.cells.cells[0].file;
  const e = w.get(cell);
  assert.ok(e.responded, 'the worker answered');
  assert.ok((await bodyOf(await e.responded)).equals(w.net.files.get(cell)));
  assert.deepEqual(await e.done, ['offline'], 'the background revalidate found no network and kept the entry');
  for (const name of ['/ask', '/ask?q=hey', '/ask/', '/ask/index.html', '/ask/index.html?q=hey']) {
    const other = w.get(name, { mode: 'navigate' });
    assert.ok(other.responded, name + ' is answered by the worker');
    assert.ok((await bodyOf(await other.responded)).equals(w.net.files.get('/ask')), name + ' is the cached ask page');
    await other.done;
  }
  // the body's own files, the way its worker asks for them
  for (const u of ['/organism/web/pocket-era.mjs', '/organism/grow/neo-core.mjs', '/organism/era/tasks.json']) assert.ok((await bodyOf(await w.get(u).responded)).equals(w.net.files.get(u)), u);
});

test('a POST is never intercepted or cached, /api/ is never intercepted, nor a page or an origin that is not the pocket', async () => {
  const w = await installed();
  const before = [...w.store.get(w.cache).keys()];
  for (const req of [
    { url: ORIGIN + '/api/ask', method: 'POST' },
    { url: ORIGIN + '/organism/cells.json', method: 'POST' },
    { url: ORIGIN + '/api/ask', method: 'GET' },
    { url: ORIGIN + '/ladder/', method: 'GET', mode: 'navigate' },
    { url: ORIGIN + '/organism/cells/' + SILENT + '.mjs', method: 'GET' },
    { url: 'https://elsewhere.test/organism/cells.json', method: 'GET' },
  ]) {
    const e = w.fire('fetch', { request: req });
    assert.equal(e.responded, null, req.method + ' ' + req.url + ' goes to the network untouched');
    assert.equal(e.waited, 0);
  }
  assert.deepEqual([...w.store.get(w.cache).keys()], before, 'nothing was cached');
});

test('the /api/ door holds even for a list that names a file under /api/', async () => {
  const src = swSource({ version: 'v1', precache: [{ url: '/api/ask', sha256: sha('x') }, { url: '/ask', sha256: sha('page') }] });
  const w = worker(src, new Map([['/api/ask', Buffer.from('x')], ['/ask', Buffer.from('page')]]));
  await w.fire('install').done;
  assert.equal(w.get('/api/ask').responded, null);
  assert.ok(w.get('/ask').responded);
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

test('a redirected answer for /ask is cached as a plain response a navigation may use', async () => {
  const w = worker(REAL.sw, served(REAL.dist, listOf(REAL.sw, 'PRECACHE')));
  w.net.redirect.add('/ask');
  await w.fire('install').done;
  const res = w.cached(w.cache, '/ask');
  assert.equal(res.redirected, false);
  assert.ok((await bodyOf(res.clone())).equals(w.net.files.get('/ask')));
});

// ---------------------------------------------------------------- the tab router

/** A router over the fixture build, its imports recorded (a file import, as the origin would serve the copy). */
async function realRouter(o = {}) {
  const imported = [];
  const importer = (url) => { imported.push(url.split('/').pop().replace(/\.mjs$/, '')); return import(url); };
  const router = await loadCells(dirUrl(path.join(REAL.dist, 'organism')), { fetch: fileFetch, importer, ...o });
  return { router, imported };
}
const PROMPTS = ['hello there', 'echo hi', 'reverse the word apple', 'Reverse the word: Apple!', 'shout the word stone', 'sum of 2 and 3',
  'reverse the word a b c d e', 'what is the capital of mars', 'nothing carries this', '', 'shout', 'reverse the word'];

test('the tab routes every prompt to the same cell with the same text as the server (the fixture grown/index.mjs, THE GATE inside)', async (t) => {
  const server = await import(pathToFileURL(path.join(REAL.root, 'grown', 'index.mjs')).href);
  assert.ok(server.GATE, 'the server index carries THE GATE');
  const { router } = await realRouter({ fits });
  let byCell = 0;
  for (const q of PROMPTS) {
    const s = server.grownAnswer(q);
    const tab = await route(router, q);
    assert.deepEqual(tab ? { cell: tab.cell, class: tab.class, text: tab.text } : null, s ? { cell: s.id, class: s.class, text: s.answer } : null, q);
    if (tab) { byCell++; assert.ok(Number.isFinite(tab.ms) && tab.ms >= 0); }
  }
  assert.equal((await route(router, 'reverse the word apple')).text, 'elppa');
  assert.equal((await route(router, 'shout the word stone')).text, 'STONE');
  t.diagnostic('fixture prompts routed identically by the tab and the server: ' + PROMPTS.length + ' (' + byCell + ' by a grown cell)');
});

test('THE GATE in the tab: the unmastered colony is never imported or asked; a colony is asked only on an exact template fit', async () => {
  const { router, imported } = await realRouter({ fits });
  assert.deepEqual(router.rows.map((r) => r.id), ['greet-direct-g3', 'echo-direct-g3', 'shout-neo-g3', 'reverse-neo-g3']);
  // shout's can is true for every prompt: only its template keeps it from answering "reverse the word apple"
  assert.equal((await route(router, 'reverse the word apple')).cell, 'reverse-neo-g3');
  assert.ok(!imported.includes('shout-neo-g3'), 'a colony whose template does not fit was imported');
  assert.equal(await route(router, 'sum of 2 and 3'), null, 'the unmastered colony answered');
  assert.equal(await route(router, 'what is the capital of mars'), null);
  assert.ok(!imported.includes(SILENT));
  // no fits (a page whose core did not load): no colony is ever asked, the locked cells still are
  const bare = await realRouter();
  assert.equal(await route(bare.router, 'reverse the word apple'), null);
  assert.equal(await route(bare.router, 'shout the word stone'), null);
  assert.equal((await route(bare.router, 'hello there')).cell, 'greet-direct-g3');
  assert.deepEqual(bare.imported, ['greet-direct-g3', 'echo-direct-g3'], 'only the locked cells were imported');
  // a fits that says anything but exactly true, throws, or does not answer within the budget is a closed gate
  for (const bad of [() => 'true', () => 1, () => { throw new Error('no core'); }, () => new Promise(() => {}), async () => false]) {
    const r = await realRouter({ fits: bad, budgetMs: 30 });
    assert.equal(await route(r.router, 'reverse the word apple'), null);
    assert.ok(!r.imported.some((id) => id.includes('-neo-')), r.imported.join(','));
  }
  const yes = await realRouter({ fits: async () => true });
  assert.equal((await route(yes.router, 'shout the word stone')).cell, 'shout-neo-g3', 'an async exact true opens it');
});

test('cells.json is data too: a NEO row that does not serve is dropped at load and never imported, whatever its can says', async () => {
  const always = (id) => ({ meta: { id, class: 'x' }, can: () => true, answer: () => 'from ' + id });
  const rows = [
    { id: 'quiet-neo-g1', class: 'x', tier: 'neo', serve: false, templates: ['say the word {1-3}'], file: 'cells/quiet-neo-g1.mjs' },
    { id: 'string-neo-g1', class: 'x', tier: 'neo', serve: 'true', templates: ['say the word {1-3}'], file: 'cells/string-neo-g1.mjs' },
    { id: 'empty-neo-g1', class: 'x', tier: 'neo', serve: true, templates: [], file: 'cells/empty-neo-g1.mjs' },
    { id: 'many-neo-g1', class: 'x', tier: 'neo', serve: true, templates: Array.from({ length: MAX_TEMPLATES + 1 }, () => 'say the word {1-3}'), file: 'cells/many-neo-g1.mjs' },
    { id: 'nolist-neo-g1', class: 'x', tier: 'neo', serve: true, file: 'cells/nolist-neo-g1.mjs' },
    { id: 'open-neo-g1', class: 'x', tier: 'neo', serve: true, templates: ['say the word {1-3}'], file: 'cells/open-neo-g1.mjs' },
  ];
  const imported = [];
  const router = await loadCells('https://pocket.test/organism/', { fetch: async () => new Response(JSON.stringify({ generation: 1, cells: rows })), importer: async (u) => { const id = u.split('/').pop().replace(/\.mjs$/, ''); imported.push(id); return always(id); }, fits });
  assert.deepEqual(router.rows.map((r) => r.id), ['open-neo-g1']);
  assert.deepEqual(router.rows[0].templates, ['say the word {1-3}']);
  assert.equal(await route(router, 'something else'), null);
  assert.deepEqual(imported, []);
  assert.equal((await route(router, 'say the word hi')).cell, 'open-neo-g1');
  assert.deepEqual(imported, ['open-neo-g1']);
  assert.equal(MAX_TEMPLATES, 32);
  assert.equal(serves({ serve: true, templates: ['a {1-2}'] }), true);
  for (const r of [null, {}, { serve: true }, { serve: true, templates: [''] }, { serve: true, templates: [7] }, { serve: true, templates: ['x'.repeat(401)] }]) assert.equal(serves(r), false, JSON.stringify(r));
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

test('browser safe: the router, the worker and the body carry nothing of node and no static import; the router passes the web/ask.mjs copy gate', () => {
  const tab = readFileSync(path.join(ROOT, 'act', 'cells-tab.mjs'), 'utf8');
  const body = readFileSync(path.join(ROOT, 'web', 'pocket-era.mjs'), 'utf8');
  for (const [src, what] of [[tab, 'act/cells-tab.mjs'], [REAL.sw, 'ask/sw.js'], [body, 'web/pocket-era.mjs']]) {
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
