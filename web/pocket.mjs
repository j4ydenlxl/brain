// web/pocket.mjs: THE POCKET BODY. What lets the organism live on a phone and answer with its own grown cells with
// no network.
//
// His words, 2026-10-01: "All native btw, its ai data center in ur pocket, none of that ollama crap", "Should work
// exactly like llms fronteir level" and "The whole point is a new way of ai, an ai datacenter in the cloud and in the
// pocket that works exactly like fronteir ai + the features i told u"; 2026-09-26: "it should be cli in dilation.dev
// someday so i can prompt like any ai".
//
// generatePocket({ root, dist }) writes, under dist (web/dist by default):
//   organism/cells/<file>      a byte copy of every live cell of grown/index.json (and of every ./ sibling a cell
//                              imports), each re-read and checked against the sha256 of its source, or the build throws;
//                              a cell whose source breaks the contract (grow/contract.mjs validateCell) is refused.
//   organism/cells.json        the index rows act/cells-tab.mjs routes by, in index order, with the sha256 of each copy.
//   ask/manifest.webmanifest   name and short_name Dilation, start_url and scope /ask/, display standalone, theme and
//                              background colours taken from the ask page's own CSS, one maskable SVG icon:
//   ask/icon.svg               full bleed, its glyph inside the maskable safe zone (a centred circle, radius 40%).
//   ask/sw.js                  the service worker. VERSION is a sha256 over every file it precaches (url and sha256 of
//                              each), so a new generation's cells are a new worker whose activate deletes the old cache.
//                              It precaches the ask page, the organism modules of organism/manifest.json, cells.json and
//                              the cells, each fetched past the HTTP cache and checked against its sha256 (a stale copy
//                              fails the install, never enters the cache); serves them cache first with a background
//                              revalidate (the same bytes refresh the entry; other bytes mean a newer generation is
//                              deployed: they are not mixed into this version's cache, the worker asks for its update);
//                              and NEVER intercepts or caches a POST or anything under /api/, so a prompt the tab misses
//                              still reaches the server when there is a network (act/cells-tab.mjs askTab prints the
//                              offline line when there is none).
// It returns { cells, bytes, precache, version }: the cells copied, the bytes the phone holds offline (the sum over the
// precached files), the count of precached files, the version. It reads <dist>/ask/index.html and
// <dist>/organism/manifest.json, which web/ask.mjs generateAsk() writes first; it edits neither.
//
// Run: node web/pocket.mjs [--dist <dir>] [--root <dir>]   prints the result as one JSON line (a dist with no ask page
// gets one from web/ask.mjs generateAsk first). No model call anywhere; zero dependencies; Node 22 and 24.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateCell, FORBIDDEN, ID_RE } from '../grow/contract.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NAME = 'Dilation';
export const START_URL = '/ask/';
export const SCOPE = '/ask/';
export const CACHE_PREFIX = 'dilation-pocket-';
export const ICON_SIZE = 512;
export const SAFE_RADIUS = ICON_SIZE * 0.4;
// What the ask page needs in its head and its module script to become the installed app (the next stage wires them).
export const POCKET_HEAD = '<link rel="manifest" href="/ask/manifest.webmanifest"><link rel="icon" href="/ask/icon.svg" type="image/svg+xml">';
export const REGISTER_SW = "if ('serviceWorker' in navigator) navigator.serviceWorker.register('/ask/sw.js', { scope: '/ask/' }).catch(() => {});";

const CELL_FILE_RE = /^cells\/[A-Za-z0-9][A-Za-z0-9._-]*\.mjs$/;
const ORGANISM_FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/;
const COLOR = '(#[0-9a-fA-F]{3,8}\\b|rgba?\\([^)]*\\)|hsla?\\([^)]*\\))';
const IMPORT_RES = [
  /^\s*import\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/gm,
  /^\s*export\s+(?:\*(?:\s+as\s+[A-Za-z_$][\w$]*)?|\{[^}]*\})\s*from\s+['"]([^'"]+)['"]/gm,
];

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const fail = (m) => { throw new Error('web/pocket.mjs: ' + m); };
const defaultCopy = (src, dst) => copyFileSync(src, dst);

// ---------------------------------------------------------------- the colours, the icon, the manifest

/** The ask page's own colours: body's background (the theme and the splash) and its accent (the icon's glyph). */
export function askColors(html) {
  const css = [...String(html).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  if (!css.trim()) fail('the ask page carries no <style>, so there is no colour to take');
  let background = null, ink = null;
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!m[1].split(',').map((s) => s.trim()).includes('body')) continue;
    const decls = ';' + m[2];
    const bg = decls.match(new RegExp(';\\s*background(?:-color)?\\s*:\\s*' + COLOR));
    const fg = decls.match(new RegExp(';\\s*color\\s*:\\s*' + COLOR));
    if (bg && !background) background = bg[1];
    if (fg && !ink) ink = fg[1];
  }
  if (!background) fail('the ask page CSS gives body no background colour');
  const acc = css.match(new RegExp('--acc\\s*:\\s*' + COLOR));
  const accent = acc ? acc[1] : ink;
  if (!accent) fail('the ask page CSS names no accent (--acc) and no body colour for the icon');
  return { background, theme: background, accent };
}

/** The maskable icon: a full bleed square of the page's background, the prompt glyph in its accent, inside the safe zone. */
export function iconSvg({ background, accent }) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + ICON_SIZE + ' ' + ICON_SIZE + '" width="' + ICON_SIZE + '" height="' + ICON_SIZE + '">',
    '<rect width="' + ICON_SIZE + '" height="' + ICON_SIZE + '" fill="' + background + '"/>',
    '<g id="glyph" fill="none" stroke="' + accent + '" stroke-width="30" stroke-linecap="round" stroke-linejoin="round">',
    '<polyline points="170,180 256,256 170,332"/>',
    '<line x1="282" y1="332" x2="350" y2="332"/>',
    '</g>',
    '</svg>',
    '',
  ].join('\n');
}

/** The web app manifest of /ask/. */
export function webManifest({ background, theme }) {
  return {
    id: START_URL,
    name: NAME,
    short_name: NAME,
    description: 'The organism in your pocket: its grown cells answer in this tab with no network and no model; a prompt they do not carry goes to the organism on the server.',
    lang: 'en',
    start_url: START_URL,
    scope: SCOPE,
    display: 'standalone',
    background_color: background,
    theme_color: theme,
    icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  };
}

// ---------------------------------------------------------------- the cells

/** The ./ siblings a cell file imports, as cells/<name>; anything else is refused (a cell imports only files beside it). */
function depsOf(text, rel) {
  const out = [];
  for (const re of IMPORT_RES) for (const m of text.matchAll(re)) {
    const spec = m[1];
    const name = spec.startsWith('./') ? spec.slice(2) : '';
    if (!name || name.includes('/') || name.includes('..')) fail(rel + ' imports "' + spec + '": a cell may import only a file beside it');
    out.push('cells/' + name);
  }
  return out;
}

/**
 * The live cells of <root>/grown/index.json, read and checked, in index order, with every file they bring.
 * @returns {{ generation: number|null, rows: object[], files: Map<string, { src: string, bytes: Uint8Array }> }}
 */
export function planCells(root = ROOT) {
  const grownDir = path.join(root, 'grown');
  const indexFile = path.join(grownDir, 'index.json');
  if (!existsSync(indexFile)) fail('no grown index at ' + indexFile);
  let index;
  try { index = JSON.parse(readFileSync(indexFile, 'utf8')); } catch (e) { fail(indexFile + ' is not JSON: ' + e.message); }
  if (!index || !Array.isArray(index.cells)) fail(indexFile + ' is not { generation, cells: [..] }');
  const files = new Map();
  const read = (rel, who) => {
    if (!CELL_FILE_RE.test(rel)) fail(who + ' names ' + JSON.stringify(rel) + ', not a file under grown/cells/');
    const src = path.join(grownDir, ...rel.split('/'));
    if (!existsSync(src)) fail(who + ': grown/' + rel + ' does not exist');
    return { src, bytes: readFileSync(src) };
  };
  const ids = new Set();
  const rows = index.cells.map((r, i) => {
    const id = String(r?.id ?? '');
    if (!ID_RE.test(id)) fail('grown/index.json row ' + i + ' has no cell id');
    if (ids.has(id)) fail('grown/index.json lists ' + id + ' twice');
    ids.add(id);
    const file = String(r.file ?? '');
    const cell = read(file, id);
    const source = cell.bytes.toString('utf8');
    const v = validateCell(source);
    if (!v.ok) fail(id + ' breaks the cell contract (grow/contract.mjs): ' + v.errors.join('; '));
    files.set(file, cell);
    const deps = [];
    const queue = depsOf(source, file);
    while (queue.length) {
      const dep = queue.shift();
      if (dep === file || deps.some((d) => d.file === dep)) continue;
      const got = read(dep, id);
      const text = got.bytes.toString('utf8');
      for (const [re, what] of FORBIDDEN) if (re.test(text)) fail(id + ': its sibling ' + dep + ' uses ' + what);
      files.set(dep, got);
      deps.push({ file: dep, bytes: got.bytes.length, sha256: sha256(got.bytes) });
      queue.push(...depsOf(text, dep));
    }
    return {
      id,
      class: typeof r.class === 'string' ? r.class : null,
      generation: Number.isInteger(r.generation) ? r.generation : null,
      lane: typeof r.lane === 'string' ? r.lane : null,
      tier: typeof r.tier === 'string' ? r.tier : null,
      file,
      bytes: cell.bytes.length,
      sha256: sha256(cell.bytes),
      deps,
    };
  });
  return { generation: Number.isInteger(index.generation) ? index.generation : null, rows, files };
}

/** Copy one file, read the copy back, and throw unless its sha256 is the source's. */
function copyChecked(src, dst, bytes, copy, what) {
  mkdirSync(path.dirname(dst), { recursive: true });
  copy(src, dst);
  const want = sha256(bytes), got = sha256(readFileSync(dst));
  if (got !== want) fail('the copy of ' + what + ' differs from its source (sha256 ' + got.slice(0, 12) + ', the source ' + want.slice(0, 12) + ')');
  return got;
}

// ---------------------------------------------------------------- the service worker

/** The version: a sha256 over every precached file (its url and the sha256 of its bytes), in precache order. */
export function pocketVersion(precache) {
  return sha256(precache.map((f) => f.url + ' ' + f.sha256).join('\n'));
}

/** The source of ask/sw.js for a version and its precache list ([{ url, sha256 }]). A classic worker script. */
export function swSource({ version, precache }) {
  const list = '[\n' + precache.map((f) => '  ' + JSON.stringify({ url: f.url, sha256: f.sha256 })).join(',\n') + '\n]';
  return `// sw.js: THE POCKET, the service worker of /ask/. GENERATED by web/pocket.mjs; do not edit by hand.
// Cache first with a background revalidate for exactly the files below, each checked against its sha256; a POST and
// anything under /api/ are never intercepted and never cached; activate deletes every older version's cache.
'use strict';
const VERSION = ${JSON.stringify(version)};
const PREFIX = ${JSON.stringify(CACHE_PREFIX)};
const CACHE = PREFIX + VERSION;
const PRECACHE = ${list};
const BY_URL = new Map(PRECACHE.map((f) => [f.url, f]));

function hex(buf) { return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join(''); }
async function shaOf(res) { return hex(await crypto.subtle.digest('SHA-256', await res.clone().arrayBuffer())); }
// A response the cache may hold and serve to a navigation: a redirected one (the host may answer /ask/ with a 308)
// is copied into a plain response first.
async function clean(res) {
  if (!res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}
// The network's copy of a precached file, past the HTTP cache, and whether it is this version's bytes.
async function checked(f, mode) {
  const res = await fetch(f.url, { cache: mode, credentials: 'same-origin' });
  if (!res || !res.ok) throw new Error('pocket: ' + f.url + ' answered ' + (res ? res.status : 'nothing'));
  const same = (await shaOf(res)) === f.sha256;
  return { res: await clean(res), same };
}
async function update() {
  try { if (self.registration && typeof self.registration.update === 'function') await self.registration.update(); } catch (err) { return; }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const got = await Promise.all(PRECACHE.map((f) => checked(f, 'reload')));
    got.forEach((g, i) => { if (!g.same) throw new Error('pocket: ' + PRECACHE[i].url + ' is not the file of version ' + VERSION); });
    const cache = await caches.open(CACHE);
    for (let i = 0; i < PRECACHE.length; i++) await cache.put(PRECACHE[i].url, got[i].res);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    if (self.clients && typeof self.clients.claim === 'function') await self.clients.claim();
  })());
});

// The ask page is one file whatever the query (/ask/?q=...) and whichever name the host gives it.
function keyOf(pathname) { return pathname === '/ask' || pathname === '/ask/index.html' ? '/ask/' : pathname; }

async function revalidate(f) {
  try {
    const { res, same } = await checked(f, 'no-cache');
    if (!same) { await update(); return 'newer'; }
    const cache = await caches.open(CACHE);
    await cache.put(f.url, res);
    return 'fresh';
  } catch (err) {
    return 'offline';
  }
}

async function serve(f) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(f.url);
  if (hit) return { res: hit, done: revalidate(f) };
  const { res, same } = await checked(f, 'no-cache');
  if (!same) { await update(); return { res, done: Promise.resolve('newer') }; }
  await cache.put(f.url, res.clone());
  return { res, done: Promise.resolve('filled') };
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return;
  const f = BY_URL.get(keyOf(url.pathname));
  if (!f) return;
  const p = serve(f);
  event.respondWith(p.then((x) => x.res));
  event.waitUntil(p.then((x) => x.done, () => 'missed'));
});
`;
}

// ---------------------------------------------------------------- the build

/**
 * Write the pocket under dist: the cells, cells.json, the manifest, the icon and the service worker.
 * @param {{ root?: string, dist?: string, copy?: (src: string, dst: string) => void }} o copy is the file copier (tests inject one)
 * @returns {{ cells: number, bytes: number, precache: number, version: string }}
 */
export function generatePocket({ root = ROOT, dist = path.join(root, 'web', 'dist'), copy = defaultCopy } = {}) {
  const askDir = path.join(dist, 'ask');
  const askFile = path.join(askDir, 'index.html');
  if (!existsSync(askFile)) fail('no ask page at ' + askFile + ': web/ask.mjs generateAsk() writes it first');
  const askBytes = readFileSync(askFile);
  const colors = askColors(askBytes.toString('utf8'));
  const organism = path.join(dist, 'organism');
  const omFile = path.join(organism, 'manifest.json');
  if (!existsSync(omFile)) fail('no organism manifest at ' + omFile + ': web/ask.mjs generateAsk() writes it first');
  let om;
  try { om = JSON.parse(readFileSync(omFile, 'utf8')); } catch (e) { fail(omFile + ' is not JSON: ' + e.message); }
  if (!om || !Array.isArray(om.files)) fail(omFile + ' is not { files: [..] }');

  const precache = [];
  const add = (url, bytes) => precache.push({ url, bytes: bytes.length, sha256: sha256(bytes) });
  add(START_URL, askBytes);
  const manifestBytes = Buffer.from(JSON.stringify(webManifest(colors), null, 2) + '\n', 'utf8');
  writeFileSync(path.join(askDir, 'manifest.webmanifest'), manifestBytes);
  add('/ask/manifest.webmanifest', manifestBytes);
  const iconBytes = Buffer.from(iconSvg(colors), 'utf8');
  writeFileSync(path.join(askDir, 'icon.svg'), iconBytes);
  add('/ask/icon.svg', iconBytes);
  for (const f of om.files) {
    const rel = String(f?.file ?? '');
    if (!ORGANISM_FILE_RE.test(rel) || rel.split('/').includes('..') || rel === 'cells.json' || rel.startsWith('cells/')) fail('organism/manifest.json names ' + JSON.stringify(rel) + ', not an organism module');
    const abs = path.join(organism, ...rel.split('/'));
    if (!existsSync(abs)) fail('organism/' + rel + ' is in organism/manifest.json but not in ' + organism);
    const b = readFileSync(abs);
    if (sha256(b) !== f.sha256) fail('organism/' + rel + ' is not the bytes organism/manifest.json names');
    add('/organism/' + rel, b);
  }

  const plan = planCells(root);
  const cellsDir = path.join(organism, 'cells');
  mkdirSync(cellsDir, { recursive: true });
  const keep = new Set([...plan.files.keys()].map((rel) => rel.slice('cells/'.length)));
  for (const name of readdirSync(cellsDir)) if (/\.mjs$/.test(name) && !keep.has(name)) rmSync(path.join(cellsDir, name), { force: true });
  for (const [rel, { src, bytes }] of plan.files) copyChecked(src, path.join(organism, ...rel.split('/')), bytes, copy, 'grown/' + rel);
  const index = {
    what: 'the grown cells this tab answers with, copied byte for byte from grown/ by web/pocket.mjs; act/cells-tab.mjs routes them in this order, the order of grown/index.json',
    generation: plan.generation,
    cells: plan.rows,
  };
  const indexBytes = Buffer.from(JSON.stringify(index, null, 2) + '\n', 'utf8');
  writeFileSync(path.join(organism, 'cells.json'), indexBytes);
  add('/organism/cells.json', indexBytes);
  for (const [rel, { bytes }] of plan.files) add('/organism/' + rel, bytes);

  const version = pocketVersion(precache);
  writeFileSync(path.join(askDir, 'sw.js'), swSource({ version, precache }));
  return { cells: plan.rows.length, bytes: precache.reduce((s, f) => s + f.bytes, 0), precache: precache.length, version };
}

// ---------------------------------------------------------------- the command line

const USAGE = 'usage: node web/pocket.mjs [--dist <dir>] [--root <dir>]   writes the pocket under dist (web/dist) and prints { cells, bytes, precache, version }';

export function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') return { help: true };
    if (a === '--dist' || a === '--root') {
      const v = argv[++i];
      if (!v || v.startsWith('--')) return { usage: a + ' needs a directory' };
      o[a.slice(2)] = path.resolve(v);
      continue;
    }
    return { usage: 'unknown argument ' + a };
  }
  return o;
}

export async function main(argv = process.argv.slice(2)) {
  const o = parseArgs(argv);
  if (o.help || o.usage) return o;
  const root = o.root || ROOT;
  const dist = o.dist || path.join(root, 'web', 'dist');
  if (!existsSync(path.join(dist, 'ask', 'index.html'))) {
    const { generateAsk } = await import('./ask.mjs');
    generateAsk(dist);
  }
  return generatePocket({ root, dist });
}

const self = fileURLToPath(import.meta.url);
const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invoked && (process.platform === 'win32' ? invoked.toLowerCase() === self.toLowerCase() : invoked === self)) {
  main().then(
    (out) => {
      if (out.help) { console.log(USAGE); return; }
      if (out.usage) { process.stderr.write('pocket: ' + out.usage + '\n' + USAGE + '\n'); process.exitCode = 2; return; }
      console.log(JSON.stringify(out));
    },
    (e) => { process.stderr.write(String((e && e.message) || e).split('\n')[0] + '\n'); process.exitCode = 1; },
  );
}
