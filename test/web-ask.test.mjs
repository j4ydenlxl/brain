// test/web-ask.test.mjs: the prompt box on dilation.dev (web/ask.mjs, queue item 12), a SURFACE OF THE CLOUD.
// His 2026-10-02 words (grow/NEO.md head): "its should be all on cloud so even phones can use no hardware constraints
// its cloud ai". CLOUD FIRST: every prompt is POSTed to /api/ask and its answer prints with its route; the first visit
// downloads the page and nothing of the organism before it can ask; the device tier (the conversation region, the exact
// and word readers, the grown cells, a cell grown on this device) is only the offline fallback and says so; the device
// worker is off by default. IT FEELS LIKE AN LLM: a thread that survives a reload, follow-ups that carry the last
// relation, an answer streamed as it arrives when the endpoint streams, a miss that says the cloud took it as a task.
// THE LIVE ORGANISM: a strip read from /alive/data.json after the first paint.
// Nothing here reads the tree's grown/ or neo/: the page is built from a FIXTURE tree written below into a temp
// directory (its grown/index.mjs rendered by grow/store.mjs renderIndexMjs, the server's own renderer).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  generateAsk, firstVisit, page, tierUrls, TIER, EXAMPLES, MODULES, ROOT, PENDING_LINE, serverHtml, answerOnce, clock, esc, mount, toHtml,
  helloView, pendingView, streamView, fallbackView, deviceMissView, offlineView, tabNativeView, cellView, deviceView, PAGE_FUNCTIONS, clip, cleanTurns, loadTurns,
  saveTurns, swAllowed, sendsOnKey, carryRelation, streamKind, readStream, missLine, viaOf, stripView, saveDataOn, THREAD_KEY, KEEP_TURNS, TEXT_CAP, BACKGROUND,
  SW_URL, SW_SCOPE, HELLO_LINE, BODY_URL, DEVICE_ROUTE, ALIVE_URL, BODY_OFF_LINE, SERVER_TIMEOUT_MS,
} from '../web/ask.mjs';
import { askColors, POCKET_HEAD } from '../web/pocket.mjs';
import { ROUTE_LINE, SWITCH_KEY, WHY, bodyLine } from '../web/pocket-era.mjs';
import { OFFLINE_LINE } from '../act/cells-tab.mjs';
import { renderIndexMjs } from '../grow/store.mjs';
import { solve } from '../act/solve.mjs';
import { converse } from '../act/converse.mjs';

const sha = (f) => crypto.createHash('sha256').update(readFileSync(f)).digest('hex');
const count = (hay, needle) => hay.split(needle).length - 1;
const ASK_PAGE_CAP = 40960;     // the /ask page alone, which is ALL a first visit downloads before it can ask
const ASK_TOTAL_CAP = 262144;   // the page plus every organism module the offline fallback may import
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
const HTML = readFileSync(path.join(DIST, 'ask', 'index.html'), 'utf8');
const { grownAnswer } = await import(pathToFileURL(path.join(FIX, 'grown', 'index.mjs')).href);
const realEra = await import(pathToFileURL(path.join(DIST, 'organism', 'web', 'pocket-era.mjs')).href);
const script = (html) => html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];

test('every organism module the fallback imports is a byte for byte copy of its source, with its sha256 in the manifest the page lists', () => {
  assert.ok(built.modules >= 2, 'exact-read and exact at least');
  for (const f of built.manifest.files) {
    assert.ok(MODULES.includes(f.file));
    assert.equal(f.sha256, sha(path.join(ROOT, f.file)), f.file + ' source');
    assert.equal(f.sha256, sha(path.join(DIST, 'organism', f.file)), f.file + ' copy');
    assert.ok(HTML.includes('<span class="port">' + f.file + ' ' + f.sha256.slice(0, 12) + '</span>'), f.file + ' listed');
  }
  const onDisk = JSON.parse(readFileSync(path.join(DIST, 'organism', 'manifest.json'), 'utf8'));
  assert.deepEqual(onDisk.files, built.manifest.files);
  assert.ok(built.manifest.files.some((f) => f.file === 'act/converse.mjs'));
});

test('the copied readers answer every page example exactly as act/solve.mjs and act/converse.mjs do', async () => {
  const read = await import(pathToFileURL(path.join(DIST, 'organism', 'act', 'exact-read.mjs')).href);
  const word = (await import(pathToFileURL(path.join(DIST, 'organism', 'act', 'word.mjs')).href)).readWord;
  const copy = await import(pathToFileURL(path.join(DIST, 'organism', 'act', 'converse.mjs')).href);
  for (const q of EXAMPLES) {
    const page = read.readExact(q, { word });
    const cli = solve(q);
    assert.equal(page ? page.answer : null, cli ? cli.answer : null, q);
    const a = copy.converse(q), b = converse(q);
    assert.equal(a ? a.answer : null, b ? b.answer : null, q);
  }
  assert.equal(read.readExact('what is 17 times 23').answer, '391');
  assert.equal(copy.converse('hey').kind, 'greeting');
});

// ---------------------------------------------------------------- (1) CLOUD FIRST: the first visit

test('FIRST PAINT WAITS FOR NOTHING OF THE ORGANISM: the page has no static import; a first visit downloads the page alone before it can ask', () => {
  const src = script(HTML);
  assert.doesNotMatch(src, /^\s*import[\s{]/m, 'a static import in the page script');
  assert.doesNotMatch(HTML, /<script\b[^>]*\bsrc=/, 'a script file the page loads by itself');
  assert.doesNotMatch(HTML, /rel="(stylesheet|modulepreload|preload)"/);
  assert.equal(count(src, 'import('), 1, 'one dynamic import, inside lazy()');
  const fv = firstVisit(DIST);
  assert.deepEqual(fv.files, []);
  assert.equal(fv.html, Buffer.byteLength(HTML));
  assert.equal(fv.bytes, fv.html);
  assert.deepEqual(built.first, fv);
  // the device tier: only the organism copies under /organism/ and the body, all imported by need
  assert.deepEqual(tierUrls(built.manifest), Object.fromEntries(Object.entries(TIER).filter(([, f]) => built.manifest.files.some((x) => x.file === f)).map(([k, f]) => [k, '../organism/' + f])));
  assert.ok(src.includes('const TIER = ' + JSON.stringify(tierUrls(built.manifest)) + ';'));
  assert.ok(src.includes('body: lazy(' + JSON.stringify(BODY_URL) + ')'));
  // two fetch targets, both on the same origin: the cloud and the live numbers
  const calls = [...src.matchAll(/\bfetch\(([^,)]*)/g)].map((m) => m[1].trim());
  assert.deepEqual(calls, ['API', JSON.stringify(ALIVE_URL)]);
  assert.match(src, /const API = '\/api\/ask';/);
  assert.doesNotMatch(HTML, /https?:\/\/[^"'\s]*\/api\//, 'no other origin');
  assert.doesNotMatch(HTML, /XMLHttpRequest|WebSocket|sendBeacon|EventSource/);
  for (const s of ['sk-', 'sk_', 'Bearer ', 'BRAIN_LLM_KEY=']) assert.ok(!HTML.includes(s), s);
  console.log('first visit  ' + fv.bytes + ' bytes before it can ask: the page alone (' + fv.html + ' bytes), 0 organism files');
});

test('firstVisit counts the static module graph of a page: every static import, recursively, once, and not a dynamic one', () => {
  const d = tmp('fv');
  const put = (rel, s) => { mkdirSync(path.dirname(path.join(d, rel)), { recursive: true }); writeFileSync(path.join(d, rel), s); };
  put('ask/index.html', '<!doctype html><script type="module">\nimport { a } from \'../organism/a.mjs\';\nimport \'../organism/side.mjs\';\nconst x = () => import(\'../organism/lazy.mjs\');\n</script><script src="/s.js" defer></script>');
  put('organism/a.mjs', "import { b } from './b.mjs';\nexport { c } from './c.mjs';\nexport const a = 1;\n");
  put('organism/b.mjs', "import { a } from './a.mjs';\nexport const b = 2;\n");
  put('organism/c.mjs', 'export const c = 3;\n');
  put('organism/side.mjs', '1;\n');
  put('organism/lazy.mjs', 'x'.repeat(5000));
  const fv = firstVisit(d);
  const by = Object.fromEntries(fv.files.map((f) => [f.url, f.bytes]));
  assert.deepEqual(Object.keys(by).sort(), ['/organism/a.mjs', '/organism/b.mjs', '/organism/c.mjs', '/organism/side.mjs']);
  assert.equal(fv.bytes, fv.html + Object.values(by).reduce((k, v) => k + v, 0));
  assert.ok(!('/organism/lazy.mjs' in by), 'a dynamic import is not a first visit download');
  // a module the page names that is not there counts 0 bytes, and a page that is not there throws
  put('organism/a.mjs', "import { z } from './missing.mjs';\n");
  assert.equal(firstVisit(d).files.find((f) => f.url === '/organism/missing.mjs').bytes, 0);
  assert.throws(() => firstVisit(tmp('none')), /no page at \/ask/);
});

test('size cap and phone width: the page is small, and nothing in it is wider than a 375 px phone', () => {
  const bytes = Buffer.byteLength(HTML);
  const total = bytes + built.manifest.files.reduce((k, f) => k + f.bytes, 0);
  assert.ok(bytes < ASK_PAGE_CAP, 'ask page ' + bytes + ' bytes over ' + ASK_PAGE_CAP);
  assert.ok(total < ASK_TOTAL_CAP, 'ask page plus modules ' + total + ' bytes over ' + ASK_TOTAL_CAP);
  console.log('size  ask/index.html ' + bytes + ' bytes (cap ' + ASK_PAGE_CAP + '), with the fallback modules ' + total + ' bytes (cap ' + ASK_TOTAL_CAP + ')');
  assert.match(HTML, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  const css = HTML.match(/<style>([\s\S]*?)<\/style>/)[1];
  for (const m of css.matchAll(/(?:^|[;{\s])(width|min-width|flex-basis)\s*:\s*(\d+)px/g)) assert.ok(Number(m[2]) <= 343, m[1] + ' ' + m[2] + 'px');
  assert.doesNotMatch(css, /white-space\s*:\s*(nowrap|pre)\s*;/, 'no unwrapped line');
  assert.match(css, /#term \{[^}]*overflow-wrap: anywhere/);
  assert.match(css, /\.entry pre \{[^}]*white-space: pre-wrap/);
  assert.match(css, /#q \{[^}]*min-width: 0/);
  assert.match(css, /#q \{[^}]*font-size: 16px/, 'a phone does not zoom the box on focus');
  assert.match(css, /\.chips \{[^}]*flex-wrap: wrap/);
  assert.match(css, /nav \{[^}]*flex-wrap: wrap/);
  assert.match(css, /\.chip \{[^}]*max-width: 100%/);
  assert.match(css, /\.strip \{[^}]*overflow-wrap: anywhere/);
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

const respond = (status, json, retry = null) => ({ status, headers: { get: (k) => (k.toLowerCase() === 'retry-after' ? retry : k.toLowerCase() === 'content-type' ? 'application/json' : null) }, json: async () => json });
const base = { llm: { provider: null, reason: 'not asked' }, serverUs: 9, host: 'cloud.test', knowledge: { ready: true } };
const memory = (text, extra = {}) => respond(200, { ok: true, text, route: 'direct', provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, ...base, ...extra });
const GROWING = 'I am growing a cell for this.';
/** The organism in the cloud, planted: the conversation region, then the exact reader, else a miss it takes as a task. */
function organism(q) {
  const n = converse(q);
  if (n) return respond(200, { ok: true, text: 'answered natively by the conversation region.\n' + n.answer, native: { kind: n.kind, answer: n.answer }, exact: null, route: 'direct', provenance: { answer: 'native' }, ...base });
  const s = solve(q);
  if (s) return respond(200, { ok: true, text: 'answered exactly by ' + s.method + '\n' + s.answer, exact: { answer: s.answer }, route: 'direct', provenance: { answer: 'exact' }, ...base });
  return respond(200, { ok: true, text: GROWING + '\nnothing in memory matches.', route: 'direct', provenance: { answer: 'memory' }, growing: { logged: true, reason: null }, ...base });
}
const cloudOf = (init) => organism(JSON.parse(init.body).prompt);

/**
 * The page script against a planted fetch (the cloud at /api/ask and the live numbers at /alive/data.json), a small
 * DOM, a planted Storage and navigator, the device tier's modules imported by need from DIST, and the grown cells served
 * from DIST as the origin would serve them: the code path, never a live network. flow records the cloud request, carry,
 * converse, readExact, route and device; asked records the prompt each reader got. era is the body module: 'real' (the
 * copy the build wrote, its deviceAnswer recorded in flow), null (the import fails) or a planted module. idle() runs
 * what the page left for after the first paint.
 */
async function runPage({ flow = null, asked = null, store = memStore(), nav = { onLine: true }, loc = {}, cells = null, cellsGate = null, era = 'real', Worker = undefined, alive = null } = {}) {
  let src = script(HTML);
  // a reader the clock calls again and again is one step of the flow: a step repeated back to back is noted once
  const note = (arr, v) => { if (arr && arr.length < 64 && (typeof v !== 'string' || arr[arr.length - 1] !== v)) arr.push(v); };
  const rec = (name, fn, at = 0) => (...a) => { note(flow, name); note(asked, [name, a[at], a[at + 1]]); return fn(...a); };
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
  const load = async (rel) => import(pathToFileURL(path.join(DIST, 'organism', rel)).href);
  const wrap = {
    'act/converse.mjs': (m) => ({ ...m, converse: rec('converse', m.converse) }),
    'act/exact-read.mjs': (m) => ({ ...m, readExact: rec('readExact', m.readExact) }),
    'act/thread.mjs': (m) => ({ ...m, carry: (...a) => { note(flow, 'carry'); return m.carry(...a); } }),
    'act/cells-tab.mjs': (m) => ({ ...m, loadCells: async (b, o = {}) => { bases.push(b); if (cellsGate) await cellsGate; return m.loadCells(b, { ...o, fetch: cellFetch, importer: cellImport }); }, route: rec('route', m.route, 1) }),
  };
  const body = era === 'real' ? { ...realEra, deviceAnswer: (...a) => { note(flow, 'device'); return realEra.deviceAnswer(...a); } } : era;
  const imp = async (u) => {
    dynamic.push(String(u));
    if (u === BODY_URL) { if (!body) throw new Error('the body did not load'); return body; }
    const rel = String(u).replace(/^\.\.\/organism\//, '');
    assert.ok(String(u).startsWith('../organism/') && MODULES.includes(rel), 'the page imports only the organism copies: ' + u);
    const m = await load(rel);
    return wrap[rel] ? wrap[rel](m) : m;
  };
  src = src.replace(/\bimport\(/g, '__imp(');
  const calls = [], aliveCalls = [];
  let reply = (url, init) => cloudOf(init);
  const fetch = async (url, init) => {
    if (url === ALIVE_URL) { aliveCalls.push(url); const a = typeof alive === 'function' ? alive() : alive; if (a instanceof Error) throw a; return a || { ok: false, status: 404, json: async () => null }; }
    assert.equal(url, '/api/ask', 'the page fetched ' + url);
    calls.push({ url, init });
    note(flow, 'cloud');
    const r = typeof reply === 'function' ? reply(url, init) : reply;
    if (r instanceof Error) throw r;
    return r;
  };
  const doc = makeDoc();
  const main = doc.body.appendChild(doc.createElement('main'));
  const newBtn = main.appendChild(doc.createElement('button'));
  newBtn.setAttribute('id', 'new');
  const strip = main.appendChild(doc.createElement('div'));
  strip.setAttribute('id', 'alive');
  strip.appendChild(doc.createTextNode('the organism, live'));
  const chips = [];
  for (const m of HTML.matchAll(/<button class="chip" type="button" data-q="([^"]*)">/g)) {
    const b = main.appendChild(doc.createElement('button'));
    b.setAttribute('class', 'chip');
    b.setAttribute('data-q', unesc(m[1]));
    chips.push(b);
  }
  // the body row as the page writes it: the off line and the switch
  const bodyRow = main.appendChild(doc.createElement('div'));
  const bodyLineEl = bodyRow.appendChild(doc.createElement('span'));
  bodyLineEl.setAttribute('id', 'body');
  bodyLineEl.textContent = BODY_OFF_LINE;
  const bodySw = bodyRow.appendChild(doc.createElement('button'));
  bodySw.setAttribute('id', 'bodysw');
  bodySw.textContent = 'grow on this device too';
  const term = main.appendChild(doc.createElement('div'));
  term.setAttribute('id', 'term');
  term.appendChild(mount(doc, helloView()));
  const form = main.appendChild(doc.createElement('form'));
  form.setAttribute('id', 'f');
  const box = form.appendChild(doc.createElement('textarea'));
  box.setAttribute('id', 'q');
  const idleQ = [];
  const window = { get localStorage() { if (store === 'throws') throw new Error('SecurityError: the store is blocked'); return store; }, requestIdleCallback: (f) => { idleQ.push(f); return idleQ.length; } };
  const location = { search: '', href: ORIGIN + '/ask', protocol: 'https:', hostname: 'dilation.dev', ...loc };
  const AsyncFunction = (async () => {}).constructor;
  await new AsyncFunction('__imp', 'document', 'window', 'location', 'navigator', 'fetch', 'Worker', src)(imp, doc, window, location, nav, fetch, Worker);
  const api = window.__brainAsk;
  const idle = async () => { while (idleQ.length) idleQ.shift()(); await new Promise((r) => setTimeout(r, 5)); };
  return { ...api, calls, aliveCalls, term, doc, box, form, newBtn, chips, store, nav, bases, cellFetches, imported, dynamic, bodyLineEl, bodySw, strip, idleQ, idle, setReply: (r) => { reply = r; } };
}
const until = async (f, ms = 5000) => { const t0 = Date.now(); while (!f()) { assert.ok(Date.now() - t0 < ms, 'timed out waiting'); await new Promise((r) => setTimeout(r, 2)); } };
const entries = (p) => p.term.children.filter((c) => c.id !== 'hello');
const last = (p) => p.term.children[p.term.children.length - 1];
const stored = (p) => JSON.parse(p.store.getItem(THREAD_KEY));
const sent = (p) => p.calls.map((c) => JSON.parse(c.init.body).prompt);
const SERVER_ONLY = 'summarise the history of rome';

// ---------------------------------------------------------------- (1) CLOUD FIRST: the page

test('EVERY PROMPT GOES TO THE CLOUD: a greeting, a sum and a novel prompt each make one POST of { prompt } and print the cloud route; nothing of the organism is imported', async () => {
  const flow = [];
  const p = await runPage({ flow });
  const hey = await p.send('hey');
  const sum = await p.send('what is 17 times 23');
  const novel = await p.send(SERVER_ONLY);
  assert.deepEqual(sent(p), ['hey', 'what is 17 times 23', SERVER_ONLY]);
  for (const c of p.calls) {
    assert.equal(c.init.method, 'POST');
    assert.deepEqual(Object.keys(JSON.parse(c.init.body)), ['prompt']);
    assert.equal(c.init.headers['content-type'], 'application/json');
    assert.match(c.init.headers.accept, /^application\/x-ndjson, text\/event-stream;q=0\.9, application\/json;q=0\.8$/);
  }
  assert.deepEqual([hey.cloud, sum.cloud, novel.cloud], [true, true, true]);
  assert.equal(hey.answer, converse('hey').answer);
  assert.equal(sum.answer, '391');
  assert.deepEqual(flow, ['cloud', 'carry', 'cloud', 'carry', 'cloud'], 'no device reader ran: only the follow-up reader, once the thread had a turn');
  assert.deepEqual(p.dynamic, ['../organism/act/thread.mjs'], 'the cloud answered, so nothing of the device tier was imported');
  const e = entries(p)[1];
  const srv = e.querySelector('[data-server-done]');
  assert.deepEqual([srv.getAttribute('data-status'), srv.getAttribute('data-srv-route'), srv.getAttribute('data-srv-provenance'), srv.getAttribute('data-srv-once')], ['200', 'direct', 'exact', 'tail']);
  assert.equal(e.querySelector('[data-srv-answer]').textContent, '391');
  assert.match(srv.textContent, /cloud: route direct  provenance exact  model none: not asked  memory hits 0  web pages 0  9 us in the cloud \(cloud\.test\)  round trip \d+ ms$/);
  assert.equal(e.querySelectorAll('[data-fallback]').length + e.querySelectorAll('[data-ns]').length, 0, 'no device line on a cloud answer');
  assert.deepEqual(stored(p).map((t) => t.route), ['cloud, route direct, provenance native', 'cloud, route direct, provenance exact', 'cloud, route direct, provenance memory']);
});

test('the cloud block first says it is asking, then how long it has waited, then the answer; a failure prints in it, never silence', async () => {
  assert.equal(PENDING_LINE, 'asking the organism in the cloud ...');
  assert.equal(toHtml(pendingView(0)), '<div class="srv pending acc" data-server-pending="1">' + PENDING_LINE + '</div>');
  assert.match(toHtml(pendingView(4)), /asking the organism in the cloud \.\.\. 4 s, still waiting/);
  const p = await runPage();
  let release;
  const gate = new Promise((ok) => { release = ok; });
  p.setReply({ status: 200, headers: { get: () => null }, json: () => gate });
  const out = p.send(SERVER_ONLY);
  try {
    await until(() => p.calls.length === 1);
    assert.equal(last(p).querySelector('[data-server-pending]').textContent, PENDING_LINE);
  } finally {
    release({ ok: true, text: 'Rome was founded.', route: 'direct', provenance: { answer: 'memory' }, ...base });
  }
  await out;
  assert.equal(last(p).querySelectorAll('[data-server-pending]').length, 0);
  assert.equal(last(p).querySelector('.srvtext').textContent, 'Rome was founded.');
  // failures, each in the cloud block
  p.setReply(new Error('Failed to fetch'));
  await p.send(SERVER_ONLY);
  assert.match(last(p).querySelector('[data-server-done]').textContent, /^cloud  the cloud did not answer: Failed to fetch  round trip \d+ ms$/);
  p.setReply(respond(500, null));
  await p.send(SERVER_ONLY);
  assert.match(last(p).querySelector('[data-server-done]').textContent, /the cloud answered 500: no JSON/);
  p.setReply(respond(429, { ok: false, error: 'too many requests' }, '30'));
  await p.send(SERVER_ONLY);
  assert.match(last(p).querySelector('[data-server-done]').textContent, /the cloud answered 429: too many requests \(retry after 30 s\)/);
  assert.equal(SERVER_TIMEOUT_MS, 25000);
  assert.ok(script(HTML).includes("'no answer in 25 s, the request was stopped'"));
});

test('THE DEVICE TIER IS ONLY THE OFFLINE FALLBACK: when the cloud gives no answer this device answers, in its order, and says so in one line', async () => {
  const flow = [];
  const p = await runPage({ flow });
  p.setReply(new TypeError('Failed to fetch'));
  const r = await p.send('what is 17 times 23');
  assert.deepEqual({ cloud: r.cloud, fallback: r.fallback, answer: r.answer, route: r.route, provenance: r.provenance, why: r.why }, { cloud: false, fallback: true, answer: '391', route: 'exact', provenance: 'exact', why: 'Failed to fetch' });
  const e = last(p);
  const fb = e.querySelector('[data-fallback]');
  assert.equal(fb.textContent, 'offline fallback  the cloud gave no answer (Failed to fetch), so this device answered from what it already holds:');
  const h = e.innerHTML;
  assert.ok(h.indexOf('data-server-done') < h.indexOf('data-fallback') && h.indexOf('data-fallback') < h.indexOf('data-answer="391"'), 'the cloud failure, the fallback line, then the answer');
  assert.match(e.querySelector('[data-route="exact"]').textContent, /^device: route exact  method .*  model none  tokens 0  network 0  [\d,]+ ns per ask on this device$/);
  assert.equal(stored(p)[0].route.startsWith('offline fallback on this device: exact, method '), true);
  assert.deepEqual(flow, ['cloud', 'converse', 'readExact']);
  // the order on this device: the conversation region, the exact reader (with the word reader), the grown cells, a cell grown here
  const asked = [];
  const q = await runPage({ flow: (flow.length = 0, flow), asked });
  q.setReply(respond(503, { ok: false, error: 'down' }));
  const miss = await q.send(SERVER_ONLY);
  assert.deepEqual(flow, ['cloud', 'converse', 'readExact', 'route', 'device']);
  assert.equal(typeof asked.find((x) => x[0] === 'readExact')[2].word, 'function', 'the exact reader is asked with the word problem reader');
  assert.deepEqual({ cloud: miss.cloud, fallback: miss.fallback, offline: miss.offline, status: miss.status }, { cloud: false, fallback: false, offline: false, status: 503 });
  assert.match(last(q).querySelector('[data-refusal]').textContent, /^device: nothing this device holds carries it, so it refuses it, not guesses \(none of the 2 cells it holds carries it\)\. Ask again when the cloud answers\.$/);
  assert.deepEqual(q.dynamic, ['../organism/act/converse.mjs', '../organism/act/exact-read.mjs', '../organism/act/word.mjs', '../organism/act/cells-tab.mjs', BODY_URL]);
  flow.length = 0;
  const hey = await q.send('hey');
  assert.deepEqual([hey.route, hey.provenance, hey.answer], ['direct', 'native', converse('hey').answer]);
  assert.deepEqual(flow, ['carry', 'cloud', 'converse']);
  assert.equal(new Set(q.dynamic).size, q.dynamic.length, 'each module is imported once');
  const w = await q.send(EXAMPLES.find((x) => /Natalia/.test(x)));
  assert.equal(w.route, 'exact', 'the word problem reader answers inside the exact reader');
  assert.equal(toHtml(fallbackView('<x>')).includes('<x>'), false, 'text is text');
});

test('offline: no request; this device answers what it holds, and a prompt it does not prints ONE honest line, no spinner', async () => {
  const p = await runPage({ nav: { onLine: false } });
  const r = await p.send(SERVER_ONLY);
  assert.equal(r.offline, true);
  assert.equal(p.calls.length, 0, 'offline, nothing was sent');
  const e = last(p);
  const off = e.querySelectorAll('[data-offline]');
  assert.equal(off.length, 1);
  assert.equal(off[0].textContent, OFFLINE_LINE);
  assert.match(OFFLINE_LINE, /the organism in the cloud/);
  assert.equal(e.querySelectorAll('[data-server-pending]').length + e.querySelectorAll('[data-server-done]').filter((x) => !x.hasAttribute('data-offline')).length, 0);
  assert.ok(!e.innerHTML.includes(PENDING_LINE), 'no spinner line');
  const s = await p.send('what is 17 times 23');
  assert.deepEqual([s.answer, s.why], ['391', 'this device is offline']);
  assert.equal(last(p).querySelector('[data-fallback]').textContent, 'offline fallback  the cloud gave no answer (this device is offline), so this device answered from what it already holds:');
  assert.equal((await p.send('capital of Japan')).route, 'cell');
  assert.equal(p.calls.length, 0);
  assert.deepEqual(stored(p).map((t) => t.route.split(':')[0]), ['offline, not sent', 'offline fallback on this device', 'offline fallback on this device']);
  // the network drops while the request is out: the offline line, not the error
  const nav2 = { onLine: true };
  const q = await runPage({ nav: nav2 });
  q.setReply(() => { nav2.onLine = false; return new TypeError('Failed to fetch'); });
  const t = await q.send(SERVER_ONLY);
  assert.equal(t.offline, true);
  assert.equal(q.calls.length, 1);
  assert.equal(last(q).querySelector('[data-offline]').textContent, OFFLINE_LINE);
  assert.ok(!last(q).innerHTML.includes(PENDING_LINE));
  assert.doesNotMatch(last(q).innerHTML, /did not answer/);
});

test('a prompt a grown cell carries is answered offline by the cell web/pocket.mjs bundled, read from the page origin; cells that do not load are named', async () => {
  const want = grownAnswer('capital of Japan');
  assert.ok(want && want.id === CAPITAL);
  const row = JSON.parse(readFileSync(path.join(DIST, 'organism', 'cells.json'), 'utf8')).cells.find((r) => r.id === want.id);
  const p = await runPage({ nav: { onLine: false } });
  const t = await p.send('capital of Japan');
  assert.deepEqual({ route: t.route, provenance: t.provenance, cell: t.cell, generation: t.generation, answer: t.answer }, { route: 'cell', provenance: 'grown', cell: want.id, generation: row.generation, answer: want.answer });
  const e = last(p);
  const foot = e.querySelector('[data-route="cell"]');
  assert.equal(foot.querySelector('.ok').textContent, 'grown cell ' + want.id + ', generation ' + row.generation);
  assert.match(foot.textContent, /^device: route grown cell .*  model none  tokens 0  [\d.]+ ms on this device$/);
  assert.equal(e.querySelector('[data-cell]').textContent, want.answer);
  await p.send('capital of Japan');
  assert.deepEqual(p.bases, [ORIGIN + '/organism/']);
  assert.deepEqual(p.cellFetches, [ORIGIN + '/organism/cells.json']);
  assert.ok(p.imported.length > 0 && p.imported.every((u) => u.startsWith(ORIGIN + '/organism/cells/')), p.imported.join(' '));
  const q = await runPage({ nav: { onLine: false }, cells: { index: { nope: 1 }, mod: null } });
  await q.send('capital of Japan');
  assert.equal(last(q).querySelectorAll('[data-offline]').length, 1);
  const r = await runPage({ cells: { index: { nope: 1 }, mod: null } });
  r.setReply(respond(502, null));
  await r.send('capital of Japan');
  assert.match(last(r).querySelector('[data-refusal]').textContent, /\(its cells did not load: cells-tab: .*\)/);
});

test('every fixture prompt this device answers offline by a grown cell gets the cell and the text the cloud (grownAnswer, THE GATE inside) gives', async (t) => {
  const FIXTURE_PROMPTS = [...Object.values(TASKS).flat().map((r) => r.q), 'capital of Japan', 'Capital of Japan', 'capital of france', 'reverse the word', 'reverse the word a b c d e', 'write a poem about the sea', 'hey', 'what is 17 times 23'];
  const p = await runPage({ nav: { onLine: false } });
  let byCell = 0, byReader = 0, none = 0;
  for (const q of FIXTURE_PROMPTS) {
    p.newChat();
    const s = grownAnswer(q);
    const a = await p.send(q);
    if (a.route === 'cell') { byCell++; assert.deepEqual({ cell: a.cell, answer: a.answer }, { cell: s && s.id, answer: s && s.answer }, q); }
    else if (a.fallback) byReader++;
    else { none++; assert.equal(s, null, 'this device refused a prompt a grown cell carries: ' + q); }
  }
  assert.equal(byCell, TASKS['reverse-word'].length + 2);
  assert.ok(none >= TASKS.sum.length + TASKS['count-letters'].length);
  assert.equal(p.calls.length, 0);
  t.diagnostic('fixture prompts ' + FIXTURE_PROMPTS.length + ' offline: by a grown cell ' + byCell + ', by a reader ' + byReader + ', refused ' + none);
});

test('THE GATE on this device: the unmastered colony is neither bundled nor asked; a serving colony is imported and asked only on an exact template fit', async () => {
  const rows = JSON.parse(readFileSync(path.join(DIST, 'organism', 'cells.json'), 'utf8')).cells;
  assert.deepEqual(rows.map((r) => r.id), [CAPITAL, REVERSE]);
  assert.equal(existsSync(path.join(DIST, 'organism', 'cells', SILENT + '.mjs')), false);
  const p = await runPage({ nav: { onLine: false } });
  assert.equal((await p.send('sum of 2 and 3')).fallback, false);
  const ids = () => p.imported.map((u) => u.split('/').pop().replace(/\.mjs$/, ''));
  assert.deepEqual(ids(), [CAPITAL]);
  const r = await p.send('reverse the word apple');
  assert.deepEqual({ route: r.route, cell: r.cell, answer: r.answer }, { route: 'cell', cell: REVERSE, answer: 'elppa' });
  assert.deepEqual(ids(), [CAPITAL, REVERSE]);
  // the body module does not load: no template test, so no colony is asked; the locked cell still is
  const q = await runPage({ nav: { onLine: false }, era: null });
  assert.equal((await q.send('reverse the word apple')).fallback, false);
  assert.ok(!q.imported.some((u) => u.includes(REVERSE)));
  assert.equal((await q.send('capital of Japan')).cell, CAPITAL);
  for (const gateFits of [() => 'true', () => 1, () => { throw new Error('broken core'); }, async () => false]) {
    const g = await runPage({ nav: { onLine: false }, era: { ...realEra, gateFits } });
    assert.equal((await g.send('reverse the word apple')).fallback, false);
    assert.ok(!g.imported.some((u) => u.includes(REVERSE)));
  }
});

test('a cell grown on THIS device answers offline after the cloud cells: route device, its route line, its turn stored', async () => {
  const seen = [];
  const device = async (q) => { seen.push(q); return q === 'how many letters in apple' ? { text: '5', task: 'count-letters', cells: 2, route: ROUTE_LINE } : null; };
  const store = memStore();
  const p = await runPage({ store, nav: { onLine: false }, era: { ...realEra, deviceAnswer: device } });
  const t = await p.send('how many letters in apple');
  assert.deepEqual({ route: t.route, provenance: t.provenance, task: t.task, answer: t.answer }, { route: 'device', provenance: 'grown', task: 'count-letters', answer: '5' });
  const foot = last(p).querySelector('[data-route="device"]');
  assert.equal(foot.querySelector('.ok').textContent, ROUTE_LINE);
  assert.equal(DEVICE_ROUTE, ROUTE_LINE);
  assert.equal(foot.textContent, 'device: route ' + ROUTE_LINE + '  task count-letters  cells 2  model none  tokens 0');
  assert.deepEqual(stored(p)[0], { prompt: 'how many letters in apple', text: '5', route: 'offline fallback on this device: ' + ROUTE_LINE + ', task count-letters' });
  seen.length = 0;
  assert.equal((await p.send('reverse the word apple')).route, 'cell');
  assert.equal((await p.send('what is 2 times 2')).route, 'exact');
  assert.deepEqual(seen, [], 'what the cloud cells or the readers carry never reaches the device cell');
  const bad = await runPage({ nav: { onLine: false }, era: { ...realEra, deviceAnswer: async () => { throw new Error('store broke'); } } });
  assert.equal((await bad.send('how many letters in apple')).fallback, false);
  assert.equal(toHtml(deviceView({ text: '<b>', task: 't', cells: 1 })).includes('<b>'), false, 'text is text');
  assert.equal(await realEra.deviceAnswer('how many letters in apple'), null, 'the real body in node: no IndexedDB, no device answer');
});

// ---------------------------------------------------------------- (2) IT FEELS LIKE AN LLM

test('STREAMING by feature detection: an NDJSON or SSE answer prints as it arrives, then the final JSON; a whole JSON answer is read whole', async () => {
  assert.equal(streamKind('application/x-ndjson; charset=utf-8'), 'ndjson');
  assert.equal(streamKind('application/jsonl'), 'ndjson');
  assert.equal(streamKind('text/event-stream'), 'sse');
  for (const ct of ['application/json', '', null, undefined, 'text/plain']) assert.equal(streamKind(ct), null, String(ct));
  const enc = new TextEncoder();
  const streamed = (kind, pieces, holdAt = -1, hold = null) => {
    let i = 0;
    return { status: 200, headers: { get: (k) => (k.toLowerCase() === 'content-type' ? (kind === 'sse' ? 'text/event-stream' : 'application/x-ndjson') : null) },
      body: { getReader: () => ({ read: async () => { if (i === holdAt && hold) await hold; return i < pieces.length ? { done: false, value: enc.encode(pieces[i++]) } : { done: true, value: undefined }; } }) },
      json: async () => { throw new Error('a stream is read as a stream'); } };
  };
  const final = { ok: true, text: 'Rome grew from a village.', route: 'direct', provenance: { answer: 'memory' }, ...base };
  const p = await runPage();
  let release;
  const hold = new Promise((ok) => { release = ok; });
  // a line split across two chunks, a line that does not parse, then the final object
  p.setReply(streamed('ndjson', ['{"delta":"Rome gr', 'ew"}\n{"delta":" from"}\nnot json\n', '{"delta":" a village."}\n' + JSON.stringify(final) + '\n'], 2, hold));
  const out = p.send(SERVER_ONLY);
  try {
    await until(() => last(p).querySelector('[data-streaming]'));
    const s = last(p).querySelector('[data-streaming]');
    assert.equal(s.querySelector('.reply').textContent, 'Rome grew from');
    assert.equal(s.querySelector('.foot').textContent, 'streaming from the cloud ...');
    assert.equal(last(p).querySelectorAll('[data-server-pending]').length, 0);
  } finally { release(); }
  const r = await out;
  assert.deepEqual({ cloud: r.cloud, streamed: r.streamed, answer: r.answer }, { cloud: true, streamed: true, answer: final.text });
  const done = last(p).querySelector('[data-server-done]');
  assert.equal(done.getAttribute('data-streamed'), '1');
  assert.equal(done.querySelector('.srvtext').textContent, final.text);
  assert.equal(last(p).querySelectorAll('[data-streaming]').length, 0);
  // SSE: data lines, [DONE] skipped; a stream with no final object answers with the text it carried
  const q = await runPage();
  q.setReply(streamed('sse', ['event: x\ndata: {"delta":"Hel"}\n\n', 'data: {"delta":"lo."}\n\ndata: [DONE]\n']));
  const s = await q.send('say hello');
  assert.deepEqual({ answer: s.answer, route: s.route, streamed: s.streamed }, { answer: 'Hello.', route: 'stream', streamed: true });
  // a JSON body is read whole, never as a stream, even when the body has a reader
  const j = await runPage();
  j.setReply({ ...organism('what is 17 times 23'), body: { getReader: () => { throw new Error('read as a stream'); } } });
  assert.equal((await j.send('what is 17 times 23')).streamed, false);
  // readStream alone: an empty stream is no answer; the final object wins over the deltas for the JSON, keeping its text
  const empty = await readStream(streamed('ndjson', []), 'ndjson');
  assert.deepEqual(empty, { j: null, text: '', events: 0 });
  const noText = await readStream(streamed('ndjson', ['{"delta":"a"}\n{"delta":"b"}\n{"ok":true,"route":"r"}']), 'ndjson');
  assert.deepEqual(noText.j, { ok: true, route: 'r', text: 'ab' });
  assert.equal(noText.events, 3);
  const deltas = [];
  await readStream(streamed('ndjson', ['{"delta":"a"}\n[1]\n{"delta":""}\n{"delta":"b"}\n']), 'ndjson', (t) => deltas.push(t));
  assert.deepEqual(deltas, ['a', 'ab']);
});

test('A MISS IS NEVER A DEAD END: when the cloud says it took the prompt as a task the page says so plainly; an answer says nothing of the kind', async () => {
  assert.equal(missLine({ ok: true, task: 'history-of-rome' }), 'the cloud has taken this as a task (history-of-rome) and grows cells for it in its next era; ask again after that.');
  assert.equal(missLine({ growing: { task: 'x', logged: true } }), 'the cloud has taken this as a task (x) and grows cells for it in its next era; ask again after that.');
  assert.equal(missLine({ growing: { logged: true } }), 'the cloud has taken this as a task: it is logged, and its next era grows cells for it; ask again after that.');
  assert.equal(missLine({ queued: true }), 'the cloud has taken this as a task: it is queued, and its next era grows cells for it; ask again after that.');
  assert.equal(missLine({ growing: { logged: false, reason: 'no store' } }), 'the cloud could not log this as a task (no store), so nothing grows for it yet.');
  assert.equal(missLine({ growing: { logged: false } }), 'the cloud could not log this as a task (no reason given), so nothing grows for it yet.');
  for (const j of [null, 'x', {}, { ok: true }, { growing: null }, { growing: { logged: 'yes' } }, { queued: 1 }, { task: '  ' }, { task: 7 }]) assert.equal(missLine(j), null, JSON.stringify(j));
  const p = await runPage();
  const r = await p.send(SERVER_ONLY);
  assert.equal(r.miss, 'the cloud has taken this as a task: it is logged, and its next era grows cells for it; ask again after that.');
  const m = last(p).querySelector('[data-miss]');
  assert.equal(m.textContent, 'taken as a task  ' + r.miss);
  assert.ok(last(p).innerHTML.indexOf('srvtext') < last(p).innerHTML.indexOf('data-miss'), 'the cloud text first, the task line under it');
  assert.equal(last(p).querySelectorAll('[data-fallback]').length, 0, 'a miss the cloud took is not a fallback');
  await p.send('what is 17 times 23');
  assert.equal(last(p).querySelectorAll('[data-miss]').length, 0);
});

test('FOLLOW-UPS CARRY THE LAST RELATION: after a lookup, "and X?" asks the same relation of X; the cloud gets the standalone question and the turn one "read as" line', async () => {
  const last0 = { prompt: 'population of japan', text: '125 million', via: { pack: 'countries', key: 'Japan', column: 'population', op: 'lookup' } };
  assert.deepEqual(carryRelation(last0, 'and what about india?'), { prompt: 'population of india', carried: true, from: 'population of japan', rule: 'relation' });
  assert.deepEqual(carryRelation(last0, 'And India'), { prompt: 'population of India', carried: true, from: 'population of japan', rule: 'relation' });
  assert.equal(carryRelation(last0, 'same for peru??').prompt, 'population of peru');
  assert.equal(carryRelation({ ...last0, read: 'the population of japan' }, 'how about chile').prompt, 'the population of chile', 'the carried question of the turn, not what was typed');
  assert.deepEqual(carryRelation({ prompt: 'how many live in nippon', via: { pack: 'p', key: 'Japan', column: 'population' } }, 'what about india?'), { prompt: 'what is the population of india', carried: true, from: 'how many live in nippon', rule: 'relation' });
  for (const [l, t] of [[last0, 'india'], [last0, 'and'], [last0, ''], [{ prompt: 'x' }, 'and india?'], [null, 'and india?'], [{ prompt: 'x', via: { pack: 'p' } }, 'and india?'], [last0, 'and ' + 'x'.repeat(121)]]) assert.equal(carryRelation(l, t), null, t);
  // viaOf: the lookup the answer names, strings only, from native.via or via
  assert.deepEqual(viaOf({ native: { via: { pack: 'countries', key: 'Japan', column: 'population', op: 'lookup', n: 3 } } }), { pack: 'countries', key: 'Japan', column: 'population', op: 'lookup' });
  assert.deepEqual(viaOf({ via: { column: 'capital', key: 7 } }), { pack: null, key: null, column: 'capital', op: null });
  for (const j of [null, {}, { via: 'text' }, { via: { key: 'k' } }, { native: { via: null } }]) assert.equal(viaOf(j), null, JSON.stringify(j));
  const looked = (q, answer, key) => respond(200, { ok: true, text: answer, native: { kind: 'know:lookup', answer, via: { pack: 'countries', key, column: 'population', op: 'lookup' } }, route: 'direct', provenance: { answer: 'native' }, ...base });
  const store = memStore();
  const flow = [];
  const p = await runPage({ store, flow });
  p.setReply((u, init) => { const q = JSON.parse(init.body).prompt; return q === 'population of japan' ? looked(q, 'The population of Japan is 125 million.', 'Japan') : looked(q, 'The population of India is 1.4 billion.', 'India'); });
  await p.send('population of japan');
  assert.equal(last(p).querySelector('[data-via]').textContent, 'looked up: pack countries, key Japan, column population, op lookup');
  assert.deepEqual(stored(p)[0].via, { pack: 'countries', key: 'Japan', column: 'population', op: 'lookup' });
  const b = await p.send('and india?');
  assert.equal(b.read, 'population of india');
  assert.deepEqual(sent(p), ['population of japan', 'population of india']);
  assert.equal(last(p).querySelector('[data-read]').textContent, 'read as: population of india');
  assert.equal(last(p).querySelector('.you').textContent, '> and india?');
  assert.ok(!flow.includes('carry') && !p.dynamic.length, 'the relation carried with nothing imported');
  // a reload keeps the relation: the next follow-up carries against the stored turn
  const q = await runPage({ store });
  q.setReply((u, init) => looked(JSON.parse(init.body).prompt, 'The population of Peru is 34 million.', 'Peru'));
  assert.equal((await q.send('what about peru')).read, 'population of peru', 'carried against the last stored turn (India, read as population of india)');
});

test('a follow-up with no relation is carried by act/thread.mjs, imported only once the thread has a turn: "and germany?" and "plus 9"', async () => {
  const flow = [];
  const p = await runPage({ flow });
  p.setReply(memory('Paris is the capital of France.'));
  const a = await p.send('what is the capital of france');
  assert.equal(a.read, null);
  assert.deepEqual(p.dynamic, [], 'no turn yet, so the follow-up reader was not imported');
  p.setReply(memory('Berlin is the capital of Germany.'));
  const b = await p.send('and germany?');
  assert.equal(b.read, 'what is the capital of germany');
  assert.deepEqual(p.dynamic, ['../organism/act/thread.mjs']);
  assert.deepEqual(sent(p), ['what is the capital of france', 'what is the capital of germany']);
  const reads = last(p).querySelectorAll('[data-read]');
  assert.equal(reads.length, 1);
  assert.ok(reads[0].getAttribute('class').split(' ').includes('dim'));
  p.setReply((u, init) => cloudOf(init));
  assert.equal((await p.send('what is 17 times 23')).answer, '391');
  const d = await p.send('plus 9');
  assert.deepEqual({ cloud: d.cloud, answer: d.answer, read: d.read }, { cloud: true, answer: '400', read: 'what is 391 plus 9' });
  assert.equal(sent(p).at(-1), 'what is 391 plus 9');
  assert.equal(stored(p).at(-1).read, 'what is 391 plus 9');
  assert.deepEqual(flow.filter((x) => x === 'carry').length, 3);
  // the same follow-up with no turn before it stands alone
  const q = await runPage();
  q.setReply(memory('nothing.'));
  assert.equal((await q.send('and germany?')).read, null);
  assert.equal(sent(q)[0], 'and germany?');
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
    release({ ok: true, text: 'Paris.', route: 'direct', provenance: { answer: 'memory' }, ...base });
  }
  await first;
  const b = await second;
  assert.equal(b.read, 'what is the capital of germany');
  assert.deepEqual(sent(p), ['what is the capital of france', 'what is the capital of germany']);
  assert.deepEqual(p.turns().map((t) => t.prompt), ['what is the capital of france', 'and germany?']);
});

test('a cloud answer prints ONCE: a text ending with its answer prints the head dim and the answer once', () => {
  const answer = converse('hey, how are you').answer;
  const native = { ok: true, text: 'answered natively by the conversation region (kind greeting+wellbeing, 35945 ns), with no model, no memory read and no network.\n' + answer,
    native: { kind: 'greeting+wellbeing', answer, form: 'hey how are you', ns: 35945 }, exact: null, route: 'direct',
    provenance: { answer: 'native', memoryHits: 0, webPages: 0 }, llm: { provider: null, reason: 'not asked: the native conversation region answered' }, serverUs: 142, host: 'iad1', knowledge: { ready: true } };
  const h = serverHtml({ status: 200, j: native, rttMs: 75 });
  assert.equal(count(h, '>' + answer + '<'), 1, 'printed once');
  assert.match(h, /data-srv-once="tail"/);
  assert.ok(h.indexOf('data-srv-answer') < h.indexOf('data-srv-head'), 'the answer first, the head second');
  assert.match(h, /cloud: route <span class="acc">direct<\/span>  provenance <span class="acc">native<\/span>/);
  assert.match(h, /142 us in the cloud<\/span> \(iad1\)  round trip 75 ms/);
  const eq = serverHtml({ status: 200, j: { ...native, text: answer }, rttMs: 70 });
  assert.equal(count(eq, '>' + answer + '<'), 1);
  assert.match(eq, /data-srv-once="equal"/);
  assert.doesNotMatch(eq, /srvtext/);
  const mem = serverHtml({ status: 200, j: { ok: true, text: 'nothing in memory matches hey.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 9, host: 'iad1', knowledge: { ready: false, why: 'not ingested here' } }, rttMs: 70 });
  assert.match(mem, /<pre class="srvtext">nothing in memory matches hey\.<\/pre>/);
  assert.match(mem, /knowledge store in the cloud: absent \(not ingested here\)\./);
  assert.equal(answerOnce({ text: 'the year was 1391', exact: { answer: '391' } }).mode, 'text');
  assert.equal(answerOnce({ text: '  391 ', exact: { answer: '391' } }).mode, 'equal');
  assert.equal(answerOnce({ text: 'a\nb\n391', exact: { answer: '391' } }).head, 'a\nb');
  assert.match(serverHtml({ status: 200, j: { ...native, llm: { ok: true, provider: 'p', model: 'm', ms: 12.4, tokens: 30 } }, rttMs: 1 }), /model p\/m 12 ms 30 tokens/);
  assert.match(serverHtml({ status: 200, j: { ...native, llm: { provider: null, reason: 'r', fellBack: 'x' } }, rttMs: 1 }), /model none: r  <span class="warn">fell back from x<\/span>/);
});

test('the view functions are the page functions byte for byte, and the clock prints a positive median', () => {
  for (const [name, fn] of Object.entries(PAGE_FUNCTIONS)) assert.ok(HTML.includes(fn.toString()), name + ' is in the page byte for byte');
  assert.ok(!HTML.includes('function toHtml'), 'the node side serialiser is not in the page: the page mounts, it never writes markup');
  const c = clock(() => converse('hey'));
  assert.ok(Number.isInteger(c.ns) && c.ns >= 1 && c.asks >= 56, JSON.stringify(c));
  assert.match(toHtml(tabNativeView(converse('hey'), c)), new RegExp('data-ns="' + c.ns + '"'));
  assert.equal(page(built.manifest), HTML, 'the build writes what page() returns');
});

// ---------------------------------------------------------------- text is text

const EVIL = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
const VIEW_TAGS = ['div', 'pre', 'span', 'b', 'code'];
const foreign = (el) => el.elements.map((c) => c.localName).filter((t) => !VIEW_TAGS.includes(t));

test('text is text: a cloud answer, a streamed delta, a cell answer, a stored turn, the strip and the prompt reach the DOM as text nodes, never markup', async () => {
  const p = await runPage();
  p.setReply(respond(200, { ok: true, text: EVIL, route: '<b>r</b>', provenance: { answer: '<i>m</i>' }, task: EVIL, native: { via: { pack: EVIL, column: EVIL } }, serverUs: 1, host: '<x>', knowledge: { ready: true } }));
  await p.send(EVIL);
  const e = last(p);
  assert.deepEqual(foreign(e), []);
  assert.equal(e.querySelector('.srvtext').textContent, EVIL);
  assert.equal(e.querySelector('.you').textContent, '> ' + EVIL);
  assert.equal(e.querySelector('[data-srv-route]').getAttribute('data-srv-route'), '<b>r</b>');
  assert.ok(e.innerHTML.includes(esc(EVIL)) && !e.innerHTML.includes(EVIL));
  const cells = { index: { generation: 7, cells: [{ id: 'evil-cell-g7', class: 'evil', generation: 7, file: 'cells/evil-cell-g7.mjs' }] }, mod: { meta: { id: 'evil-cell-g7', class: 'evil' }, can: () => true, answer: () => EVIL } };
  const q = await runPage({ cells, nav: { onLine: false } });
  assert.equal((await q.send(SERVER_ONLY)).route, 'cell');
  assert.deepEqual(foreign(last(q)), []);
  assert.equal(last(q).querySelector('[data-cell]').textContent, EVIL);
  const store = memStore({ [THREAD_KEY]: JSON.stringify([{ prompt: EVIL, text: EVIL, route: '<b>' + EVIL + '</b>', read: EVIL }]) });
  const s = await runPage({ store });
  const re = s.term.children[0];
  assert.equal(re.getAttribute('data-restored'), '1');
  assert.deepEqual(foreign(re), []);
  assert.equal(re.querySelector('.reply').textContent, EVIL);
  assert.equal(re.querySelector('[data-read]').textContent, 'read as: ' + EVIL);
  const a = await runPage({ alive: { ok: true, json: async () => ({ builtAt: EVIL, neo: { now: { era: 1, cells: 2 } } }) } });
  await a.idle();
  await until(() => a.strip.querySelector('[data-alive]'));
  assert.deepEqual(foreign(a.strip), []);
  assert.ok(a.strip.textContent.includes(EVIL.slice(0, 40)) && !a.strip.innerHTML.includes('<img'));
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
  for (const s of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'eval(', 'new Function', 'createContextualFragment', 'DOMParser', 'srcdoc']) assert.ok(!HTML.includes(s), s);
  assert.match(script(HTML), /mount\(document, /);
  assert.ok(HTML.includes('<div id="term" aria-live="polite">' + toHtml(helloView()) + '</div>'), 'the empty thread is the hello line');
  assert.match(HELLO_LINE, /every prompt goes to the organism in the cloud/);
});

// ---------------------------------------------------------------- installable, and the live organism

test('INSTALLABLE: the service worker /ask/sw.js (scope /) is registered after the first paint, only on https or localhost, never on save-data', async () => {
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
    const p = await runPage({ nav, loc });
    assert.deepEqual(regs, [], 'nothing registered before the first paint');
    await p.idle();
    assert.deepEqual(regs, want ? [[SW_URL, { scope: SW_SCOPE }]] : [], JSON.stringify(loc));
  }
  const saver = [];
  const sd = await runPage({ nav: { onLine: true, connection: { saveData: true }, serviceWorker: { register: (u) => { saver.push(u); return Promise.resolve({}); } } } });
  await sd.idle();
  assert.deepEqual(saver, [], 'no precache on save-data');
  assert.deepEqual(sd.aliveCalls, [], 'no live strip on save-data');
  assert.equal(saveDataOn({ connection: { saveData: true } }), true);
  for (const n of [null, {}, { connection: null }, { connection: { saveData: 'on' } }]) assert.equal(saveDataOn(n), false);
  // the old registration of the same worker under /ask/ is removed; no other is touched
  const gone = [];
  const reg = (scope, scriptUrl) => ({ scope: ORIGIN + scope, active: { scriptURL: ORIGIN + scriptUrl }, unregister: () => { gone.push(scope); return Promise.resolve(true); } });
  const regsNow = [reg('/ask/', '/ask/sw.js'), reg('/', '/ask/sw.js'), reg('/other/', '/other/sw.js'), { scope: ORIGIN + '/ask/', installing: { scriptURL: ORIGIN + '/elsewhere/sw.js' }, unregister: () => { gone.push('foreign'); } }];
  const g = await runPage({ nav: { onLine: true, serviceWorker: { register: () => Promise.resolve({}), getRegistrations: () => Promise.resolve(regsNow) } } });
  await g.idle();
  await until(() => gone.length >= 1);
  assert.deepEqual(gone, ['/ask/']);
  for (const nav of [{ onLine: true, serviceWorker: { register: () => { throw new Error('denied'); } } }, { onLine: true, serviceWorker: { register: () => Promise.reject(new Error('denied')), getRegistrations: () => { throw new Error('denied'); } } }]) {
    const t = await runPage({ nav });
    await t.idle();
    assert.equal((await t.send('what is 17 times 23')).answer, '391');
  }
  assert.equal(swAllowed({}, { protocol: 'https:' }), false);
  assert.equal(swAllowed(null, { protocol: 'https:' }), false);
  assert.equal(swAllowed({ serviceWorker: {} }, null), false);
  assert.equal(swAllowed({ serviceWorker: {} }, { protocol: 'http:', hostname: 'app.localhost' }), true);
  assert.equal(swAllowed({ serviceWorker: {} }, { protocol: 'http:', hostname: '[::1]' }), true);
  assert.equal(swAllowed({ serviceWorker: {} }, { protocol: 'http:', hostname: 'localhost.example.com' }), false);
});

test('the head links the manifest, sets the theme colour to the body background (what the manifest takes) and the apple mobile web app metas', () => {
  const head = HTML.slice(0, HTML.indexOf('</head>'));
  assert.ok(head.includes(POCKET_HEAD), 'the manifest and icon links');
  assert.match(head, /<link rel="manifest" href="\/ask\/manifest\.webmanifest">/);
  const theme = /<meta name="theme-color" content="([^"]+)">/.exec(head);
  assert.equal(theme[1], BACKGROUND);
  assert.equal(askColors(HTML).theme, theme[1], 'the theme colour is the body background');
  const wm = JSON.parse(readFileSync(path.join(DIST, 'ask', 'manifest.webmanifest'), 'utf8'));
  assert.equal(wm.theme_color, theme[1]);
  assert.equal(wm.background_color, BACKGROUND);
  for (const m of ['mobile-web-app-capable" content="yes', 'apple-mobile-web-app-capable" content="yes', 'apple-mobile-web-app-title" content="Dilation', 'apple-mobile-web-app-status-bar-style" content="black']) assert.ok(head.includes('<meta name="' + m + '">'), m);
});

test('THE LIVE STRIP reads /alive/data.json after the first paint and prints the organism numbers; counts of one are singular; nothing it cannot read', async () => {
  const d = { builtAt: '2026-10-02T01:02:03.000Z', neo: { now: { era: 12, cells: 1, tasks: 3, mastered: 1, ok: 7, n: 9, score: 0.778, velocity: [{ key: 'eraMs', value: 900 }, { key: 'cellsPerSecond', value: 4.5 }], plateau: 2 }, pipeline: { promoted: false, era: 11 } } };
  const want = 'live  the organism in the cloud: era 12, 1 cell, 3 tasks, 1 mastered, held-out 7 of 9 (0.778), 4.5 cells per second, plateau 2, last promote refused at era 11 (built 2026-10-02T01:02:03.000Z)';
  assert.equal(mount(makeDoc(), stripView(d)).textContent, want);
  assert.equal(mount(makeDoc(), stripView({ neo: { now: { era: 1, cells: 2, tasks: 1 }, pipeline: { promoted: true } } })).textContent, 'live  the organism in the cloud: era 1, 2 cells, 1 task, last promote kept');
  for (const x of [null, {}, { neo: null }, { neo: {} }, { neo: { now: {} } }, { neo: { now: { era: 'x', cells: null } } }]) assert.equal(stripView(x), null, JSON.stringify(x));
  // the trials and the compute ledger, feature-detected as web/alive.mjs writes them into data.json
  const more = { neo: { now: { era: 3 }, selfMod: { trials: { rows: 6, kept: 2 } }, compute: { fields: [{ key: 'month', value: '2026-10' }, { key: 'budgetMinutes', value: 3000 }, { key: 'spentMinutes', value: 1234 }] } } };
  assert.equal(mount(makeDoc(), stripView(more)).textContent, 'live  the organism in the cloud: era 3, trials 2 kept of 6, compute 1234 of 3000 minutes');
  const spentOnly = { neo: { now: { era: 3 }, compute: { fields: [{ key: 'spentMinutes', value: 1 }, { key: 'budgetMinutes', value: null }] } } };
  assert.equal(mount(makeDoc(), stripView(spentOnly)).textContent, 'live  the organism in the cloud: era 3, compute 1 minute');
  // one minute against a budget reads against the budget's plural: "1 of 60 minutes"
  const oneOfBudget = { neo: { now: { era: 3 }, compute: { fields: [{ key: 'spentMinutes', value: 1 }, { key: 'budgetMinutes', value: 60 }] } } };
  assert.equal(mount(makeDoc(), stripView(oneOfBudget)).textContent, 'live  the organism in the cloud: era 3, compute 1 of 60 minutes');
  for (const odd of [{ selfMod: { trials: { rows: '6', kept: 2 } } }, { selfMod: { trials: null } }, { selfMod: 5 }, { compute: { fields: 'x' } }, { compute: { fields: [{ key: 'spentMinutes', value: 'n/a' }] } }, { compute: null }]) {
    assert.equal(mount(makeDoc(), stripView({ neo: { now: { era: 3 }, ...odd } })).textContent, 'live  the organism in the cloud: era 3', JSON.stringify(odd));
  }
  const p = await runPage({ alive: { ok: true, json: async () => d } });
  assert.deepEqual(p.aliveCalls, [], 'nothing fetched before the first paint');
  assert.equal(p.strip.textContent, 'the organism, live');
  await p.idle();
  await until(() => p.strip.querySelector('[data-alive]'));
  assert.deepEqual(p.aliveCalls, [ALIVE_URL]);
  assert.equal(p.strip.textContent, want);
  assert.equal(ALIVE_URL, '/alive/data.json');
  assert.ok(HTML.includes('<div class="foot strip" id="alive"><a href="/alive">the organism, live</a></div>'), 'the full page one tap away, before any fetch');
  // a strip that cannot be read leaves the link: a 404, a fetch that throws, JSON with no numbers
  for (const alive of [null, new Error('offline'), { ok: true, json: async () => ({ neo: null }) }, { ok: true, json: async () => { throw new Error('not json'); } }]) {
    const q = await runPage({ alive });
    await q.idle();
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(q.strip.textContent, 'the organism, live');
    assert.equal((await q.send('what is 17 times 23')).answer, '391');
  }
});

test('THE DEVICE WORKER IS OFF BY DEFAULT: never imported or started by itself; the switch starts it and is remembered; never on a metered connection', async () => {
  assert.ok(HTML.includes('<div class="foot" id="bodyrow"><span id="body">' + esc(BODY_OFF_LINE) + '</span> <button id="bodysw" class="chip" type="button" aria-pressed="false">grow on this device too</button></div>'));
  const plantWorker = () => {
    const made = [];
    class FakeWorker { constructor(url, opts) { this.url = String(url); this.opts = opts; this.sent = []; this.ended = false; made.push(this); } postMessage(m) { this.sent.push(m); } terminate() { this.ended = true; } }
    return { FakeWorker, made };
  };
  const { FakeWorker, made } = plantWorker();
  const store = memStore();
  const p = await runPage({ store, Worker: FakeWorker });
  await p.idle();
  await p.send('what is 17 times 23');
  assert.deepEqual([made.length, p.dynamic.length], [0, 0], 'no worker and no body import by itself');
  assert.equal(p.bodyLineEl.textContent, BODY_OFF_LINE);
  // the switch: imports the body, starts the worker on its own URL, remembers the choice
  p.bodySw.fire('click');
  await until(() => made.length === 1 && made[0].sent.length === 1);
  assert.deepEqual(p.dynamic, [BODY_URL]);
  assert.ok(made[0].url.endsWith('/organism/web/pocket-era.mjs'), made[0].url);
  assert.deepEqual(made[0].opts, { type: 'module', name: 'pocket-era' });
  assert.deepEqual(made[0].sent[0], { type: 'env', stopped: false, hidden: false, saveData: false, metered: false, battery: null });
  assert.equal(store.getItem(SWITCH_KEY), '1');
  assert.equal(p.bodySw.textContent, 'stop growing on this device');
  assert.equal(p.bodySw.getAttribute('aria-pressed'), 'true');
  made[0].onmessage({ data: { type: 'status', status: { line: 'this device: 3 cells kept for 2 tasks, 900 tried, running' } } });
  assert.equal(p.bodyLineEl.textContent, 'this device: 3 cells kept for 2 tasks, 900 tried, running');
  // one click is one toggle (the page binds the click, startBody does not)
  p.bodySw.fire('click');
  await until(() => made[0].ended && p.bodyLineEl.textContent.endsWith('(' + WHY.stopped + ')'));
  assert.equal(store.getItem(SWITCH_KEY), '0');
  assert.equal(p.bodySw.textContent, 'grow on this device too');
  // a reload with the switch on starts it after the first paint, not before
  store.setItem(SWITCH_KEY, '1');
  const q = await runPage({ store, Worker: FakeWorker });
  assert.equal(made.length, 1, 'nothing before the first paint');
  await q.idle();
  await until(() => made.length === 2);
  // a metered connection, save-data or a low battery: never started, and the line says why
  for (const [nav, why] of [[{ onLine: true, connection: { type: 'cellular' } }, WHY.metered], [{ onLine: true, connection: { metered: true } }, WHY.metered], [{ onLine: true, connection: { saveData: true } }, WHY.saveData], [{ onLine: true, getBattery: async () => ({ level: 0.1, charging: false }) }, WHY.battery]]) {
    const r = await runPage({ store: memStore({ [SWITCH_KEY]: '1' }), Worker: FakeWorker, nav });
    await r.idle();
    await until(() => r.bodyLineEl.textContent.endsWith('(' + why + ')'));
    assert.equal(made.length, 2, 'a worker started on ' + JSON.stringify(nav));
    assert.equal(r.bodyLineEl.textContent, bodyLine({ why }));
  }
  // the body that does not load: the line says so and the chat runs on
  const n = await runPage({ era: null, Worker: FakeWorker });
  n.bodySw.fire('click');
  await until(() => n.bodyLineEl.textContent === 'this browser could not load the device worker.');
  assert.equal((await n.send('what is 17 times 23')).answer, '391');
});

test('generateAsk() writes the pocket beside the page: cells.json, the cells, the body, the core, the manifest, the icon and /ask/sw.js precaching the page it just wrote', (t) => {
  const dist = tmp('gen');
  const r = generateAsk(dist, { root: FIX });
  for (const f of ['ask/index.html', 'ask/sw.js', 'ask/manifest.webmanifest', 'ask/icon.svg', 'organism/cells.json', 'organism/manifest.json', 'organism/act/thread.mjs', 'organism/act/cells-tab.mjs',
    'organism/web/pocket-era.mjs', 'organism/grow/neo-core.mjs', 'organism/grow/neo-kernel.mjs', 'organism/era/tasks.json']) assert.ok(existsSync(path.join(dist, ...f.split('/'))), f);
  const index = JSON.parse(readFileSync(path.join(dist, 'organism', 'cells.json'), 'utf8'));
  assert.deepEqual(index.cells.map((x) => x.id), [CAPITAL, REVERSE], 'THE GATE: the unmastered colony is not bundled');
  assert.equal(r.pocket.cells, index.cells.length);
  const sw = readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8');
  for (const u of ['/organism/act/thread.mjs', '/organism/act/cells-tab.mjs', '/organism/act/converse.mjs', '/organism/cells.json', '/organism/web/pocket-era.mjs', '/organism/grow/neo-core.mjs']) assert.ok(sw.includes('{"url":"' + u + '","sha256":"'), u);
  assert.ok(sw.includes('{"url":"/ask","sha256":"' + sha(path.join(dist, 'ask', 'index.html')) + '"}'), 'the precached page is the page generateAsk wrote');
  assert.ok(!sw.includes(SILENT));
  assert.equal(r.bytes, Buffer.byteLength(readFileSync(path.join(dist, 'ask', 'index.html'))));
  assert.equal(readFileSync(path.join(dist, 'ask', 'sw.js'), 'utf8'), readFileSync(path.join(DIST, 'ask', 'sw.js'), 'utf8'), 'the same fixture, the same bytes');
  assert.equal(r.first.bytes, r.bytes, 'the first visit is the page alone');
  t.diagnostic('pocket  cells ' + r.pocket.cells + '  precache ' + r.pocket.precache + ' files  ' + r.pocket.bytes + ' bytes; first visit ' + r.first.bytes + ' bytes');
});

// ---------------------------------------------------------------- the thread

test('the thread survives a reload: ONE localStorage key, the newest 20 turns of { prompt, text, read?, route?, via? }, nothing else stored', async () => {
  assert.equal(KEEP_TURNS, 20);
  const store = memStore();
  const p = await runPage({ store });
  for (let i = 1; i <= 25; i++) await p.send('what is ' + i + ' times 2');
  assert.deepEqual([...store.map.keys()], [THREAD_KEY]);
  const turns = stored(p);
  assert.equal(turns.length, KEEP_TURNS);
  assert.deepEqual(turns.map((x) => x.prompt), Array.from({ length: 20 }, (_, k) => 'what is ' + (k + 6) + ' times 2'));
  for (const x of turns) assert.deepEqual(Object.keys(x).filter((k) => !['prompt', 'text', 'read', 'route', 'via'].includes(k)), [], JSON.stringify(x));
  assert.equal(turns.at(-1).text, 'answered exactly by exact.arith\n50');
  assert.equal(entries(p).length, 25, 'the page keeps every turn of this visit on screen');
  const q = await runPage({ store });
  assert.ok(q.term.querySelector('#hello') === null, 'no hello line over a restored thread');
  const back = q.term.children;
  assert.equal(back.length, 20);
  assert.ok(back.every((x) => x.getAttribute('data-restored') === '1'));
  assert.equal(back[19].querySelector('.you').textContent, '> what is 25 times 2');
  assert.equal(back[19].querySelector('.foot').textContent, 'restored from this device: cloud, route direct, provenance exact');
  assert.ok(q.doc.scrolled.at(-1) === back[19], 'the restored thread scrolls to its newest turn');
  const f = await q.send('plus 9');
  assert.deepEqual({ read: f.read, answer: f.answer }, { read: 'what is 50 plus 9', answer: '59' });
  assert.equal(stored(q).length, 20);
  // via is kept only as its four strings
  assert.deepEqual(cleanTurns([{ prompt: 'a', text: 'b', via: { pack: 'p', key: 'k', column: 'c', op: 'o', extra: 'x' } }, { prompt: 'c', text: 'd', via: { key: 'k' } }, { prompt: 'e', text: 'f', via: 'v' }]),
    [{ prompt: 'a', text: 'b', via: { pack: 'p', key: 'k', column: 'c', op: 'o' } }, { prompt: 'c', text: 'd' }, { prompt: 'e', text: 'f' }]);
});

test('a store that throws, corrupt JSON or 500 stored turns is an empty or a capped thread, never a broken page; the page writes only its own key', async () => {
  const p = await runPage({ store: 'throws' });
  assert.equal((await p.send('what is 17 times 23')).answer, '391');
  const bad = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('denied'); } };
  const q = await runPage({ store: bad });
  await q.idle();
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
  assert.ok(s.every((x) => !('secret' in x)));
  assert.equal(store.getItem('other'), 'kept', 'the page writes its own key only');
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
  assert.equal(store.map.size, 1);
  p.newBtn.fire('click');
  assert.equal(store.map.size, 0, 'the stored thread is removed');
  assert.deepEqual(p.turns(), []);
  assert.equal(p.term.children.length, 1);
  assert.equal(p.term.children[0].textContent, HELLO_LINE);
  assert.ok(p.doc.focused === p.box, 'the box has the focus');
  p.setReply(memory('nothing.'));
  const r = await p.send('and germany?');
  assert.equal(r.read, null, 'carried against a cleared thread');
  assert.equal(sent(p).at(-1), 'and germany?');
});

test('a new chat while an answer is in flight: the old answer is not written to the new thread, and a prompt still at the device cells is dropped', async () => {
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
    release({ ok: true, text: 'late', route: 'direct', provenance: { answer: 'memory' }, ...base });
  }
  await pending;
  assert.deepEqual(p.turns(), []);
  assert.equal(store.map.size, 0);
  assert.equal(p.term.children[0].id, 'hello');
  let open;
  const cellsGate = new Promise((ok) => { open = ok; });
  const q = await runPage({ cellsGate, nav: { onLine: false } });
  const out = q.send('capital of Japan');
  try {
    await until(() => q.bases.length === 1);
    q.newChat();
  } finally {
    open();
  }
  const r = await out;
  assert.equal(r.dropped, true);
  assert.deepEqual(q.turns(), []);
});

test('Enter sends and Shift+Enter is a new line; the box empties on send; the form and a chip send too', async () => {
  assert.match(HTML, /<textarea id="q" name="q" rows="1"[^>]*enterkeyhint="send"/);
  const p = await runPage();
  p.box.value = 'what is 17 times 23';
  assert.equal(p.box.fire('keydown', { key: 'Enter', shiftKey: true }).prevented, false, 'Shift+Enter is left to the textarea');
  assert.equal(p.box.fire('keydown', { key: 'Enter', isComposing: true }).prevented, false);
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(entries(p).length, 0);
  assert.equal(p.box.fire('keydown', { key: 'Enter' }).prevented, true);
  assert.equal(p.box.value, '');
  await until(() => entries(p).length === 1 && entries(p)[0].querySelector('[data-srv-answer]'));
  assert.equal(entries(p)[0].querySelector('[data-srv-answer]').textContent, '391');
  p.box.value = 'what is 2 times 2';
  assert.equal(p.form.fire('submit').prevented, true);
  await until(() => entries(p).length === 2 && entries(p)[1].querySelector('[data-srv-answer]'));
  p.chips[0].fire('click');
  await until(() => entries(p).length === 3 && entries(p)[2].querySelector('[data-server-done]'));
  assert.deepEqual(sent(p), ['what is 17 times 23', 'what is 2 times 2', EXAMPLES[0]]);
  assert.equal(sendsOnKey({ key: 'Enter' }), true);
  assert.equal(sendsOnKey({ key: 'Enter', shiftKey: true }), false);
  assert.equal(sendsOnKey({ key: 'Enter', isComposing: true }), false);
  assert.equal(sendsOnKey({ key: 'Enter', keyCode: 229 }), false);
  assert.equal(sendsOnKey({ key: 'a' }), false);
  assert.equal(sendsOnKey(null), false);
  // ?q= asks on load
  const pre = await runPage({ loc: { search: '?q=' + encodeURIComponent('what is 3 times 3') } });
  await until(() => pre.calls.length === 1);
  assert.deepEqual(sent(pre), ['what is 3 times 3']);
});

test('the thread scrolls to the newest turn, at the prompt and again at its answer', async () => {
  const p = await runPage();
  await p.send('what is 17 times 23');
  assert.ok(p.doc.scrolled.at(-1) === entries(p)[0]);
  let release;
  const gate = new Promise((ok) => { release = ok; });
  p.setReply({ status: 200, headers: { get: () => null }, json: () => gate });
  const pending = p.send(SERVER_ONLY);
  let e = null, n = 0;
  try {
    await until(() => p.calls.length === 2);
    e = entries(p)[1];
    assert.ok(p.doc.scrolled.at(-1) === e, 'scrolled to the new turn while it is in flight');
    n = p.doc.scrolled.length;
  } finally {
    release({ ok: true, text: 'nothing.', route: 'direct', provenance: { answer: 'memory' }, ...base });
  }
  await pending;
  assert.ok(p.doc.scrolled.length > n && p.doc.scrolled.at(-1) === e, 'scrolled again when the answer landed');
});

test('the box stays at the bottom and the look is kept: a sticky form, the same fonts and colours, the dim class, the nav to /alive', () => {
  const css = HTML.match(/<style>([\s\S]*?)<\/style>/)[1];
  assert.match(css, /form \{[^}]*position: sticky; bottom: 0;/);
  assert.match(css, /form \{[^}]*background: #02030a;/);
  assert.match(css, /html, body \{[^}]*background: #02030a;[^}]*font: 13px\/1\.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;/);
  for (const v of ['--dim: #7f8ba6;', '--ok: #7fffb0;', '--acc: #7fb0ff;']) assert.ok(css.includes(v), v);
  assert.match(css, /\.dim \{ color: var\(--dim\); \}/);
  assert.match(css, /#q \{[^}]*resize: none;[^}]*max-height: 40vh;/);
  assert.match(HTML, /<button id="new" type="button">new chat<\/button>/);
  assert.match(HTML, /<nav>[^\n]*<a href="\/alive">alive<\/a>/);
  assert.ok(HTML.indexOf('id="term"') < HTML.indexOf('<form id="f"'), 'the box is below the thread');
  assert.equal(toHtml(streamView('<a>')).includes('<a>'), false);
  assert.equal(toHtml(deviceMissView('<n>')).includes('<n>'), false);
  assert.equal(toHtml(offlineView()).includes(OFFLINE_LINE), true);
  assert.match(toHtml(cellView({ text: 't', cell: 'c', ms: 'x' }, null)), /generation unknown.*class unknown  model none  tokens 0  0 ms on this device/);
});
