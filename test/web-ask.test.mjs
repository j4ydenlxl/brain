// test/web-ask.test.mjs: the prompt box on dilation.dev (web/ask.mjs, queue item 12), now a chat.
// Board 18 builder: the page now posts a refused prompt once to /api/ask; a tab answer still makes no request.
// Board 25 (item tab-converse, his 2026-09-27 09:28 EDT "Yeah but i said hey to it and it said it couldnt
// respond"): the conversation region runs in the tab FIRST, a refused prompt shows the server block before
// the tab's refusal lines, and a server answer prints once.
// pocket-frontier-surface (his 2026-10-01 "Should work exactly like llms fronteir level" and "All native btw, its
// ai data center in ur pocket"): turns stack in a thread that survives a reload, a follow-up is carried by
// act/thread.mjs, the grown cells answer in the tab, the page is installable and says so honestly when offline,
// and every answer reaches the DOM as text.
// THE POCKET BODY: THE GATE in the tab (an unmastered colony is never bundled nor asked), a cell grown on this
// device answers after the cloud's cells and before the server, and the body's one dim line and its switch.
// The page must run the organism's own bytes, answer what the CLI answers, and reach nothing. Nothing here reads the
// tree's grown/ or neo/: the page is built from a FIXTURE tree written below into a temp directory (its
// grown/index.mjs rendered by grow/store.mjs renderIndexMjs, the server's own renderer), so the suite holds whatever
// the organism grows next.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  generateAsk, EXAMPLES, MODULES, ROOT, PENDING_LINE, refusedHtml, serverHtml, answerOnce, tabNativeHtml, clock,
  esc, mount, toHtml, helloView, pendingView, refusalView, PAGE_FUNCTIONS, clip, cleanTurns, loadTurns, saveTurns, swAllowed,
  sendsOnKey, THREAD_KEY, KEEP_TURNS, TEXT_CAP, BACKGROUND, SW_URL, SW_SCOPE, HELLO_LINE, BODY_URL, DEVICE_ROUTE, deviceView,
} from '../web/ask.mjs';
import { askColors, POCKET_HEAD } from '../web/pocket.mjs';
import { ROUTE_LINE, SWITCH_KEY, WHY, bodyLine } from '../web/pocket-era.mjs';
import { OFFLINE_LINE } from '../act/cells-tab.mjs';
import { renderIndexMjs } from '../grow/store.mjs';
import { solve } from '../act/solve.mjs';
import { converse } from '../act/converse.mjs';

const sha = (f) => crypto.createHash('sha256').update(readFileSync(f)).digest('hex');
const count = (hay, needle) => hay.split(needle).length - 1;
const ASK_PAGE_CAP = 32768;     // the /ask page alone
const ASK_TOTAL_CAP = 262144;   // the page plus every organism module it imports
const temps = [];
const tmp = (tag) => { const d = mkdtempSync(path.join(os.tmpdir(), 'web-ask-' + tag + '-')); temps.push(d); return d; };
after(() => {
  for (const d of temps) rmSync(d, { recursive: true, force: true });
  for (const d of temps) assert.equal(existsSync(d), false, 'a temp directory was left behind: ' + d);
});

// ---------------------------------------------------------------- the fixture tree and its build

const cellSrc = ({ id, cls, gen = 1, lane = 'direct', can, answer, tail = '' }) => [
  "export const meta = { id: '" + id + "', class: '" + cls + "', generation: " + gen + ", lane: '" + lane + "', grownFrom: ['x'], version: 1 };",
  'export function can(q) { ' + can + ' }',
  'export function answer(q) { ' + answer + ' }',
  "export const examples = [{ q: 'x', expect: { notRefusal: true } }];",
  tail,
  '',
].join('\n');
const CAPITAL = 'capital-of-direct-g1', REVERSE = 'reverse-neo-g1', SILENT = 'sum-neo-g1';
const TOKYO = 'Tokyo is the capital of Japan.';
// A locked cell, a NEO colony that serves (its can is ALWAYS true: only its template keeps it from every prompt), and
// an UNMASTERED colony (serve false, held-out 0.5) whose can is always true too.
const CELLS = {
  [CAPITAL]: cellSrc({ id: CAPITAL, cls: 'capital', can: 'return /^capital of japan$/i.test(String(q).trim());', answer: 'return ' + JSON.stringify(TOKYO) + ';' }),
  [REVERSE]: cellSrc({ id: REVERSE, cls: 'reverse-word', lane: 'neo', can: 'return true;', answer: 'const w = String(q).trim().split(" ").pop(); return w ? w.split("").reverse().join("") : null;', tail: 'export const colony = { cells: 1, kernel: 1 };' }),
  [SILENT]: cellSrc({ id: SILENT, cls: 'sum', lane: 'neo', can: 'return true;', answer: 'return "from the unmastered colony";', tail: 'export const colony = { cells: 2, kernel: 1 };' }),
};
const ROWS = [
  { id: CAPITAL, class: 'capital', generation: 1, lane: 'direct', file: 'cells/' + CAPITAL + '.mjs', heldout: { score: 1, n: 4 }, promotedAt: 'x' },
  { id: REVERSE, class: 'reverse-word', generation: 1, lane: 'neo', tier: 'neo', task: 'reverse-word', serve: true, templates: ['reverse the word {1-3}'], file: 'cells/' + REVERSE + '.mjs', heldout: { score: 1, n: 4, ok: 4 }, promotedAt: 'x' },
  { id: SILENT, class: 'sum', generation: 1, lane: 'neo', tier: 'neo', task: 'sum', serve: false, templates: ['sum of {#1-2} and {#1-2}'], file: 'cells/' + SILENT + '.mjs', heldout: { score: 0.5, n: 4, ok: 2 }, promotedAt: 'x' },
];
const W = ['apple', 'river', 'stone', 'cloud', 'tiger', 'lemon', 'piano', 'candle'];
const TASKS = {
  'reverse-word': W.map((w) => ({ q: 'reverse the word ' + w, expect: { equals: w.split('').reverse().join('') }, answer: w.split('').reverse().join('') })),
  sum: W.map((w, i) => ({ q: 'sum of ' + i + ' and ' + (i + 2), expect: { equals: String(2 * i + 2) }, answer: String(2 * i + 2) })),
  'count-letters': W.map((w) => ({ q: 'how many letters in ' + w, expect: { equals: String(w.length) }, answer: String(w.length) })),
};
function fixtureRoot(root) {
  const grown = path.join(root, 'grown');
  mkdirSync(path.join(grown, 'cells'), { recursive: true });
  for (const [id, src] of Object.entries(CELLS)) writeFileSync(path.join(grown, 'cells', id + '.mjs'), src);
  const index = { generation: 1, cells: ROWS };
  writeFileSync(path.join(grown, 'index.json'), JSON.stringify(index, null, 2));
  writeFileSync(path.join(grown, 'index.mjs'), renderIndexMjs(index));
  mkdirSync(path.join(root, 'grow'), { recursive: true });
  for (const f of ['neo-core.mjs', 'neo-kernel.mjs']) copyFileSync(path.join(ROOT, 'grow', f), path.join(root, 'grow', f));
  for (const [task, dev] of Object.entries(TASKS)) {
    const d = path.join(root, 'neo', 'tasks', task);
    mkdirSync(d, { recursive: true });
    writeFileSync(path.join(d, 'task.json'), JSON.stringify({ task, skill: 'fixture', domain: 'words' }));
    writeFileSync(path.join(d, 'dev.jsonl'), dev.map((r) => JSON.stringify(r)).join('\n') + '\n');
  }
  return root;
}
const FIX = fixtureRoot(path.join(tmp('root'), 'root'));
const DIST = tmp('dist');
const built = generateAsk(DIST, { root: FIX });
const { grownAnswer } = await import(pathToFileURL(path.join(FIX, 'grown', 'index.mjs')).href);
const realEra = await import(pathToFileURL(path.join(DIST, 'organism', 'web', 'pocket-era.mjs')).href);

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

test('the manifest carries act/converse.mjs with the sha256 of the repository file, and the page lists it beside the others', () => {
  assert.ok(MODULES.includes('act/converse.mjs'));
  const c = built.manifest.files.find((f) => f.file === 'act/converse.mjs');
  assert.ok(c, 'act/converse.mjs is in the manifest');
  assert.equal(c.sha256, sha(path.join(ROOT, 'act', 'converse.mjs')));
  assert.equal(c.bytes, readFileSync(path.join(ROOT, 'act', 'converse.mjs')).length);
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  for (const f of built.manifest.files) assert.ok(html.includes('<span class="port">' + f.file + ' ' + f.sha256.slice(0, 12) + '</span>'), f.file + ' listed');
  console.log('manifest  ' + built.manifest.files.map((f) => f.file + ' ' + f.sha256.slice(0, 12)).join(', '));
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

test('the copied conversation region answers every page example exactly as act/converse.mjs does, and carries no digit prompt', async () => {
  const copy = await import(pathToFileURL(path.join(DIST, 'organism', 'act', 'converse.mjs')).href);
  let carried = 0;
  for (const q of EXAMPLES.concat(['hey, how are you', 'tell me a joke', 'Hey', 'yo'])) {
    const a = copy.converse(q), b = converse(q);
    assert.equal(a ? a.answer : null, b ? b.answer : null, q);
    assert.equal(a ? a.kind : null, b ? b.kind : null, q);
    if (a) carried++;
    // the region never shadows the exact reader: a prompt the exact reader answers is not a turn
    if (solve(q)) assert.equal(a, null, 'the region shadowed ' + q);
  }
  assert.ok(carried >= 4, 'hey, who are you, hey how are you and tell me a joke at least: ' + carried);
  assert.equal(copy.converse('hey').kind, 'greeting');
  assert.equal(copy.converse('who are you').kind, 'identity');
});

test('the page and the landing box import only the organism copies; the landing box makes no request; the page has ONE fetch, to /api/ask', () => {
  const pages = [readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8'), readFileSync(path.join(ROOT, 'web', 'src', 'index.html'), 'utf8')];
  for (const html of pages) {
    for (const m of html.matchAll(/import\s*(?:\{[^}]*\}\s*from\s*)?\(?\s*['"]([^'"]+)['"]/g)) assert.match(m[1], /^\.{1,2}\/organism\//, 'import ' + m[1]);
    assert.doesNotMatch(html, /XMLHttpRequest|WebSocket|sendBeacon|EventSource/);
  }
  assert.doesNotMatch(pages[1], /\bfetch\(/, 'the landing box answers in the tab or links to /ask');
  assert.match(pages[1], /id="askf"/);
  assert.match(pages[1], /href="\/ask"/);
  // the ask page (board 18 builder): exactly one fetch call, and its target is the same origin /api/ask
  const calls = [...pages[0].matchAll(/\bfetch\(([^,)]*)/g)].map((m) => m[1].trim());
  assert.deepEqual(calls, ['API']);
  assert.match(pages[0], /const API = '\/api\/ask';/);
  assert.doesNotMatch(pages[0], /https?:\/\/[^"'\s]*\/api\//, 'no other origin');
  for (const s of ['sk-', 'sk_', 'Bearer ', 'BRAIN_LLM_KEY=']) assert.ok(!pages[0].includes(s), s);
});

test('the generated page imports converse from ../organism/act/converse.mjs and calls it before readExact', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  const src = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  assert.match(src, /^import \{ converse \} from '\.\.\/organism\/act\/converse\.mjs';$/m);
  const body = src.slice(src.indexOf('async function ask(q)'));
  assert.ok(body.length > 100, 'the ask function is in the page');
  const iConverse = body.indexOf('converse(q)'), iExact = body.indexOf('readExact(q, opts)'), iServer = body.indexOf('server(q)');
  assert.ok(iConverse > 0, 'ask() calls converse(q)');
  assert.ok(iExact > iConverse, 'converse(q) at ' + iConverse + ' comes before readExact(q, opts) at ' + iExact);
  assert.ok(iServer > iExact, 'the server comes after the exact reader: ' + iServer + ' > ' + iExact);
  console.log('page order  converse(q) at ' + iConverse + ', readExact(q, opts) at ' + iExact + ', server(q) at ' + iServer + ' in ask()');
});

test('the one-click prompts carry "hey" and "who are you" ahead of the exact ones, and the intro names the conversation region', () => {
  assert.deepEqual(EXAMPLES.slice(0, 2), ['hey', 'who are you']);
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  const iHey = html.indexOf('data-q="hey"'), iWho = html.indexOf('data-q="who are you"'), iExact = html.indexOf('data-q="what is 17 times 23"');
  assert.ok(iHey > 0 && iWho > iHey && iExact > iWho, 'chip order ' + iHey + ' ' + iWho + ' ' + iExact);
  assert.match(html, /conversation region/);
});

test('size cap and phone width: the page is small, and nothing in it is wider than a 375 px phone', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  const bytes = Buffer.byteLength(html);
  const total = bytes + built.manifest.files.reduce((k, f) => k + f.bytes, 0);
  assert.ok(bytes < ASK_PAGE_CAP, 'ask page ' + bytes + ' bytes over ' + ASK_PAGE_CAP);
  assert.ok(total < ASK_TOTAL_CAP, 'ask page plus modules ' + total + ' bytes over ' + ASK_TOTAL_CAP);
  console.log('size  ask/index.html ' + bytes + ' bytes (cap ' + ASK_PAGE_CAP + '), with the organism modules ' + total + ' bytes (cap ' + ASK_TOTAL_CAP + ')');
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  // no fixed width, min-width or flex-basis in px wider than the phone's content box (375 minus two 16 px gutters)
  for (const m of css.matchAll(/(?:^|[;{\s])(width|min-width|flex-basis)\s*:\s*(\d+)px/g)) assert.ok(Number(m[2]) <= 343, m[1] + ' ' + m[2] + 'px');
  assert.doesNotMatch(css, /white-space\s*:\s*(nowrap|pre)\s*;/, 'no unwrapped line');
  assert.match(css, /#term \{[^}]*overflow-wrap: anywhere/);
  assert.match(css, /\.entry pre \{[^}]*white-space: pre-wrap/);
  assert.match(css, /#q \{[^}]*min-width: 0/);
  assert.match(css, /#q \{[^}]*font-size: 16px/, 'a phone does not zoom the box on focus');
  assert.match(css, /\.chips \{[^}]*flex-wrap: wrap/);
  assert.match(css, /nav \{[^}]*flex-wrap: wrap/);
  assert.match(css, /\.chip \{[^}]*max-width: 100%/);
  assert.match(css, /main \{[^}]*padding: \d+px 16px/);
});

// ---------------------------------------------------------------- the page, run in node against a small DOM
// The DOM builds what mount() builds. Text is text: an element's innerHTML GETTER serialises it (escaped, as toHtml
// does) for the assertions, and every markup SETTER (innerHTML, outerHTML, insertAdjacentHTML, document.write)
// THROWS, so a page that writes markup fails every test below that runs it.
const markup = (what) => { throw new Error('the page wrote markup through ' + what); };
class TextNode {
  constructor(s) { this.parentNode = null; this.data = String(s); }
  get textContent() { return this.data; }
  get html() { return esc(this.data); }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
}
class El {
  constructor(doc, tag) { this.ownerDocument = doc; this.localName = tag; this.parentNode = null; this.attrs = new Map(); this.childNodes = []; this.on = {}; this.style = {}; this.value = ''; this.scrollHeight = 60; }
  setAttribute(k, v) { this.attrs.set(String(k), String(v)); }
  getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }
  hasAttribute(k) { return this.attrs.has(k); }
  get id() { return this.getAttribute('id') || ''; }
  get dataset() { const o = {}; for (const [k, v] of this.attrs) if (k.startsWith('data-')) o[k.slice(5).replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = v; return o; }
  get children() { return this.childNodes.filter((c) => c instanceof El); }
  appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); this.childNodes.push(c); c.parentNode = this; return c; }
  removeChild(c) { const i = this.childNodes.indexOf(c); assert.ok(i >= 0, 'removeChild of a node that is not a child'); this.childNodes.splice(i, 1); c.parentNode = null; return c; }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  replaceWith(n) { const p = this.parentNode; if (!p) return; if (n.parentNode) n.parentNode.removeChild(n); p.childNodes[p.childNodes.indexOf(this)] = n; n.parentNode = p; this.parentNode = null; }
  replaceChildren(...ns) { for (const c of this.childNodes) c.parentNode = null; this.childNodes = []; for (const n of ns) this.appendChild(n); }
  get textContent() { return this.childNodes.map((c) => c.textContent).join(''); }
  set textContent(v) { this.replaceChildren(...(String(v) ? [new TextNode(v)] : [])); }
  get innerHTML() { return this.childNodes.map((c) => c.html).join(''); }
  set innerHTML(v) { markup('innerHTML'); }
  get outerHTML() { return this.html; }
  set outerHTML(v) { markup('outerHTML'); }
  insertAdjacentHTML() { markup('insertAdjacentHTML'); }
  get html() { let s = '<' + this.localName; for (const [k, v] of this.attrs) s += ' ' + k + '="' + esc(v) + '"'; return s + '>' + this.innerHTML + '</' + this.localName + '>'; }
  addEventListener(t, f) { (this.on[t] ||= []).push(f); }
  fire(t, ev = {}) { const e = { type: t, target: this, prevented: false, ...ev, preventDefault() { e.prevented = true; } }; for (const f of this.on[t] || []) f(e); return e; }
  focus() { this.ownerDocument.focused = this; }
  scrollIntoView() { this.ownerDocument.scrolled.push(this); }
  matches(sel) {
    if (sel.startsWith('#')) return this.id === sel.slice(1);
    if (sel.startsWith('.')) return (this.getAttribute('class') || '').split(/\s+/).includes(sel.slice(1));
    const a = /^\[([\w-]+)(?:="([^"]*)")?\]$/.exec(sel);
    if (a) return this.hasAttribute(a[1]) && (a[2] == null || this.getAttribute(a[1]) === a[2]);
    return this.localName === sel;
  }
  get elements() { const out = []; const walk = (n) => { for (const c of n.children) { out.push(c); walk(c); } }; walk(this); return out; }
  querySelectorAll(sel) { return this.elements.filter((c) => c.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}
function makeDoc() {
  const doc = { scrolled: [], focused: null, on: {}, visibilityState: 'visible' };
  doc.addEventListener = (t, f) => { (doc.on[t] ||= []).push(f); };
  doc.createElement = (tag) => new El(doc, String(tag).toLowerCase());
  doc.createTextNode = (s) => new TextNode(s);
  doc.write = () => markup('document.write');
  doc.writeln = () => markup('document.writeln');
  doc.body = doc.createElement('body');
  doc.querySelector = (s) => doc.body.querySelector(s);
  doc.querySelectorAll = (s) => doc.body.querySelectorAll(s);
  doc.getElementById = (id) => doc.body.querySelector('#' + id);
  return doc;
}
const ORIGIN = 'https://dilation.dev';
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/** A Storage over one map. */
function memStore(init = {}) {
  const map = new Map(Object.entries(init));
  return { map, getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => { map.set(String(k), String(v)); }, removeItem: (k) => { map.delete(String(k)); } };
}
/** The file under DIST a URL of the organism directory on the page's origin names, or null: nothing else is served. */
function distOf(u) {
  const url = new URL(String(u));
  if (url.origin !== ORIGIN || !url.pathname.startsWith('/organism/')) return null;
  return path.join(DIST, ...url.pathname.split('/').filter(Boolean));
}
const script = (html) => html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];

/**
 * The page script against a planted fetch, a small DOM, a planted Storage and navigator, and the grown cells served
 * from DIST (the build the page came from) as the origin would serve them: the code path, never a live network.
 * order records converse and readExact; flow records carry, converse, readExact, route, device and the server
 * request; asked records the prompt each reader got. era is the body module the page imports apart: 'real' (the copy
 * the build wrote, its deviceAnswer recorded in flow), null (the import fails) or a planted module. Worker is the
 * page's Worker global (none by default, as in node).
 */
async function runPage({ order = null, flow = null, asked = null, store = memStore(), nav = { onLine: true }, loc = {}, cells = null, cellsGate = null, era = 'real', Worker = undefined } = {}) {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  let src = script(html);
  const mods = {};
  for (const f of built.manifest.files) mods['../organism/' + f.file] = await import(pathToFileURL(path.join(DIST, 'organism', f.file)).href);
  const note = (arr, v) => { if (arr && arr.length < 64) arr.push(v); };
  const rec = (name, fn, both, at = 0) => (...a) => { if (both) note(order, name); note(flow, name); note(asked, [name, a[at], a[at + 1]]); return fn(...a); };
  const cv = mods['../organism/act/converse.mjs'], ex = mods['../organism/act/exact-read.mjs'], th = mods['../organism/act/thread.mjs'], ct = mods['../organism/act/cells-tab.mjs'];
  mods['../organism/act/converse.mjs'] = { ...cv, converse: rec('converse', cv.converse, true) };
  mods['../organism/act/exact-read.mjs'] = { ...ex, readExact: rec('readExact', ex.readExact, true) };
  mods['../organism/act/thread.mjs'] = { ...th, carry: (...a) => { note(flow, 'carry'); return th.carry(...a); } };
  const bases = [], cellFetches = [], imported = [], dynamic = [];
  const cellFetch = async (u) => {
    cellFetches.push(String(u));
    if (cells) return new Response(JSON.stringify(cells.index));
    const f = distOf(u);
    return f && existsSync(f) ? new Response(readFileSync(f)) : new Response('not found', { status: 404 });
  };
  const cellImport = async (u) => {
    imported.push(String(u));
    if (cells) return cells.mod;
    const f = distOf(u);
    if (!f) throw new Error('not on this origin: ' + u);
    return import(pathToFileURL(f).href);
  };
  mods['../organism/act/cells-tab.mjs'] = {
    ...ct,
    loadCells: async (base, o = {}) => { bases.push(base); if (cellsGate) await cellsGate; return ct.loadCells(base, { ...o, fetch: cellFetch, importer: cellImport }); },
    route: rec('route', ct.route, false, 1),
  };
  // the page's one dynamic import, the body: what the origin serves under /organism/, or the planted module
  const body = era === 'real' ? { ...realEra, deviceAnswer: (...a) => { note(flow, 'device'); return realEra.deviceAnswer(...a); } } : era;
  const imp = async (u) => {
    dynamic.push(String(u));
    assert.equal(u, BODY_URL, 'the page imports nothing else at run time');
    if (!body) throw new Error('the body did not load');
    return body;
  };
  src = src.replace(/import\s*\{([^}]*)\}\s*from\s*'([^']+)';/g, (m, names, from) => 'const {' + names + '} = __mods[' + JSON.stringify(from) + '];');
  src = src.replace(/\bimport\(/g, '__imp(');
  const calls = [];
  let reply = null;
  const fetch = async (url, init) => {
    calls.push({ url, init });
    note(flow, 'server');
    const r = typeof reply === 'function' ? reply(url, init) : reply;
    if (r instanceof Error) throw r;
    return r;
  };
  const doc = makeDoc();
  const main = doc.body.appendChild(doc.createElement('main'));
  const newBtn = main.appendChild(doc.createElement('button'));
  newBtn.setAttribute('id', 'new');
  const chips = [];
  for (const m of html.matchAll(/<button class="chip" type="button" data-q="([^"]*)">/g)) {
    const b = main.appendChild(doc.createElement('button'));
    b.setAttribute('class', 'chip');
    b.setAttribute('data-q', unesc(m[1]));
    chips.push(b);
  }
  const term = main.appendChild(doc.createElement('div'));
  term.setAttribute('id', 'term');
  term.appendChild(mount(doc, helloView()));
  const form = main.appendChild(doc.createElement('form'));
  form.setAttribute('id', 'f');
  const box = form.appendChild(doc.createElement('textarea'));
  box.setAttribute('id', 'q');
  // the body row as the page writes it: the line, and the switch hidden until the body loads
  const bodyRow = main.appendChild(doc.createElement('div'));
  const bodyLineEl = bodyRow.appendChild(doc.createElement('span'));
  bodyLineEl.setAttribute('id', 'body');
  const bodySw = bodyRow.appendChild(doc.createElement('button'));
  bodySw.setAttribute('id', 'bodysw');
  bodySw.setAttribute('class', 'chip');
  bodySw.hidden = true;
  const window = { get localStorage() { if (store === 'throws') throw new Error('SecurityError: the store is blocked'); return store; } };
  const location = { search: '', href: ORIGIN + '/ask', protocol: 'https:', hostname: 'dilation.dev', ...loc };
  const AsyncFunction = (async () => {}).constructor;
  await new AsyncFunction('__mods', '__imp', 'document', 'window', 'location', 'navigator', 'fetch', 'Worker', src)(mods, imp, doc, window, location, nav, fetch, Worker);
  const api = window.__brainAsk;
  return { ...api, calls, term, doc, box, form, newBtn, chips, store, nav, bases, cellFetches, imported, dynamic, bodyLineEl, bodySw, setReply: (r) => { reply = r; } };
}
const respond = (status, json, retry = null) => ({ status, headers: { get: (k) => (k.toLowerCase() === 'retry-after' ? retry : null) }, json: async () => json });
const memory = (text) => respond(200, { ok: true, text, route: 'direct', provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, llm: { provider: null, reason: 'not configured' }, serverUs: 9, host: 'local', knowledge: { ready: true } });
const until = async (f, ms = 5000) => { const t0 = Date.now(); while (!f()) { assert.ok(Date.now() - t0 < ms, 'timed out waiting'); await new Promise((r) => setTimeout(r, 2)); } };
const entries = (p) => p.term.children.filter((c) => c.id !== 'hello');
const last = (p) => p.term.children[p.term.children.length - 1];
const stored = (p) => JSON.parse(p.store.getItem(THREAD_KEY));
const SERVER_ONLY = 'summarise the history of rome';

test('a tab answer makes no request; a refused prompt makes exactly one POST to /api/ask and prints the server footer', async () => {
  assert.equal(converse(SERVER_ONLY), null, 'the server-only prompt is not a turn');
  assert.equal(solve(SERVER_ONLY), null, 'the server-only prompt is not exact');
  const p = await runPage();
  const t = await p.ask('what is 17 times 23');
  assert.equal(t.tab, true);
  assert.equal(t.answer, '391');
  assert.equal(p.calls.length, 0, 'a tab answer made a request');
  assert.match(p.term.children[0].innerHTML, /data-answer="391"/);
  p.setReply(respond(200, { ok: true, text: 'nothing in memory matches write, poem, about, sea.', route: 'direct', provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, llm: { provider: 'null', model: 'null', ok: true, reason: 'the model cell is not configured on this host', fellBack: null }, serverUs: 704, host: 'local', knowledge: { ready: false, why: 'no finished ingest' } }));
  const r = await p.ask('write a poem about the sea');
  assert.equal(r.tab, false);
  assert.equal(p.calls.length, 1);
  assert.equal(p.calls[0].url, '/api/ask');
  assert.equal(p.calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(p.calls[0].init.body), { prompt: 'write a poem about the sea' });
  const h = p.term.children[1].innerHTML;
  assert.match(h, /data-route="refused"/);
  assert.match(h, /data-server-done="1" data-status="200" data-srv-route="direct" data-srv-provenance="memory"/);
  assert.match(h, /704 us on the server/);
  assert.match(h, /round trip \d+ ms in this tab/);
  assert.match(h, /model none: the model cell is not configured on this host/);
  assert.match(h, /knowledge store on the server: absent/);
  assert.equal(count(h, 'nothing in memory matches write, poem, about, sea.'), 1);
  p.setReply(respond(429, { ok: false, error: 'rate limited (per client: 20 asks a minute): retry after 3 s' }, '3'));
  await p.ask(SERVER_ONLY);
  assert.equal(p.calls.length, 2);
  assert.match(p.term.children[2].innerHTML, /the server answered 429: .*retry after 3 s/);
  await p.ask('2 to the power of 10');
  assert.equal(p.calls.length, 2, 'a tab answer after a server answer made a request');
});

test('"hey" is answered IN THE TAB by the conversation region: route direct, provenance native, model none, tokens 0, no request, the clock printed', async () => {
  const p = await runPage();
  for (const q of ['hey', 'who are you', 'hey, how are you', 'write a haiku']) {
    const want = converse(q);
    assert.ok(want, q + ' is a turn');
    const n0 = p.calls.length;
    const t = await p.ask(q);
    assert.equal(p.calls.length, n0, q + ' made a request');
    assert.equal(t.tab, true, q);
    assert.equal(t.route, 'direct');
    assert.equal(t.provenance, 'native');
    assert.equal(t.answer, want.answer, q);
    const h = p.term.children[p.term.children.length - 1].innerHTML;
    assert.match(h, /data-route="direct" data-provenance="native"/);
    assert.match(h, /model none  tokens 0  network 0/);
    const ns = Number(/data-ns="(\d+)"/.exec(h)[1]);
    assert.ok(ns >= 1, q + ' ns ' + ns);
    assert.match(h, /ns per ask on this device<\/span> \(median of 7 batches, [\d,]+ asks\)/);
    assert.equal(count(h, 'data-answer='), 1);
    // the answer comes first, the how second
    assert.ok(h.indexOf('class="ans say"') < h.indexOf('answered natively in this tab'), q + ' answer first');
    assert.doesNotMatch(h, /refuses|refused/, q + ' reads as a refusal');
    if (q === 'hey') console.log('tab hey  kind ' + t.kind + '  ' + ns + ' ns per ask (node, this host)  requests 0');
  }
});

test('the tab calls the conversation region before the exact reader, and never the exact reader for a turn it carried', async () => {
  const order = [];
  const p = await runPage({ order });
  await p.ask('what is 17 times 23');
  assert.deepEqual(order.slice(0, 2), ['converse', 'readExact']);
  order.length = 0;
  await p.ask('hey');
  assert.ok(order.length > 0 && order.every((x) => x === 'converse'), 'hey reached ' + [...new Set(order)].join(','));
  order.length = 0;
  p.setReply(respond(200, { ok: true, text: 'nothing in memory matches rome.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 5, host: 'local', knowledge: { ready: true } }));
  await p.ask(SERVER_ONLY);
  assert.deepEqual(order, ['converse', 'readExact'], 'a refused prompt asks each reader once, in order');
});

test('a refused prompt renders the SERVER block first ("asking the organism on the server ..."), the refusal lines after it, dim, every one printed', async () => {
  const unit = refusedHtml(['write', 'poem'], '"one sentence" in: hey');
  const iSrv = unit.indexOf('data-server-pending="1"'), iRef = unit.indexOf('data-refusal="1"');
  assert.ok(iSrv >= 0 && iRef > iSrv, 'server block ' + iSrv + ' before refusal ' + iRef);
  assert.ok(unit.startsWith('<div class="srv pending acc" data-server-pending="1">' + PENDING_LINE + '</div>'), 'the first visible line is the pending line');
  assert.equal(PENDING_LINE, 'asking the organism on the server ...');
  assert.match(unit, /<div class="refusal dim" data-refusal="1"><pre class="dim">no cell in this tab carries this question, so the tab refuses it, not guesses; the organism on the server answers it\.<\/pre>/);
  assert.match(unit, /tab: route refused  provenance none  model none \(the model cell is not in the browser\)  tokens 0  words the spoken reader could not read: write, poem/);
  assert.match(unit, /the word problem reader stopped at: &quot;one sentence&quot; in: hey/);
  // the same order in the page, before and after the server answers
  const p = await runPage();
  let reply;
  const gate = new Promise((ok) => { reply = ok; });
  p.setReply({ status: 200, headers: { get: () => null }, json: () => gate });
  const pending = p.ask(SERVER_ONLY);
  try {
    // the grown cells are asked before the server now, so the pending line appears after they answered nothing
    await until(() => p.term.children[0] && p.term.children[0].innerHTML.includes('data-server-pending'));
    const before = p.term.children[0].innerHTML;
    assert.ok(before.indexOf(PENDING_LINE) > 0 && before.indexOf(PENDING_LINE) < before.indexOf('data-refusal="1"'), 'pending line before the refusal lines while in flight');
  } finally {
    reply({ ok: true, text: 'nothing in memory matches rome.', route: 'direct', provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, llm: { provider: null, reason: 'not configured' }, serverUs: 142, host: 'iad1', knowledge: { ready: true } });
  }
  await pending;
  const after = p.term.children[0].innerHTML;
  assert.ok(!after.includes('data-server-pending'), 'the pending line was replaced');
  const iDone = after.indexOf('data-server-done="1"'), iRef2 = after.indexOf('data-refusal="1"');
  assert.ok(iDone > 0 && iRef2 > iDone, 'server answer ' + iDone + ' before refusal lines ' + iRef2);
  assert.match(after, /data-route="refused"/, 'the tab route is still printed');
  console.log('refused order  server block at ' + iDone + ', refusal lines at ' + iRef2 + ' (' + SERVER_ONLY + ')');
});

test('a failed request prints its failure in the server block, never silence', async () => {
  const p = await runPage();
  p.setReply(new Error('Failed to fetch'));
  const r = await p.ask(SERVER_ONLY);
  assert.equal(r.tab, false);
  const h = p.term.children[0].innerHTML;
  assert.match(h, /data-server-done="1" data-status="0"/);
  assert.match(h, /the server half did not answer: Failed to fetch/);
  assert.ok(h.indexOf('data-server-done') < h.indexOf('data-refusal="1"'));
  p.setReply(respond(500, null));
  await p.ask(SERVER_ONLY);
  assert.match(p.term.children[1].innerHTML, /the server answered 500: no JSON/);
});

test('a server answer prints ONCE: a native text ending with its answer prints the head dim and the answer once', () => {
  const answer = converse('hey, how are you').answer;
  const native = { ok: true, text: 'answered natively by the conversation region (kind greeting+wellbeing, 35945 ns), with no model, no memory read and no network.\n' + answer,
    native: { kind: 'greeting+wellbeing', answer, form: 'hey how are you', ns: 35945 }, exact: null, route: 'direct',
    provenance: { answer: 'native', memoryHits: 0, webPages: 0 }, llm: { provider: null, reason: 'not asked: the native conversation region answered' }, serverUs: 142, host: 'iad1', knowledge: { ready: true } };
  const h = serverHtml({ status: 200, j: native, rttMs: 75 });
  assert.equal(count(h, answer), 2, 'the answer text once and its data attribute once');
  assert.equal(count(h, '>' + answer + '<'), 1, 'printed once');
  assert.equal(count(h, 'data-srv-answer='), 1);
  assert.match(h, /data-srv-once="tail"/);
  assert.match(h, /<pre class="srvtext dim" data-srv-head="1">answered natively by the conversation region \(kind greeting\+wellbeing, 35945 ns\), with no model, no memory read and no network\.<\/pre>/);
  assert.ok(h.indexOf('data-srv-answer') < h.indexOf('data-srv-head'), 'the answer first, the head second');
  assert.match(h, /server: route <span class="acc">direct<\/span>  provenance <span class="acc">native<\/span>/);
  assert.match(h, /142 us on the server<\/span> \(iad1\)  round trip 75 ms in this tab/);
  // the exact shape (head line, then the answer) prints the answer once too
  const ex = serverHtml({ status: 200, j: { ok: true, text: 'answered exactly by exact.arith\n391', exact: { answer: '391', ns: 900 }, route: 'direct', provenance: { answer: 'exact' }, serverUs: 770, host: 'iad1', knowledge: { ready: true } }, rttMs: 60 });
  assert.equal(count(ex, '>391<'), 1);
  assert.match(ex, /data-srv-once="tail"/);
  // the equal case (textIsTheAnswer) prints no text block at all
  const eq = serverHtml({ status: 200, j: { ...native, text: answer }, rttMs: 70 });
  assert.equal(count(eq, '>' + answer + '<'), 1);
  assert.match(eq, /data-srv-once="equal"/);
  assert.doesNotMatch(eq, /srvtext/);
  // a text with no such tail (memory, model) prints as it came
  const mem = serverHtml({ status: 200, j: { ok: true, text: 'nothing in memory matches hey.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 9, host: 'iad1', knowledge: { ready: true } }, rttMs: 70 });
  assert.match(mem, /<pre class="srvtext">nothing in memory matches hey\.<\/pre>/);
  assert.match(mem, /data-srv-once="text"/);
  // a number that only ENDS the text, not on its own line, is not a tail
  assert.equal(answerOnce({ text: 'the year was 1391', exact: { answer: '391' } }).mode, 'text');
  assert.equal(answerOnce({ text: '  391 ', exact: { answer: '391' } }).mode, 'equal');
  assert.equal(answerOnce({ text: 'a\nb\n391', exact: { answer: '391' } }).head, 'a\nb');
  console.log('once  native tail: answer printed ' + count(h, '>' + answer + '<') + ' time(s); exact tail ' + count(ex, '>391<') + '; equal ' + count(eq, '>' + answer + '<'));
});

test('the tab view functions are the page functions byte for byte, and the clock prints a positive median', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  for (const [name, fn] of Object.entries(PAGE_FUNCTIONS)) assert.ok(html.includes(fn.toString()), name + ' is in the page byte for byte');
  assert.ok(!html.includes('function toHtml'), 'the node side serialiser is not in the page: the page mounts, it never writes markup');
  // the *Html serialisations the benches read are the views, serialised
  assert.equal(refusedHtml(['a'], null, null), toHtml(pendingView(0)) + toHtml(refusalView(['a'], null, null)));
  const c = clock(() => converse('hey'));
  assert.ok(Number.isInteger(c.ns) && c.ns >= 1 && c.asks >= 56, JSON.stringify(c));
  const h = tabNativeHtml(converse('hey'), c);
  assert.match(h, new RegExp('data-ns="' + c.ns + '"'));
});

// ---------------------------------------------------------------- the chat (pocket-frontier-surface)

test('a follow-up is carried by act/thread.mjs: "and germany?" is asked of every reader and POSTed as the question it stands for, with one dim "read as" line; "plus 9" is answered in the tab', async () => {
  const asked = [];
  const p = await runPage({ asked });
  p.setReply(memory('Paris is the capital of France.'));
  const a = await p.send('what is the capital of france');
  assert.equal(a.read, null);
  assert.equal(entries(p)[0].querySelectorAll('[data-read]').length, 0, 'a prompt that stands alone prints no read-as line');
  p.setReply(memory('Berlin is the capital of Germany.'));
  asked.length = 0;
  const b = await p.send('and germany?');
  assert.equal(b.read, 'what is the capital of germany');
  assert.deepEqual(p.calls.map((c) => JSON.parse(c.init.body).prompt), ['what is the capital of france', 'what is the capital of germany']);
  assert.deepEqual(asked.map((x) => x[0]), ['converse', 'readExact', 'route']);
  for (const [name, q] of asked) assert.equal(q, 'what is the capital of germany', name + ' got the standalone prompt');
  assert.equal(typeof asked[1][2].word, 'function', 'the exact reader is asked with the word problem reader');
  const e = last(p);
  const reads = e.querySelectorAll('[data-read]');
  assert.equal(reads.length, 1);
  assert.equal(reads[0].textContent, 'read as: what is the capital of germany');
  assert.ok(reads[0].getAttribute('class').split(' ').includes('dim'));
  assert.equal(e.querySelector('.you').textContent, '> and germany?', 'the turn shows what was typed');
  const c = await p.send('what is 17 times 23');
  assert.equal(c.answer, '391');
  const d = await p.send('plus 9');
  assert.deepEqual({ tab: d.tab, answer: d.answer, read: d.read }, { tab: true, answer: '400', read: 'what is 391 plus 9' });
  assert.equal(p.calls.length, 2, 'the carried sum made no request');
  assert.equal(last(p).querySelector('[data-read]').textContent, 'read as: what is 391 plus 9');
  assert.equal(stored(p).at(-1).read, 'what is 391 plus 9');
  // the same follow-up with no turn before it stands alone and is asked as typed
  const q = await runPage();
  q.setReply(memory('nothing in memory matches germany.'));
  const r = await q.send('and germany?');
  assert.equal(r.read, null);
  assert.equal(JSON.parse(q.calls[0].init.body).prompt, 'and germany?');
  assert.equal(last(q).querySelectorAll('[data-read]').length, 0);
});

test('one prompt at a time: a follow-up typed while the answer before it is in flight is carried against that answer', async () => {
  const p = await runPage();
  let release;
  const gate = new Promise((ok) => { release = ok; });
  p.setReply({ status: 200, headers: { get: () => null }, json: () => gate });
  const first = p.send('what is the capital of france');
  const second = p.send('and germany?');
  try {
    await until(() => p.calls.length === 1);
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(p.calls.length, 1, 'the follow-up waited for the answer before it');
    p.setReply(memory('Berlin.'));
  } finally {
    release({ ok: true, text: 'Paris.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 1, host: 'local', knowledge: { ready: true } });
  }
  await first;
  const b = await second;
  assert.equal(b.read, 'what is the capital of germany');
  assert.deepEqual(p.calls.map((c) => JSON.parse(c.init.body).prompt), ['what is the capital of france', 'what is the capital of germany']);
  assert.deepEqual(p.turns().map((t) => t.prompt), ['what is the capital of france', 'and germany?']);
});

test('a prompt a grown cell carries is answered IN THE TAB by the cell web/pocket.mjs bundled: route line "grown cell <id>, generation <n>, no server", no request, the text the server gives', async () => {
  const want = grownAnswer('capital of Japan');
  assert.ok(want && want.id === 'capital-of-direct-g1', 'the server answers it by a grown cell');
  const row = JSON.parse(readFileSync(path.join(DIST, 'organism', 'cells.json'), 'utf8')).cells.find((r) => r.id === want.id);
  const p = await runPage();
  const t = await p.send('capital of Japan');
  assert.equal(p.calls.length, 0, 'a cell answer made a request');
  assert.deepEqual({ tab: t.tab, route: t.route, provenance: t.provenance, cell: t.cell, generation: t.generation, answer: t.answer },
    { tab: true, route: 'cell', provenance: 'grown', cell: want.id, generation: row.generation, answer: want.answer });
  const line = 'grown cell ' + want.id + ', generation ' + row.generation + ', no server';
  const e = last(p);
  const foot = e.querySelector('[data-route="cell"]');
  assert.equal(foot.getAttribute('data-provenance'), 'grown');
  assert.equal(foot.querySelector('.ok').textContent, line);
  assert.match(foot.textContent, /^route grown cell .*  model none  tokens 0  [\d.]+ ms in this tab$/);
  assert.equal(e.querySelector('[data-cell]').textContent, want.answer);
  assert.equal(e.querySelector('[data-cell]').getAttribute('data-cell'), want.id);
  assert.equal(e.querySelectorAll('[data-refusal]').length + e.querySelectorAll('[data-server-pending]').length, 0, 'no refusal and no server block');
  assert.equal(stored(p)[0].route, line);
  assert.equal(stored(p)[0].text, want.answer);
  // the cells are read from the page's own origin, cells.json once, a cell only under /organism/cells/
  await p.send('capital of Japan');
  assert.deepEqual(p.bases, [ORIGIN + '/organism/']);
  assert.deepEqual(p.cellFetches, [ORIGIN + '/organism/cells.json']);
  assert.ok(p.imported.length > 0 && p.imported.every((u) => u.startsWith(ORIGIN + '/organism/cells/')), p.imported.join(' '));
  // cells.json that does not load: the prompt goes to the server and the refusal says why no cell was asked
  const q = await runPage({ cells: { index: { nope: 1 }, mod: null } });
  q.setReply(memory('nothing.'));
  await q.send('capital of Japan');
  assert.equal(q.calls.length, 1);
  assert.match(last(q).querySelector('[data-cells]').textContent, /^the grown cells did not load in this tab \(cells-tab: .*\), so none was asked\.$/);
});


test('the order of the tab: carry, the conversation region, the exact reader (with the word reader), the grown cells, a cell grown on this device, then the server', async () => {
  const flow = [];
  const p = await runPage({ flow });
  p.setReply(memory('nothing in memory matches rome.'));
  await p.send(SERVER_ONLY);
  assert.deepEqual(flow, ['carry', 'converse', 'readExact', 'route', 'device', 'server']);
  assert.match(last(p).querySelector('[data-cells]').textContent, /^the grown cells in this tab: none of the \d+ carries it\.$/);
  flow.length = 0;
  await p.send('capital of Japan');
  assert.deepEqual(flow, ['carry', 'converse', 'readExact', 'route']);
  flow.length = 0;
  const t = await p.send('what is 17 times 23');
  assert.equal(t.route, 'exact');
  assert.deepEqual(flow.slice(0, 3), ['carry', 'converse', 'readExact']);
  assert.ok(!flow.includes('route') && !flow.includes('server') && !flow.includes('device'), flow.join(','));
  flow.length = 0;
  const w = await p.send(EXAMPLES.find((x) => /Natalia/.test(x)));
  assert.equal(w.route, 'exact', 'the word problem reader answers inside the exact reader');
  assert.ok(!flow.includes('route') && !flow.includes('server'), flow.join(','));
  flow.length = 0;
  await p.send('hey');
  assert.deepEqual(flow.slice(0, 2), ['carry', 'converse']);
  assert.ok(!flow.includes('readExact') && !flow.includes('route'), flow.join(','));
  assert.deepEqual(p.dynamic, [BODY_URL], 'the body is imported once, apart');
});

test('offline: a prompt no tab reader carries prints ONE honest line in place of the server block, no spinner and no request; the tab readers and the cells still answer', async () => {
  const nav = { onLine: false };
  const p = await runPage({ nav });
  const r = await p.send(SERVER_ONLY);
  assert.equal(r.offline, true);
  assert.equal(p.calls.length, 0, 'offline, nothing was sent');
  const e = last(p);
  const off = e.querySelectorAll('[data-offline]');
  assert.equal(off.length, 1);
  assert.equal(off[0].textContent, OFFLINE_LINE);
  assert.ok(!e.innerHTML.includes(PENDING_LINE), 'no spinner line');
  assert.equal(e.querySelectorAll('[data-server-pending]').length, 0);
  assert.ok(e.innerHTML.indexOf('data-offline') < e.innerHTML.indexOf('data-refusal="1"'), 'the line first, the refusal lines after it');
  assert.equal((await p.send('what is 17 times 23')).answer, '391');
  assert.equal((await p.send('capital of Japan')).route, 'cell');
  assert.equal(p.calls.length, 0);
  // the network drops while the request is out: the same line, not the error
  const nav2 = { onLine: true };
  const q = await runPage({ nav: nav2 });
  q.setReply(() => { nav2.onLine = false; return new TypeError('Failed to fetch'); });
  const s = await q.send(SERVER_ONLY);
  assert.equal(s.offline, true);
  assert.equal(q.calls.length, 1);
  assert.equal(last(q).querySelector('[data-offline]').textContent, OFFLINE_LINE);
  assert.ok(!last(q).innerHTML.includes(PENDING_LINE));
  assert.doesNotMatch(last(q).innerHTML, /did not answer/);
});

const EVIL = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
const VIEW_TAGS = ['div', 'pre', 'span', 'b', 'code'];
const foreign = (el) => el.elements.map((c) => c.localName).filter((t) => !VIEW_TAGS.includes(t));

test('text is text: a server answer, a cell answer, a stored turn and the prompt reach the DOM as text nodes, never markup', async () => {
  const p = await runPage();
  p.setReply(respond(200, { ok: true, text: EVIL, route: '<b>r</b>', provenance: { answer: '<i>m</i>' }, serverUs: 1, host: '<x>', knowledge: { ready: true } }));
  const r = await p.send(EVIL);
  assert.equal(r.tab, false);
  const e = last(p);
  assert.deepEqual(foreign(e), []);
  assert.equal(e.querySelector('.srvtext').textContent, EVIL);
  assert.equal(e.querySelector('.you').textContent, '> ' + EVIL);
  assert.equal(e.querySelector('[data-srv-route]').getAttribute('data-srv-route'), '<b>r</b>');
  assert.ok(e.innerHTML.includes(esc(EVIL)) && !e.innerHTML.includes(EVIL));
  // a cell's text (a planted cell, served as the origin would serve it)
  const cells = { index: { generation: 7, cells: [{ id: 'evil-cell-g7', class: 'evil', generation: 7, file: 'cells/evil-cell-g7.mjs' }] }, mod: { meta: { id: 'evil-cell-g7', class: 'evil' }, can: () => true, answer: () => EVIL } };
  const q = await runPage({ cells });
  const t = await q.send(SERVER_ONLY);
  assert.equal(t.route, 'cell');
  assert.equal(q.calls.length, 0);
  const ce = last(q);
  assert.deepEqual(foreign(ce), []);
  assert.equal(ce.querySelector('[data-cell]').textContent, EVIL);
  assert.equal(ce.querySelector('[data-route="cell"]').querySelector('.ok').textContent, 'grown cell evil-cell-g7, generation 7, no server');
  // a stored turn read back after a reload
  const store = memStore({ [THREAD_KEY]: JSON.stringify([{ prompt: EVIL, text: EVIL, route: '<b>' + EVIL + '</b>', read: EVIL }]) });
  const s = await runPage({ store });
  const re = s.term.children[0];
  assert.equal(re.getAttribute('data-restored'), '1');
  assert.deepEqual(foreign(re), []);
  assert.equal(re.querySelector('.reply').textContent, EVIL);
  assert.equal(re.querySelector('[data-read]').textContent, 'read as: ' + EVIL);
  assert.equal(re.querySelector('.you').textContent, '> ' + EVIL);
});

test('mount() builds only its own tags and class, id and data-* attributes; anything else throws', () => {
  const doc = makeDoc();
  for (const tag of ['script', 'img', 'a', 'iframe', 'style', 'svg', 'form']) assert.throws(() => mount(doc, [tag, {}, 'x']), /^Error: mount: no </);
  for (const k of ['onclick', 'onerror', 'href', 'src', 'style', 'srcdoc', 'data-X', 'formaction']) assert.throws(() => mount(doc, ['div', { [k]: 'x' }]), /^Error: mount: no /);
  const view = ['div', { class: 'a', id: 'b', 'data-x-y': '<q>', skip: null }, '<script>1</script>', 7, null, '', ['span', {}, 'ok']];
  const el = mount(doc, view);
  assert.equal(el.html, '<div class="a" id="b" data-x-y="&lt;q&gt;">&lt;script&gt;1&lt;/script&gt;7<span>ok</span></div>');
  assert.equal(el.html, toHtml(view), 'what mount builds is what toHtml prints');
  assert.equal(el.childNodes.length, 3);
  assert.ok(el.childNodes[0] instanceof TextNode);
});

test('the page never writes markup: no innerHTML, outerHTML, insertAdjacentHTML, document.write, eval or new Function anywhere in it', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  for (const s of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'eval(', 'new Function', 'createContextualFragment', 'DOMParser', 'srcdoc']) assert.ok(!html.includes(s), s);
  const src = script(html);
  assert.match(src, /mount\(document, /);
  assert.match(html, /<div id="term" aria-live="polite">/);
  assert.ok(html.includes('<div id="term" aria-live="polite">' + toHtml(helloView()) + '</div>'), 'the empty thread is the hello line');
});

test('the service worker /ask/sw.js (scope /, so it controls /ask and the body under /organism/) is registered only when serviceWorker is in navigator and the page is on https or localhost', async () => {
  assert.equal(SW_URL, '/ask/sw.js');
  assert.equal(SW_SCOPE, '/');
  const cases = [
    [{}, true],
    [{ protocol: 'http:', hostname: 'dilation.dev', href: 'http://dilation.dev/ask' }, false],
    [{ protocol: 'http:', hostname: 'localhost', href: 'http://localhost:8080/ask' }, true],
    [{ protocol: 'http:', hostname: '127.0.0.1', href: 'http://127.0.0.1:8080/ask' }, true],
    [{ protocol: 'http:', hostname: '192.168.1.5', href: 'http://192.168.1.5/ask' }, false],
    [{ protocol: 'file:', hostname: '', href: 'file:///C:/ask/index.html' }, false],
  ];
  for (const [loc, want] of cases) {
    const regs = [];
    const nav = { onLine: true, serviceWorker: { register: (u, o) => { regs.push([u, o]); return Promise.resolve({}); } } };
    await runPage({ nav, loc });
    assert.deepEqual(regs, want ? [[SW_URL, { scope: SW_SCOPE }]] : [], JSON.stringify(loc));
  }
  // the old registration of the same worker under /ask/ (which never controlled /ask) is removed; no other is touched
  const gone = [];
  const reg = (scope, script) => ({ scope: ORIGIN + scope, active: { scriptURL: ORIGIN + script }, unregister: () => { gone.push(scope); return Promise.resolve(true); } });
  const regsNow = [reg('/ask/', '/ask/sw.js'), reg('/', '/ask/sw.js'), reg('/other/', '/other/sw.js'), { scope: ORIGIN + '/ask/', installing: { scriptURL: ORIGIN + '/elsewhere/sw.js' }, unregister: () => { gone.push('foreign'); } }];
  await runPage({ nav: { onLine: true, serviceWorker: { register: () => Promise.resolve({}), getRegistrations: () => Promise.resolve(regsNow) } } });
  await until(() => gone.length >= 1);
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(gone, ['/ask/']);
  // no serviceWorker in navigator, or a register that throws or rejects, or a getRegistrations that throws: nothing breaks
  const plain = await runPage({ nav: { onLine: true } });
  assert.equal((await plain.send('what is 17 times 23')).answer, '391');
  const throws = await runPage({ nav: { onLine: true, serviceWorker: { register: () => { throw new Error('denied'); } } } });
  assert.equal((await throws.send('what is 17 times 23')).answer, '391');
  const rejects = await runPage({ nav: { onLine: true, serviceWorker: { register: () => Promise.reject(new Error('denied')), getRegistrations: () => { throw new Error('denied'); } } } });
  assert.equal((await rejects.send('what is 17 times 23')).answer, '391');
  assert.equal(swAllowed({}, { protocol: 'https:' }), false);
  assert.equal(swAllowed(null, { protocol: 'https:' }), false);
  assert.equal(swAllowed({ serviceWorker: {} }, null), false);
  assert.equal(swAllowed({ serviceWorker: {} }, { protocol: 'http:', hostname: 'app.localhost' }), true);
  assert.equal(swAllowed({ serviceWorker: {} }, { protocol: 'http:', hostname: '[::1]' }), true);
  assert.equal(swAllowed({ serviceWorker: {} }, { protocol: 'http:', hostname: 'localhost.example.com' }), false);
});

test('the head links the manifest, sets the theme colour to the body background (what the manifest takes) and the apple mobile web app metas', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  assert.ok(head.includes(POCKET_HEAD), 'the manifest and icon links');
  assert.match(head, /<link rel="manifest" href="\/ask\/manifest\.webmanifest">/);
  const theme = /<meta name="theme-color" content="([^"]+)">/.exec(head);
  assert.ok(theme, 'a theme-color meta');
  assert.equal(theme[1], BACKGROUND);
  assert.equal(askColors(html).theme, theme[1], 'the theme colour is the body background');
  const wm = JSON.parse(readFileSync(path.join(DIST, 'ask', 'manifest.webmanifest'), 'utf8'));
  assert.equal(wm.theme_color, theme[1]);
  assert.equal(wm.background_color, BACKGROUND);
  assert.match(head, /<meta name="mobile-web-app-capable" content="yes">/);
  assert.match(head, /<meta name="apple-mobile-web-app-capable" content="yes">/);
  assert.match(head, /<meta name="apple-mobile-web-app-title" content="Dilation">/);
  assert.match(head, /<meta name="apple-mobile-web-app-status-bar-style" content="black">/);
});

test('generateAsk() writes the pocket beside the page: cells.json, the cells, the body, the core, the manifest, the icon and /ask/sw.js precaching the page it just wrote', (t) => {
  const dist = tmp('gen');
  const r = generateAsk(dist, { root: FIX });
  for (const f of ['ask/index.html', 'ask/sw.js', 'ask/manifest.webmanifest', 'ask/icon.svg', 'organism/cells.json', 'organism/manifest.json', 'organism/act/thread.mjs', 'organism/act/cells-tab.mjs',
    'organism/web/pocket-era.mjs', 'organism/grow/neo-core.mjs', 'organism/grow/neo-kernel.mjs', 'organism/era/tasks.json']) assert.ok(existsSync(path.join(dist, ...f.split('/'))), f);
  const index = JSON.parse(readFileSync(path.join(dist, 'organism', 'cells.json'), 'utf8'));
  assert.deepEqual(index.cells.map((x) => x.id), [CAPITAL, REVERSE], 'THE GATE: the unmastered colony is not bundled');
  assert.equal(existsSync(path.join(dist, 'organism', 'cells', SILENT + '.mjs')), false);
  assert.equal(r.pocket.cells, index.cells.length);
  for (const row of index.cells) assert.ok(existsSync(path.join(dist, 'organism', ...row.file.split('/'))), row.file);
  const sw = readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8');
  for (const u of ['/organism/act/thread.mjs', '/organism/act/cells-tab.mjs', '/organism/act/converse.mjs', '/organism/cells.json', '/organism/' + index.cells[0].file, '/organism/web/pocket-era.mjs', '/organism/grow/neo-core.mjs']) assert.ok(sw.includes('{"url":"' + u + '","sha256":"'), u);
  assert.ok(sw.includes('{"url":"/ask","sha256":"' + sha(path.join(dist, 'ask', 'index.html')) + '"}'), 'the precached page is the page generateAsk wrote, at the URL the host serves it');
  assert.ok(!sw.includes(SILENT));
  assert.equal(r.bytes, Buffer.byteLength(readFileSync(path.join(dist, 'ask', 'index.html'))));
  // the build is a function of the tree it reads: the same fixture, the same bytes
  assert.equal(readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8'), readFileSync(path.join(DIST, 'ask', 'sw.js'), 'utf8'));
  t.diagnostic('pocket  cells ' + r.pocket.cells + '  precache ' + r.pocket.precache + ' files  ' + r.pocket.bytes + ' bytes');
});


test('the thread survives a reload: ONE localStorage key, the newest 20 turns of { prompt, text, read?, route? }, nothing else stored', async () => {
  assert.equal(KEEP_TURNS, 20);
  const store = memStore();
  const p = await runPage({ store });
  for (let i = 1; i <= 25; i++) await p.send('what is ' + i + ' times 2');
  assert.deepEqual([...store.map.keys()], [THREAD_KEY]);
  const turns = stored(p);
  assert.equal(turns.length, KEEP_TURNS);
  assert.deepEqual(turns.map((x) => x.prompt), Array.from({ length: 20 }, (_, k) => 'what is ' + (k + 6) + ' times 2'));
  for (const x of turns) assert.deepEqual(Object.keys(x).filter((k) => !['prompt', 'text', 'read', 'route'].includes(k)), [], JSON.stringify(x));
  assert.equal(turns.at(-1).text, '50');
  assert.equal(p.turns().length, 20);
  assert.equal(entries(p).length, 25, 'the page keeps every turn of this visit on screen');
  // the reload
  const q = await runPage({ store });
  assert.ok(q.term.querySelector('#hello') === null, 'no hello line over a restored thread');
  const back = q.term.children;
  assert.equal(back.length, 20);
  assert.ok(back.every((x) => x.getAttribute('data-restored') === '1'));
  assert.equal(back[19].querySelector('.reply').textContent, '50');
  assert.equal(back[19].querySelector('.you').textContent, '> what is 25 times 2');
  assert.match(back[19].querySelector('.foot').textContent, /^restored from this device: exact, method /);
  assert.ok(q.doc.scrolled.at(-1) === back[19], 'the restored thread scrolls to its newest turn');
  const f = await q.send('plus 9');
  assert.deepEqual({ read: f.read, answer: f.answer }, { read: 'what is 50 plus 9', answer: '59' });
  assert.equal(stored(q).length, 20);
  assert.deepEqual([...store.map.keys()], [THREAD_KEY]);
});

test('a store that throws, corrupt JSON or 500 stored turns is an empty or a capped thread, never a broken page; the page writes only its own key', async () => {
  const p = await runPage({ store: 'throws' });
  assert.equal((await p.send('what is 17 times 23')).answer, '391');
  const bad = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('denied'); } };
  const q = await runPage({ store: bad });
  assert.equal((await q.send('what is 17 times 23')).answer, '391');
  q.newChat();
  assert.ok(q.term.querySelector('#hello'));
  const c = await runPage({ store: memStore({ [THREAD_KEY]: '{not json' }) });
  assert.ok(c.term.querySelector('#hello'));
  assert.equal(c.turns().length, 0);
  const many = Array.from({ length: 500 }, (_, i) => ({ prompt: 'q' + i, text: 'a' + i, secret: 'x', route: 'r' }));
  const store = memStore({ [THREAD_KEY]: JSON.stringify(many), other: 'kept' });
  const m = await runPage({ store });
  assert.equal(m.term.children.length, 20);
  assert.equal(m.term.children[0].querySelector('.you').textContent, '> q480');
  await m.send('what is 17 times 23');
  const s = JSON.parse(store.getItem(THREAD_KEY));
  assert.equal(s.length, 20);
  assert.equal(s[0].prompt, 'q481');
  assert.ok(s.every((x) => !('secret' in x)), 'only prompt, text, read and route are stored');
  assert.equal(store.getItem('other'), 'kept', 'the page writes its own key only');
  // a long answer is stored as its head and its last lines (the numeric answer a follow-up reads)
  const r = await runPage();
  r.setReply(memory('h'.repeat(20000) + '\nthe answer is 12345'));
  await r.send(SERVER_ONLY);
  const kept = stored(r)[0].text;
  assert.ok(kept.length <= TEXT_CAP && kept.endsWith('the answer is 12345') && kept.startsWith('hhh'), String(kept.length));
  assert.equal(clip('short'), 'short');
  assert.deepEqual(cleanTurns([{ prompt: '  a ', text: 'b' }, { prompt: '', text: 'x' }, { prompt: 1, text: 'x' }, null, { prompt: 'c', text: 2 }, 'x']), [{ prompt: 'a', text: 'b' }]);
  assert.deepEqual(cleanTurns({ prompt: 'a', text: 'b' }), []);
  assert.deepEqual(loadTurns(null), []);
  assert.equal(saveTurns(null, []), false);
  assert.equal(saveTurns(bad, [{ prompt: 'a', text: 'b' }]), false);
});

test('"new chat" clears the thread on the page and in the store, and the next follow-up is not read against the old turns', async () => {
  const store = memStore();
  const p = await runPage({ store });
  p.setReply(memory('Paris.'));
  await p.send('what is the capital of france');
  await p.send('what is 17 times 23');
  assert.equal(store.map.size, 1);
  p.newBtn.fire('click');
  assert.equal(store.map.size, 0, 'the stored thread is removed');
  assert.deepEqual(p.turns(), []);
  assert.equal(p.term.children.length, 1);
  assert.equal(p.term.children[0].id, 'hello');
  assert.equal(p.term.children[0].textContent, HELLO_LINE);
  assert.ok(p.doc.focused === p.box, 'the box has the focus');
  p.setReply(memory('nothing.'));
  const r = await p.send('and germany?');
  assert.equal(r.read, null, 'carried against a cleared thread');
  assert.equal(JSON.parse(p.calls.at(-1).init.body).prompt, 'and germany?');
  const again = await runPage({ store });
  assert.equal(again.term.children.length, 1, 'a reload after a new chat shows its one new turn');
});

test('a new chat while an answer is in flight: the old answer is not written to the new thread, and a prompt still at the cells is not sent', async () => {
  const store = memStore();
  const p = await runPage({ store });
  let release;
  const gate = new Promise((ok) => { release = ok; });
  p.setReply({ status: 200, headers: { get: () => null }, json: () => gate });
  const pending = p.send(SERVER_ONLY);
  try {
    await until(() => p.calls.length === 1);
    p.newChat();
  } finally {
    release({ ok: true, text: 'late', route: 'direct', provenance: { answer: 'memory' }, serverUs: 1, host: 'local', knowledge: { ready: true } });
  }
  await pending;
  assert.deepEqual(p.turns(), []);
  assert.equal(store.map.size, 0);
  assert.equal(p.term.children.length, 1);
  assert.equal(p.term.children[0].id, 'hello');
  let open;
  const cellsGate = new Promise((ok) => { open = ok; });
  const q = await runPage({ cellsGate });
  q.setReply(memory('never asked'));
  const out = q.send(SERVER_ONLY);
  try {
    await until(() => q.bases.length === 1);
    q.newChat();
  } finally {
    open();
  }
  const r = await out;
  assert.equal(r.dropped, true);
  assert.equal(q.calls.length, 0, 'a prompt of the cleared thread was sent');
});

test('Enter sends and Shift+Enter is a new line; the box empties on send; the form and a chip send too', async () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  assert.match(html, /<textarea id="q" name="q" rows="1"[^>]*enterkeyhint="send"/);
  const p = await runPage();
  p.box.value = 'what is 17 times 23';
  const shift = p.box.fire('keydown', { key: 'Enter', shiftKey: true });
  assert.equal(shift.prevented, false, 'Shift+Enter is left to the textarea');
  assert.equal(p.box.value, 'what is 17 times 23');
  const ime = p.box.fire('keydown', { key: 'Enter', isComposing: true });
  assert.equal(ime.prevented, false);
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(entries(p).length, 0);
  const ev = p.box.fire('keydown', { key: 'Enter' });
  assert.equal(ev.prevented, true);
  assert.equal(p.box.value, '');
  await until(() => entries(p).length === 1 && entries(p)[0].querySelector('[data-answer]'));
  assert.equal(entries(p)[0].querySelector('[data-answer]').textContent, '391');
  p.box.value = 'what is 2 times 2';
  assert.equal(p.form.fire('submit').prevented, true);
  await until(() => entries(p).length === 2 && entries(p)[1].querySelector('[data-answer]'));
  assert.equal(entries(p)[1].querySelector('[data-answer]').textContent, '4');
  p.chips[0].fire('click');
  await until(() => entries(p).length === 3 && entries(p)[2].querySelector('[data-answer]'));
  assert.equal(entries(p)[2].querySelector('[data-answer]').textContent, converse(p.chips[0].getAttribute('data-q')).answer);
  assert.equal(p.calls.length, 0);
  assert.equal(sendsOnKey({ key: 'Enter' }), true);
  assert.equal(sendsOnKey({ key: 'Enter', shiftKey: true }), false);
  assert.equal(sendsOnKey({ key: 'Enter', isComposing: true }), false);
  assert.equal(sendsOnKey({ key: 'Enter', keyCode: 229 }), false);
  assert.equal(sendsOnKey({ key: 'a' }), false);
  assert.equal(sendsOnKey(null), false);
});

test('the thread scrolls to the newest turn, at the prompt and again at its answer', async () => {
  const p = await runPage();
  await p.send('what is 17 times 23');
  assert.ok(p.doc.scrolled.at(-1) === entries(p)[0], 'scrolled to the answered turn');
  let release;
  const gate = new Promise((ok) => { release = ok; });
  p.setReply({ status: 200, headers: { get: () => null }, json: () => gate });
  const pending = p.send(SERVER_ONLY);
  let e = null, n = 0;
  try {
    await until(() => p.calls.length === 1);
    e = entries(p)[1];
    assert.ok(p.doc.scrolled.at(-1) === e, 'scrolled to the new turn while it is in flight');
    n = p.doc.scrolled.length;
  } finally {
    release({ ok: true, text: 'nothing.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 1, host: 'local', knowledge: { ready: true } });
  }
  await pending;
  assert.ok(p.doc.scrolled.length > n && p.doc.scrolled.at(-1) === e, 'scrolled again when the answer landed');
});

test('the box stays at the bottom and the look is kept: a sticky form, the same fonts and colours, the dim class', () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  assert.match(css, /form \{[^}]*position: sticky; bottom: 0;/);
  assert.match(css, /form \{[^}]*background: #02030a;/);
  assert.match(css, /html, body \{[^}]*background: #02030a;[^}]*font: 13px\/1\.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;/);
  assert.match(css, /--dim: #7f8ba6;/);
  assert.match(css, /--ok: #7fffb0;/);
  assert.match(css, /--acc: #7fb0ff;/);
  assert.match(css, /\.dim \{ color: var\(--dim\); \}/);
  assert.match(css, /#q \{[^}]*resize: none;[^}]*max-height: 40vh;/);
  assert.match(html, /<button id="new" type="button">new chat<\/button>/);
  assert.ok(html.indexOf('id="term"') < html.indexOf('<form id="f"'), 'the box is below the thread');
});


const FIXTURE_PROMPTS = [...Object.values(TASKS).flat().map((r) => r.q), 'capital of Japan', 'Capital of Japan', 'capital of france', 'reverse the word', 'reverse the word a b c d e', 'write a poem about the sea', 'hey', 'what is 17 times 23'];

test('every fixture prompt the tab answers by a grown cell gets the cell and the text the server (grownAnswer, THE GATE inside) gives, and none a cell carries is sent to the server', async (t) => {
  const p = await runPage();
  p.setReply(memory('nothing.'));
  let byCell = 0, byTab = 0, bySrv = 0, shadow = 0;
  for (const q of FIXTURE_PROMPTS) {
    p.newChat();
    const s = grownAnswer(q);
    const a = await p.send(q);
    assert.ok(a, q);
    if (a.route === 'cell') {
      byCell++;
      assert.deepEqual({ cell: a.cell, answer: a.answer }, { cell: s && s.id, answer: s && s.answer }, q);
    } else if (a.tab) {
      byTab++;
      if (s) shadow++;
    } else {
      bySrv++;
      assert.equal(s, null, 'the tab sent to the server a prompt a grown cell carries: ' + q);
    }
  }
  assert.equal(byCell, TASKS['reverse-word'].length + 2, 'every reverse prompt by the colony, both capital of Japan prompts by the locked cell');
  assert.ok(bySrv >= TASKS.sum.length + TASKS['count-letters'].length, 'the unmastered colony and the task no cell carries went to the server');
  t.diagnostic('fixture prompts ' + FIXTURE_PROMPTS.length + ': by a grown cell in the tab ' + byCell + ' (cell and text equal to grownAnswer), by converse or the exact reader ' + byTab + ' (a grown cell also carries ' + shadow + ' of them), to the server ' + bySrv);
});

test('THE GATE on the page: the unmastered colony is neither bundled nor asked; a serving colony whose can is always true is imported and asked only on an exact template fit', async () => {
  const rows = JSON.parse(readFileSync(path.join(DIST, 'organism', 'cells.json'), 'utf8')).cells;
  assert.deepEqual(rows.map((r) => r.id), [CAPITAL, REVERSE]);
  assert.deepEqual([rows[1].serve, rows[1].templates], [true, ['reverse the word {1-3}']]);
  assert.equal(existsSync(path.join(DIST, 'organism', 'cells', SILENT + '.mjs')), false, 'the unmastered colony is not bundled');
  assert.equal(grownAnswer('sum of 2 and 3'), null, 'nor served');
  const p = await runPage();
  p.setReply(memory('nothing in memory matches sum.'));
  const s = await p.send('sum of 2 and 3');
  assert.equal(s.tab, false, 'the unmastered colony answered in the tab');
  assert.equal(p.calls.length, 1);
  const ids = () => p.imported.map((u) => u.split('/').pop().replace(/\.mjs$/, ''));
  assert.deepEqual(ids(), [CAPITAL], 'a colony whose template does not fit was imported');
  await p.send('write a poem about the sea');
  assert.deepEqual(ids(), [CAPITAL]);
  const r = await p.send('reverse the word apple');
  assert.deepEqual({ route: r.route, cell: r.cell, answer: r.answer }, { route: 'cell', cell: REVERSE, answer: 'elppa' });
  assert.deepEqual(ids(), [CAPITAL, REVERSE]);
  assert.equal(p.calls.length, 2, 'the colony answer made no request');
  // the body module does not load: no template test, so no colony is asked; the locked cell still is
  const q = await runPage({ era: null });
  q.setReply(memory('nothing.'));
  const n = await q.send('reverse the word apple');
  assert.equal(n.tab, false);
  assert.equal(q.calls.length, 1);
  assert.ok(!q.imported.some((u) => u.includes(REVERSE)), q.imported.join(' '));
  assert.equal((await q.send('capital of Japan')).cell, CAPITAL);
  assert.equal(q.bodySw.hidden, true, 'no body, no switch');
  assert.equal(q.bodyLineEl.textContent, '');
  // a body whose template test says anything but exactly true is a closed gate
  for (const gateFits of [() => 'true', () => 1, () => { throw new Error('broken core'); }, async () => false]) {
    const g = await runPage({ era: { ...realEra, gateFits } });
    g.setReply(memory('nothing.'));
    assert.equal((await g.send('reverse the word apple')).tab, false);
    assert.ok(!g.imported.some((u) => u.includes(REVERSE)));
  }
});

test('a cell grown on THIS device answers in the tab after the cloud cells and before the server: route device, its route line, no request, its turn stored', async () => {
  const seen = [];
  const device = async (q) => { seen.push(q); return q === 'how many letters in apple' ? { text: '5', task: 'count-letters', cells: 2, route: ROUTE_LINE } : null; };
  const store = memStore();
  const p = await runPage({ store, era: { ...realEra, deviceAnswer: device } });
  p.setReply(memory('nothing.'));
  const t = await p.send('how many letters in apple');
  assert.deepEqual({ tab: t.tab, route: t.route, provenance: t.provenance, task: t.task, answer: t.answer }, { tab: true, route: 'device', provenance: 'grown', task: 'count-letters', answer: '5' });
  assert.equal(p.calls.length, 0, 'a device answer made a request');
  const e = last(p);
  const foot = e.querySelector('[data-route="device"]');
  assert.equal(foot.getAttribute('data-provenance'), 'grown');
  assert.equal(foot.querySelector('.ok').textContent, ROUTE_LINE);
  assert.equal(DEVICE_ROUTE, ROUTE_LINE);
  assert.equal(ROUTE_LINE, 'grown on this device, no server');
  assert.equal(foot.textContent, 'route ' + ROUTE_LINE + '  task count-letters  cells 2  model none  tokens 0');
  assert.equal(e.querySelector('[data-device]').textContent, '5');
  assert.equal(e.querySelectorAll('[data-server-pending]').length + e.querySelectorAll('[data-refusal]').length, 0);
  assert.deepEqual(stored(p)[0], { prompt: 'how many letters in apple', text: '5', route: ROUTE_LINE + ', task count-letters' });
  assert.equal(toHtml(deviceView({ text: '<b>', task: 't', cells: 1 })).includes('<b>'), false, 'text is text');
  // the cloud's cells first: a prompt they carry never reaches the device
  seen.length = 0;
  assert.equal((await p.send('reverse the word apple')).route, 'cell');
  assert.equal((await p.send('what is 2 times 2')).route, 'exact');
  assert.deepEqual(seen, []);
  // a prompt the device does not carry, or a device that throws, goes to the server
  assert.equal((await p.send('how many letters in river')).tab, false);
  assert.equal(p.calls.length, 1);
  const bad = await runPage({ era: { ...realEra, deviceAnswer: async () => { throw new Error('store broke'); } } });
  bad.setReply(memory('nothing.'));
  assert.equal((await bad.send('how many letters in apple')).tab, false);
  assert.equal(bad.calls.length, 1);
  // offline, the device still answers
  const off = await runPage({ nav: { onLine: false }, era: { ...realEra, deviceAnswer: device } });
  assert.equal((await off.send('how many letters in apple')).route, 'device');
  // the real body in node: no IndexedDB, so no device answer, and the prompt goes on to the server
  assert.equal(await realEra.deviceAnswer('how many letters in apple'), null);
});

/** A planted Worker class: records what it was built with, what it was told and whether it was stopped. */
function plantWorker() {
  const made = [];
  class FakeWorker {
    constructor(url, opts) { this.url = String(url); this.opts = opts; this.sent = []; this.ended = false; made.push(this); }
    postMessage(m) { this.sent.push(m); }
    terminate() { this.ended = true; }
  }
  return { FakeWorker, made };
}

test('THE BODY on the page: one dim line from the worker, a switch that stops it and is remembered, the page state sent to it', async () => {
  const html = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
  assert.match(html, /<div class="foot" id="bodyrow"><span id="body"><\/span> <button id="bodysw" class="chip" type="button" hidden>stop the body<\/button><\/div>/);
  assert.ok(html.includes('import(' + JSON.stringify(BODY_URL) + ')'), 'the body is imported apart, at run time');
  // no Worker in this browser: the line says so, from the store (none in node)
  const none = await runPage();
  await until(() => none.bodyLineEl.textContent !== '');
  assert.equal(none.bodyLineEl.textContent, bodyLine({ why: WHY.worker }));
  assert.equal(none.bodyLineEl.textContent, 'this device: 0 cells kept for 0 tasks, 0 tried, paused (this browser runs no module worker)');
  assert.equal(none.bodySw.hidden, false);
  // a module worker on the body's own URL, told the page's state
  const { FakeWorker, made } = plantWorker();
  const store = memStore();
  const p = await runPage({ store, Worker: FakeWorker });
  await until(() => made.length === 1 && made[0].sent.length === 1);
  const w = made[0];
  assert.ok(w.url.endsWith('/organism/web/pocket-era.mjs'), w.url);
  assert.deepEqual(w.opts, { type: 'module', name: 'pocket-era' });
  assert.deepEqual(w.sent[0], { type: 'env', stopped: false, hidden: false, saveData: false, battery: null });
  w.onmessage({ data: { type: 'status', status: { line: 'this device: 3 cells kept for 2 tasks, 900 tried, running' } } });
  assert.equal(p.bodyLineEl.textContent, 'this device: 3 cells kept for 2 tasks, 900 tried, running');
  w.onmessage({ data: { type: 'status', status: { line: 7 } } });
  w.onmessage({ data: '<b>not a status</b>' });
  assert.equal(p.bodyLineEl.textContent, 'this device: 3 cells kept for 2 tasks, 900 tried, running', 'only a status line is printed');
  assert.equal(p.bodySw.textContent, 'stop the body');
  assert.equal(p.bodySw.getAttribute('aria-pressed'), 'true');
  assert.deepEqual([...store.map.keys()], [], 'the switch is written only when it is used');
  // the page hides: the worker is told
  p.doc.visibilityState = 'hidden';
  for (const f of p.doc.on.visibilitychange || []) f();
  assert.equal(w.sent.at(-1).hidden, true);
  // the switch: the worker stops, the choice is remembered, the line says why
  p.bodySw.fire('click');
  await until(() => w.ended && p.bodyLineEl.textContent.endsWith('(' + WHY.stopped + ')'));
  assert.equal(store.getItem(SWITCH_KEY), '0');
  assert.equal(p.bodySw.textContent, 'start the body');
  assert.equal(p.bodySw.getAttribute('aria-pressed'), 'false');
  // a reload keeps it stopped: no worker is started
  const q = await runPage({ store, Worker: FakeWorker });
  await until(() => q.bodyLineEl.textContent !== '');
  assert.equal(made.length, 1, 'a stopped body started a worker on reload');
  assert.equal(q.bodyLineEl.textContent, bodyLine({ why: WHY.stopped }));
  assert.equal(q.bodySw.textContent, 'start the body');
  q.bodySw.fire('click');
  await until(() => made.length === 2);
  assert.equal(store.getItem(SWITCH_KEY), '1');
  // a worker that fails is stopped and the line says so
  made[1].onerror(new Error('boom'));
  await until(() => q.bodyLineEl.textContent.endsWith('(' + WHY.failed + ')'));
  assert.equal(made[1].ended, true);
  // the chat runs beside it untouched
  assert.equal((await q.send('what is 17 times 23')).answer, '391');
});
