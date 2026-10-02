// web/pocket.mjs: THE POCKET BODY. What lets the organism live on a phone and answer with its own grown cells with
// no network.
//
// His words, 2026-10-01: "All native btw, its ai data center in ur pocket, none of that ollama crap", "Should work
// exactly like llms fronteir level" and "The whole point is a new way of ai, an ai datacenter in the cloud and in the
// pocket that works exactly like fronteir ai + the features i told u"; 2026-09-26: "it should be cli in dilation.dev
// someday so i can prompt like any ai".
//
// generatePocket({ root, dist }) writes, under dist (web/dist by default):
//   organism/cells/<file>      a byte copy of every cell the tab may ask (and of every ./ sibling a cell imports), each
//                              re-read and checked against the sha256 of its source, or the build throws; a cell whose
//                              source breaks the contract (grow/contract.mjs validateCell) is refused.
//                              THE GATE (contract c2): a locked row of grown/index.json ships; a tier "neo" row ships
//                              only when it serves (grow/neo-core.mjs rowServes: serve true and well formed templates)
//                              AND the search core is published below; any other neo row is not copied and not listed.
//   organism/cells.json        the rows act/cells-tab.mjs routes by, in index order, with the sha256 of each copy; a neo
//                              row carries its task, serve true and its templates (the tab asks it only on a fit).
//   organism/grow/neo-core.mjs and organism/grow/neo-kernel.mjs   byte copies of <root>/grow/: THE SAME search the
//                              cloud runs, for the body (web/pocket-era.mjs) and the tab's gate. Copied only when the
//                              core imports nothing but ./neo-kernel.mjs and the kernel imports nothing; otherwise
//                              neither is copied and organism/era/tasks.json says why (the body then reports NO_CORE).
//   organism/web/pocket-era.mjs   a byte copy of web/pocket-era.mjs, THE BODY: the module worker the page starts.
//   organism/era/tasks.json    the tasks the body may grow: { task, file, rows, bytes, sha256, mastered } each, from
//                              <root>/neo/tasks/<task>/task.json and dev.jsonl ONLY (a held-out file is never opened);
//                              a task grown/index.json already serves or holds mastered gets no file; what is left out
//                              (and why) is listed. No neo/know pack is copied (the kernel has no know family).
//   organism/era/tasks/<task>.json   one task's dev rows { q, expect, answer? } as JSON, at most TASK_FILE_CAP bytes
//                              each and ERA_CAP together.
//   ask/manifest.webmanifest   name and short_name Dilation, start_url and scope /ask (the page the host serves:
//                              vercel.json cleanUrls with trailingSlash false answers /ask, and 308s /ask/ to it),
//                              display standalone, theme and background colours taken from the ask page's own CSS:
//   ask/icon.svg               full bleed, its glyph inside the maskable safe zone (a centred circle, radius 40%).
//   ask/sw.js                  the service worker, registered with scope / (SW_SCOPE) so it controls the page at /ask
//                              AND the body's worker under /organism/; vercel.json sends Service-Worker-Allowed: / for
//                              it. VERSION is a sha256 over every file it lists (url and sha256 of each), so a new
//                              generation is a new worker whose activate deletes the old cache. It precaches the ask
//                              page, the organism modules of organism/manifest.json, cells.json, the cells, the core,
//                              the body and tasks.json, each fetched past the HTTP cache and checked against its sha256
//                              (a stale copy fails the install, never enters the cache); it holds the task files LAZY
//                              (checked and cached on their first fetch, which the body makes once); it serves both
//                              lists cache first with a background revalidate (the same bytes refresh the entry; other
//                              bytes mean a newer generation is deployed: never mixed into this version's cache, the
//                              worker asks for its update); and it NEVER intercepts or caches a POST, anything under
//                              /api/ or a URL it does not list, so a prompt the tab misses still reaches the server.
// It returns { cells, bytes, precache, version, lazy, lazyBytes, era }: the cells copied, the bytes precached, the
// count of precached files, the version, the count and bytes of the lazy task files, and the body's files
// ({ core, why, tasks, left, files: [{ url, bytes }] }). It reads <dist>/ask/index.html and
// <dist>/organism/manifest.json, which web/ask.mjs generateAsk() writes first; it edits neither.
//
// Run: node web/pocket.mjs [--dist <dir>] [--root <dir>]   prints the result as one JSON line (a dist with no ask page
// gets one from web/ask.mjs generateAsk first). No model call anywhere; zero dependencies; Node 22 and 24.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, copyFileSync, statSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateCell, FORBIDDEN, ID_RE } from '../grow/contract.mjs';

// THE GATE's rule comes from the engine's own core; a tree without it ships no NEO row (fail closed).
let CORE = null;
try { CORE = await import('../grow/neo-core.mjs'); } catch { CORE = null; }

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NAME = 'Dilation';
// The page the host serves is /ask (vercel.json: cleanUrls, trailingSlash false), so the app starts there and its
// navigation scope holds it. The worker's scope is the whole origin (it must control /ask and /organism/).
export const START_URL = '/ask';
export const SCOPE = '/ask';
export const SW_URL = '/ask/sw.js';
export const SW_SCOPE = '/';
export const CACHE_PREFIX = 'dilation-pocket-';
export const ICON_SIZE = 512;
export const SAFE_RADIUS = ICON_SIZE * 0.4;
// The body: one task's dev rows as JSON, every task file together, and the honest line when the core is missing.
export const TASK_FILE_CAP = 64 * 1024;
export const ERA_CAP = 4 * 1024 * 1024;
export const NO_CORE = 'the search core is not published yet';
// What the ask page needs in its head and its module script to become the installed app.
export const POCKET_HEAD = '<link rel="manifest" href="/ask/manifest.webmanifest"><link rel="icon" href="/ask/icon.svg" type="image/svg+xml">';
export const REGISTER_SW = "if ('serviceWorker' in navigator) navigator.serviceWorker.register('" + SW_URL + "', { scope: '" + SW_SCOPE + "' }).catch(() => {});";

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

/** The web app manifest of /ask: start_url and scope are the path the host serves the page at. */
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

/** THE GATE at the build: a locked row ships; a tier "neo" row ships only when it serves and the core is published. */
export function shipsRow(r, corePublished, rule = CORE) {
  if (!r || r.tier !== 'neo') return true;
  return corePublished === true && !!rule && typeof rule.rowServes === 'function' && rule.rowServes(r) === true;
}

/**
 * The cells the tab may ask, from <root>/grown/index.json, read and checked, in index order, with every file they bring.
 * A tier "neo" row that does not pass shipsRow is left out (counted in silent), its file never read.
 * @param {string} root the tree
 * @param {{ corePublished?: boolean }} o whether the search core ships beside the cells (planCore(root).ok by default)
 * @returns {{ generation: number|null, rows: object[], silent: string[], files: Map<string, { src: string, bytes: Uint8Array }> }}
 */
export function planCells(root = ROOT, { corePublished = planCore(root).ok } = {}) {
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
  const silent = [];
  const rows = index.cells.map((r, i) => {
    const id = String(r?.id ?? '');
    if (!ID_RE.test(id)) fail('grown/index.json row ' + i + ' has no cell id');
    if (ids.has(id)) fail('grown/index.json lists ' + id + ' twice');
    ids.add(id);
    if (!shipsRow(r, corePublished)) { silent.push(id); return null; }
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
    const neo = r.tier === 'neo';
    return {
      id,
      class: typeof r.class === 'string' ? r.class : null,
      generation: Number.isInteger(r.generation) ? r.generation : null,
      lane: typeof r.lane === 'string' ? r.lane : null,
      tier: typeof r.tier === 'string' ? r.tier : null,
      ...(neo ? { task: typeof r.task === 'string' ? r.task : typeof r.class === 'string' ? r.class : null, serve: true, templates: [...r.templates] } : {}),
      file,
      bytes: cell.bytes.length,
      sha256: sha256(cell.bytes),
      deps,
    };
  }).filter(Boolean);
  return { generation: Number.isInteger(index.generation) ? index.generation : null, rows, silent, files };
}

/** Copy one file, read the copy back, and throw unless its sha256 is the source's. */
function copyChecked(src, dst, bytes, copy, what) {
  mkdirSync(path.dirname(dst), { recursive: true });
  copy(src, dst);
  const want = sha256(bytes), got = sha256(readFileSync(dst));
  if (got !== want) fail('the copy of ' + what + ' differs from its source (sha256 ' + got.slice(0, 12) + ', the source ' + want.slice(0, 12) + ')');
  return got;
}

// ---------------------------------------------------------------- the body: what the phone burns eras with

const TASK_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const NODE_RE = /\bfrom\s*['"]node:|\bimport\s*\(\s*['"]node:|\brequire\s*\(/;
const DYNAMIC_IMPORT_RE = /\bimport\s*\(/;
const BODY_FILE = path.join(ROOT, 'web', 'pocket-era.mjs');

/** The module specifiers a file imports statically (import ... from, export ... from). */
function importSpecs(text) {
  const out = [];
  for (const re of IMPORT_RES) for (const m of text.matchAll(re)) out.push(m[1]);
  return out;
}

/**
 * The search core the body and the tab's gate import: <root>/grow/neo-core.mjs (it may import ./neo-kernel.mjs only)
 * and <root>/grow/neo-kernel.mjs (it may import nothing), neither holding a node: import or a require.
 * @returns {{ ok: boolean, why: string|null, files: { rel: string, src: string, bytes: Buffer }[] }}
 */
export function planCore(root = ROOT) {
  const files = [];
  for (const [name, allowed] of [['neo-core.mjs', ['./neo-kernel.mjs']], ['neo-kernel.mjs', []]]) {
    const src = path.join(root, 'grow', name);
    if (!existsSync(src)) return { ok: false, why: NO_CORE + ': grow/' + name + ' does not exist', files: [] };
    const bytes = readFileSync(src);
    const text = bytes.toString('utf8');
    if (NODE_RE.test(text)) return { ok: false, why: NO_CORE + ': grow/' + name + ' still holds a node: import or a require', files: [] };
    const bad = importSpecs(text).filter((s) => !allowed.includes(s));
    if (bad.length) return { ok: false, why: NO_CORE + ': grow/' + name + ' imports ' + bad.join(', '), files: [] };
    if (DYNAMIC_IMPORT_RE.test(text)) return { ok: false, why: NO_CORE + ': grow/' + name + ' holds a dynamic import', files: [] };
    files.push({ rel: 'grow/' + name, src, bytes });
  }
  return { ok: true, why: null, files };
}

/** The tasks grown/index.json already serves or holds mastered (the engine's own rules): the body leaves them alone. */
function servedTasks(root, rule = CORE) {
  const out = new Set();
  let index = null;
  try { index = JSON.parse(readFileSync(path.join(root, 'grown', 'index.json'), 'utf8')); } catch { return out; }
  for (const r of Array.isArray(index?.cells) ? index.cells : []) {
    if (!r || r.tier !== 'neo') continue;
    const task = typeof r.task === 'string' ? r.task : typeof r.class === 'string' ? r.class : null;
    if (!task) continue;
    if ((rule && rule.rowServes(r)) || (rule && rule.isMastered(r.heldout))) out.add(task);
  }
  return out;
}

/** A dev row in the engine's shape { q, expect, answer? }, or null (grow/neo-core.mjs rowsOf keeps the same). */
function devRow(r) {
  if (!r || typeof r !== 'object' || Array.isArray(r)) return null;
  const q = typeof r.q === 'string' ? r.q : typeof r.prompt === 'string' ? r.prompt : null;
  if (!q || !q.trim() || !r.expect || typeof r.expect !== 'object' || Array.isArray(r.expect)) return null;
  const a = typeof r.answer === 'string' ? r.answer : typeof r.reply === 'string' ? r.reply : null;
  return a !== null && a.trim() ? { q, expect: r.expect, answer: a } : { q, expect: r.expect };
}

/**
 * The task files of the body, from <root>/neo/tasks/<task>/task.json and dev.jsonl ONLY. A task grown/index.json
 * serves or holds mastered is listed with mastered true and no file; a task over TASK_FILE_CAP or past ERA_CAP, with
 * fewer than 4 dev rows, or with no dev.jsonl is left out with its reason.
 * @returns {{ tasks: object[], left: { task: string, why: string }[], files: Map<string, Buffer> }}
 */
export function planTasks(root = ROOT, { taskCap = TASK_FILE_CAP, eraCap = ERA_CAP } = {}) {
  const dir = path.join(root, 'neo', 'tasks');
  const tasks = [], left = [], files = new Map();
  if (!existsSync(dir)) return { tasks, left, files };
  const served = servedTasks(root);
  let total = 0;
  for (const name of readdirSync(dir).sort()) {
    const tdir = path.join(dir, name);
    if (!statSync(tdir).isDirectory()) continue;
    if (!TASK_RE.test(name)) { left.push({ task: name, why: 'not a task name' }); continue; }
    if (served.has(name)) { tasks.push({ task: name, mastered: true, file: null, rows: 0, bytes: 0, sha256: null }); continue; }
    const devFile = path.join(tdir, 'dev.jsonl');
    if (!existsSync(devFile)) { left.push({ task: name, why: 'no dev.jsonl' }); continue; }
    let meta = {};
    try { meta = JSON.parse(readFileSync(path.join(tdir, 'task.json'), 'utf8')) || {}; } catch { meta = {}; }
    const rows = [];
    for (const line of readFileSync(devFile, 'utf8').split(/\r?\n/)) {
      if (!line.trim()) continue;
      let r = null;
      try { r = devRow(JSON.parse(line)); } catch { r = null; }
      if (r) rows.push(r);
    }
    if (rows.length < 4) { left.push({ task: name, why: rows.length + ' dev rows, under 4' }); continue; }
    const body = { task: name, skill: typeof meta.skill === 'string' ? meta.skill : null, domain: typeof meta.domain === 'string' ? meta.domain : null, rows };
    const bytes = Buffer.from(JSON.stringify(body) + '\n', 'utf8');
    if (bytes.length > taskCap) { left.push({ task: name, why: bytes.length + ' bytes, over the task file cap ' + taskCap }); continue; }
    if (total + bytes.length > eraCap) { left.push({ task: name, why: 'past the cap ' + eraCap + ' on every task file together' }); continue; }
    total += bytes.length;
    const file = 'tasks/' + name + '.json';
    files.set(file, bytes);
    tasks.push({ task: name, mastered: false, file, rows: rows.length, bytes: bytes.length, sha256: sha256(bytes) });
  }
  return { tasks, left, files };
}

/** The body's own module, checked browser safe (nothing of node, no static import: it loads the core itself). */
function bodyBytes(file = BODY_FILE) {
  if (!existsSync(file)) fail('the body ' + file + ' does not exist');
  const bytes = readFileSync(file);
  const text = bytes.toString('utf8');
  if (NODE_RE.test(text) || /\bprocess\./.test(text)) fail('web/pocket-era.mjs touches node or the process');
  if (importSpecs(text).length) fail('web/pocket-era.mjs has a static import; it loads the core with a dynamic one');
  return bytes;
}

// ---------------------------------------------------------------- the service worker

/** The version: a sha256 over every listed file (its url and the sha256 of its bytes), precache then lazy, in order. */
export function pocketVersion(precache, lazy = []) {
  return sha256(precache.concat(lazy).map((f) => f.url + ' ' + f.sha256).join('\n'));
}

/**
 * The source of ask/sw.js for a version, its precache list and its lazy list ([{ url, sha256 }] each). A classic
 * worker script.
 */
export function swSource({ version, precache, lazy = [] }) {
  const listOf = (l) => '[\n' + l.map((f) => '  ' + JSON.stringify({ url: f.url, sha256: f.sha256 })).join(',\n') + '\n]';
  return `// sw.js: THE POCKET, the service worker of /ask and the body. GENERATED by web/pocket.mjs; do not edit by hand.
// Cache first with a background revalidate for exactly the files below, each checked against its sha256: PRECACHE is
// fetched at install, LAZY on its first fetch. A POST, anything under /api/ and any URL not listed are never
// intercepted and never cached; activate deletes every older version's cache.
'use strict';
const VERSION = ${JSON.stringify(version)};
const PREFIX = ${JSON.stringify(CACHE_PREFIX)};
const CACHE = PREFIX + VERSION;
const PRECACHE = ${listOf(precache)};
const LAZY = ${lazy.length ? listOf(lazy) : '[]'};
const BY_URL = new Map(PRECACHE.concat(LAZY).map((f) => [f.url, f]));

function hex(buf) { return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join(''); }
async function shaOf(res) { return hex(await crypto.subtle.digest('SHA-256', await res.clone().arrayBuffer())); }
// A response the cache may hold and serve to a navigation: a redirected one (a host may answer /ask with a redirect)
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

// The ask page is one file whatever the query (/ask?q=...) and whichever name the host gives it.
function keyOf(pathname) { return pathname === '/ask/' || pathname === '/ask/index.html' ? ${JSON.stringify(START_URL)} : pathname; }

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

/** Remove the files of dir (not below it) whose name matches re and is not in keep. */
function prune(dir, re, keep) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) if (re.test(name) && !keep.has(name)) rmSync(path.join(dir, name), { force: true });
}

/**
 * Write the pocket under dist: the cells, cells.json, the core, the body and its task files, the manifest, the icon
 * and the service worker.
 * @param {{ root?: string, dist?: string, copy?: (src: string, dst: string) => void, body?: string }} o copy is the file
 *   copier (tests inject one); body is the body module to ship (web/pocket-era.mjs)
 * @returns {{ cells: number, bytes: number, precache: number, version: string, lazy: number, lazyBytes: number, era: object }}
 */
export function generatePocket({ root = ROOT, dist = path.join(root, 'web', 'dist'), copy = defaultCopy, body = BODY_FILE } = {}) {
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

  const core = planCore(root);
  const plan = planCells(root, { corePublished: core.ok });
  const cellsDir = path.join(organism, 'cells');
  mkdirSync(cellsDir, { recursive: true });
  prune(cellsDir, /\.mjs$/, new Set([...plan.files.keys()].map((rel) => rel.slice('cells/'.length))));
  for (const [rel, { src, bytes }] of plan.files) copyChecked(src, path.join(organism, ...rel.split('/')), bytes, copy, 'grown/' + rel);
  const index = {
    what: 'the grown cells this tab answers with, copied byte for byte from grown/ by web/pocket.mjs; act/cells-tab.mjs routes them in this order, the order of grown/index.json; a NEO colony is listed only while it serves (THE GATE, contract c2) and is asked only on a prompt that fits its templates',
    generation: plan.generation,
    cells: plan.rows,
  };
  const indexBytes = Buffer.from(JSON.stringify(index, null, 2) + '\n', 'utf8');
  writeFileSync(path.join(organism, 'cells.json'), indexBytes);
  add('/organism/cells.json', indexBytes);
  for (const [rel, { bytes }] of plan.files) add('/organism/' + rel, bytes);

  // THE BODY: the core (when it is published), the body module, the task list and the dev rows of every task.
  const growDir = path.join(organism, 'grow');
  prune(growDir, /\.mjs$/, new Set(core.files.map((f) => path.basename(f.rel))));
  for (const f of core.files) {
    copyChecked(f.src, path.join(organism, ...f.rel.split('/')), f.bytes, copy, f.rel);
    add('/organism/' + f.rel, f.bytes);
  }
  const bodySrc = bodyBytes(body);
  copyChecked(body, path.join(organism, 'web', 'pocket-era.mjs'), bodySrc, copy, 'web/pocket-era.mjs');
  add('/organism/web/pocket-era.mjs', bodySrc);
  const tasks = planTasks(root);
  const eraDir = path.join(organism, 'era');
  const tasksDir = path.join(eraDir, 'tasks');
  mkdirSync(tasksDir, { recursive: true });
  prune(tasksDir, /\.json$/, new Set([...tasks.files.keys()].map((rel) => rel.slice('tasks/'.length))));
  const lazy = [];
  for (const [rel, bytes] of tasks.files) {
    writeFileSync(path.join(eraDir, ...rel.split('/')), bytes);
    const back = sha256(readFileSync(path.join(eraDir, ...rel.split('/'))));
    if (back !== sha256(bytes)) fail('the copy of era/' + rel + ' differs from what was written');
    lazy.push({ url: '/organism/era/' + rel, bytes: bytes.length, sha256: back });
  }
  const list = {
    what: 'the tasks this device may grow cells for, with the dev rows of each (never a held-out row), written by web/pocket.mjs for web/pocket-era.mjs; a mastered task is the cloud\'s and has no file',
    core: core.ok ? 'grow/neo-core.mjs' : null,
    why: core.why,
    tasks: tasks.tasks,
    left: tasks.left,
  };
  const listBytes = Buffer.from(JSON.stringify(list, null, 2) + '\n', 'utf8');
  writeFileSync(path.join(eraDir, 'tasks.json'), listBytes);
  add('/organism/era/tasks.json', listBytes);

  const version = pocketVersion(precache, lazy);
  writeFileSync(path.join(askDir, 'sw.js'), swSource({ version, precache, lazy }));
  const era = {
    core: core.ok,
    why: core.why,
    tasks: tasks.tasks.filter((t) => t.file).length,
    mastered: tasks.tasks.filter((t) => t.mastered).length,
    left: tasks.left.length,
    silent: plan.silent.length,
    files: [
      ...core.files.map((f) => ({ url: '/organism/' + f.rel, bytes: f.bytes.length })),
      { url: '/organism/web/pocket-era.mjs', bytes: bodySrc.length },
      { url: '/organism/era/tasks.json', bytes: listBytes.length },
      ...lazy.map((f) => ({ url: f.url, bytes: f.bytes })),
    ],
  };
  return {
    cells: plan.rows.length,
    bytes: precache.reduce((s, f) => s + f.bytes, 0),
    precache: precache.length,
    version,
    lazy: lazy.length,
    lazyBytes: lazy.reduce((s, f) => s + f.bytes, 0),
    era,
  };
}

// ---------------------------------------------------------------- the command line

const USAGE = 'usage: node web/pocket.mjs [--dist <dir>] [--root <dir>]   writes the pocket under dist (web/dist) and prints { cells, bytes, precache, version, lazy, lazyBytes, era }';

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
    return generateAsk(dist, { root }).pocket;
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
