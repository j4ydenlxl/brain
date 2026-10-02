// act/cells-tab.mjs: THE POCKET ROUTER, the tab's door to the organism's GROWN cells (web/pocket.mjs ships them).
//
// His words, 2026-10-01: "All native btw, its ai data center in ur pocket, none of that ollama crap" and "The whole
// point is a new way of ai, an ai datacenter in the cloud and in the pocket that works exactly like fronteir ai + the
// features i told u". A phone with no network answers with the cells the organism grew: web/pocket.mjs copies them
// byte for byte to /organism/cells/ with /organism/cells.json, and /ask/sw.js holds them offline.
//
// THE ROUTE RULE IS THE SERVER'S (grown/index.mjs grownAnswer, written by grow/store.mjs renderIndexMjs): the cells
// in index order; the first whose can(q) is exactly true and whose answer(q) is a non-empty string answers; a throw
// in can is a false, a throw in answer is a null, and a null passes the prompt to the next cell.
//
// THE GATE (contract c2, grow/neo-core.mjs; the server's grown/index.mjs carries the same): a row with tier "neo" is a
// NEO colony. It is kept only when it serves (serve exactly true and 1 to 32 templates), and it is asked only when the
// injected fits(templates, prompt) says exactly true (the page passes grow/neo-core.mjs fitsTemplates). With no fits
// a colony is never asked; a colony that does not serve is dropped at load and its module is never imported. A row of
// any other tier is locked and never gated.
//
// What the tab adds, and only this:
// - LAZY: loadCells() reads cells.json and imports no cell; a cell module is imported the first time a prompt's walk
//   reaches it, once, and kept (a failed import is tried again on a later prompt).
// - THE BUDGET: a cell is held to BUDGET_MS. An import that fails or does not settle within the budget is a null for
//   that prompt (the import is asynchronous, so the wait is cut at the budget and the walk goes on). can and answer
//   are synchronous and run on the tab's own thread: an answer that comes back after the budget is discarded as a
//   null, but a cell that never returns cannot be interrupted from here (the contract forbids a cell timers and the
//   network, not a loop).
// - askTab(): a prompt no cell carries is POSTed once to the organism on the server (/api/ask, never intercepted by
//   the service worker); with no network the tab prints OFFLINE_LINE instead of failing silently.
//
// Browser safe: no import at all and nothing of node. The network (`fetch`), the module loader (`importer`) and the
// clock (`now`) are injected. Text that cells.json, a cell or the network returns is DATA: a row may only name a
// file under <base>/cells/, never another directory and never another origin.

export const BUDGET_MS = 1500;
export const API = '/api/ask';
export const OFFLINE_LINE = 'offline: no cell in this tab carries that prompt and there is no network to reach the organism on the server, so it was not sent. Ask again when you are online.';
const ID_RE = /^[a-z0-9][a-z0-9-]{2,63}$/;
const FILE_RE = /^cells\/[A-Za-z0-9][A-Za-z0-9._-]*\.mjs$/;
const LATE = Symbol('late');
const clockNow = () => (globalThis.performance && typeof globalThis.performance.now === 'function' ? globalThis.performance.now() : Date.now());

/** The base URL of the organism directory, with a trailing slash; a relative base resolves against the page. */
function baseOf(base) {
  const here = globalThis.location && typeof globalThis.location.href === 'string' ? globalThis.location.href : null;
  let u;
  try { u = here ? new URL(String(base), here) : new URL(String(base)); } catch { throw new Error('cells-tab: the base ' + JSON.stringify(String(base)) + ' is not a URL'); }
  if (!u.pathname.endsWith('/')) u.pathname += '/';
  u.search = '';
  u.hash = '';
  return u;
}

/** Whether a NEO row serves: serve exactly true and 1 to MAX_TEMPLATES templates, each a short string. */
export const MAX_TEMPLATES = 32;
export function serves(r) {
  return !!r && r.serve === true && Array.isArray(r.templates) && r.templates.length > 0 && r.templates.length <= MAX_TEMPLATES
    && r.templates.every((t) => typeof t === 'string' && t.length > 0 && t.length <= 400);
}

/**
 * One row of cells.json, checked: an id, and a file under <base>/cells/ (data never points the loader elsewhere). A
 * tier "neo" row that does not serve is null (THE GATE: it is never asked and never imported).
 */
function rowOf(r, i, base) {
  if (!r || typeof r !== 'object') throw new Error('cells-tab: cells.json row ' + i + ' is not an object');
  const id = String(r.id ?? '');
  if (!ID_RE.test(id)) throw new Error('cells-tab: cells.json row ' + i + ' has no cell id');
  const file = String(r.file ?? '');
  if (!FILE_RE.test(file)) throw new Error('cells-tab: cells.json row ' + id + ' names ' + JSON.stringify(file) + ', not a file under cells/');
  const url = new URL(file, base);
  if (url.origin !== base.origin || !url.href.startsWith(base.href + 'cells/')) throw new Error('cells-tab: cells.json row ' + id + ' leaves ' + base.href);
  const neo = r.tier === 'neo';
  if (neo && !serves(r)) return null;
  return Object.freeze({
    id,
    class: typeof r.class === 'string' ? r.class : null,
    generation: Number.isInteger(r.generation) ? r.generation : null,
    tier: typeof r.tier === 'string' ? r.tier : null,
    file,
    url: url.href,
    ...(neo ? { task: typeof r.task === 'string' ? r.task : null, templates: Object.freeze([...r.templates]) } : {}),
  });
}

/**
 * The router: <base>/cells.json read, no cell imported yet.
 * @param {string} base the organism directory (absolute, or relative to the page)
 * @param {{ fetch?: Function, importer?: (url: string) => Promise<object>, budgetMs?: number, now?: () => number, fits?: (templates: string[], q: string) => boolean|Promise<boolean> }} o
 *   fits is THE GATE's template test; without it no NEO row is ever asked
 */
export async function loadCells(base, { fetch: get = globalThis.fetch, importer = (url) => import(url), budgetMs = BUDGET_MS, now = clockNow, fits = null } = {}) {
  if (typeof get !== 'function') throw new Error('cells-tab: there is no fetch to read cells.json with');
  if (typeof importer !== 'function') throw new Error('cells-tab: the importer is not a function');
  const b = baseOf(base);
  const at = new URL('cells.json', b).href;
  const res = await get(at);
  if (!res || !res.ok) throw new Error('cells-tab: ' + at + ' answered ' + (res ? res.status : 'nothing'));
  const index = await res.json();
  if (!index || !Array.isArray(index.cells)) throw new Error('cells-tab: ' + at + ' is not { cells: [..] }');
  const rows = index.cells.map((r, i) => rowOf(r, i, b)).filter(Boolean);
  return { base: b.href, generation: Number.isInteger(index.generation) ? index.generation : null, rows: Object.freeze(rows), importer, budgetMs, now, fits: typeof fits === 'function' ? fits : null, mods: new Map() };
}

/** THE GATE for one row: a locked row passes; a NEO row passes only when fits says exactly true within the budget. */
async function gateOpen(router, row, text) {
  if (row.tier !== 'neo') return true;
  if (typeof router.fits !== 'function') return false;
  const ok = await within(Promise.resolve().then(() => router.fits(row.templates, text)).then((v) => v, () => false), router.budgetMs);
  return ok === true;
}

/** p, or LATE when it has not settled within ms; the timer never outlives the race. */
function within(p, ms) {
  let timer = null;
  const late = new Promise((resolve) => { timer = setTimeout(() => resolve(LATE), ms); });
  return Promise.race([p, late]).finally(() => clearTimeout(timer));
}

/** The cell's module, imported on first need and kept; a failed import is forgotten so a later prompt tries again. */
function moduleOf(router, row) {
  let p = router.mods.get(row.id);
  if (!p) {
    p = Promise.resolve().then(() => router.importer(row.url));
    router.mods.set(row.id, p);
    p.then(null, () => { if (router.mods.get(row.id) === p) router.mods.delete(row.id); });
  }
  return p.then((m) => (m && typeof m === 'object' ? m : null), () => null);
}

/** The server's rule for one cell: can exactly true, then a non-empty answer; a throw is a no. */
function answerOf(mod, text) {
  let can = false;
  try { can = mod.can(text) === true; } catch { can = false; }
  if (!can) return null;
  let a = null;
  try { a = mod.answer(text); } catch { a = null; }
  return typeof a === 'string' && a.trim().length ? a : null;
}

/**
 * Route a prompt through the grown cells, the server's way.
 * @returns {Promise<{ text: string, cell: string, class: string|null, ms: number } | null>}
 */
export async function route(router, prompt) {
  if (!router || !Array.isArray(router.rows)) return null;
  const text = String(prompt ?? '');
  const t0 = router.now();
  for (const row of router.rows) {
    if (!(await gateOpen(router, row, text))) continue;
    const mod = await within(moduleOf(router, row), router.budgetMs);
    if (!mod || mod === LATE) continue;
    const c0 = router.now();
    const a = answerOf(mod, text);
    if (a === null || router.now() - c0 > router.budgetMs) continue;
    const meta = mod.meta && typeof mod.meta === 'object' ? mod.meta : {};
    return { text: a, cell: typeof meta.id === 'string' ? meta.id : row.id, class: typeof meta.class === 'string' ? meta.class : row.class, ms: router.now() - t0 };
  }
  return null;
}

/**
 * The tab's ask after its own regions: a grown cell, else the server (one POST to /api/ask), else the offline line.
 * @returns {Promise<{ from: 'cell', text, cell, class, ms } | { from: 'server', status: number, json: any } | { from: 'offline', line: string, error?: string }>}
 */
export async function askTab(router, prompt, { fetch: get = globalThis.fetch, api = API, online = !(globalThis.navigator && globalThis.navigator.onLine === false) } = {}) {
  const hit = await route(router, prompt);
  if (hit) return { from: 'cell', ...hit };
  if (!online || typeof get !== 'function') return { from: 'offline', line: OFFLINE_LINE };
  try {
    const res = await get(api, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: String(prompt ?? '') }) });
    let json = null;
    try { json = await res.json(); } catch { json = null; }
    return { from: 'server', status: res.status, json };
  } catch (err) {
    return { from: 'offline', line: OFFLINE_LINE, error: String((err && err.message) || err) };
  }
}
