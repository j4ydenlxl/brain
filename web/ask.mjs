// web/ask.mjs: THE PROMPT BOX ON dilation.dev, NOW A CHAT (queue item 12, docs/CLOUD-SESSION.md; orders 9 and 10).
//
// His words, 2026-09-26 11:32 EDT: "it should be cli in dilation.dev someday so i can prompt like any
// ai"; 2026-10-01 (grow/NEO.md head): "Should work exactly like llms fronteir level", "The whole point is
// a new way of ai, an ai datacenter in the cloud and in the pocket that works exactly like fronteir ai +
// the features i told u" and "All native btw, its ai data center in ur pocket, none of that ollama crap".
// A visitor types and the organism answers IN THEIR TAB first: the page imports the organism's own
// modules (act/converse.mjs, act/exact-read.mjs, act/word.mjs, act/thread.mjs, act/cells-tab.mjs),
// copied here BYTE FOR BYTE from the repository, so a tab answer is computed by the same code the CLI
// runs, with no model and no token.
//
// THE CONVERSATION. Turns stack in a thread (the person's prompt, then the organism's answer with its
// route line); the box stays at the bottom; Enter sends and Shift+Enter is a new line; the thread
// scrolls to the newest turn; "new chat" clears it. The thread survives a reload: localStorage holds ONE
// key (THREAD_KEY), the newest KEEP_TURNS turns as [{ prompt, text, read?, route? }], every read and
// write wrapped in try/catch, nothing else stored. A corrupt or throwing store is an empty thread.
//
// FOLLOW-UPS. Every prompt goes through carry(turns, prompt) of act/thread.mjs first. When it carried,
// the turn prints one dim line "read as: <standalone prompt>" and the standalone prompt is what every
// reader below and the server get ("and germany?" after "what is the capital of france" is asked as
// "what is the capital of germany"; "plus 9" after 391 is asked as "what is 391 plus 9").
//
// THE ORDER OF THE TAB: (1) converse(prompt), the conversation region; (2) the exact reader; (3) the
// word problem reader (readExact with opts.word); (4) route() of act/cells-tab.mjs over the grown cells
// web/pocket.mjs bundled under /organism/ (route line "grown cell <id>, generation <n>, no server");
// (5) the server: a prompt none of them carries is POSTed ONCE to /api/ask on the same origin, and the
// SERVER BLOCK renders first ("asking the organism on the server ..."), replaced by the answer or its
// failure; the tab's refusal lines follow it, dim, every one printed. Offline (navigator.onLine false,
// or the request fails while offline) the server block is OFFLINE_LINE, one honest line, not a spinner.
//
// TEXT IS TEXT. Every view below is DATA, a node [tag, attrs, ...children] whose string children are
// text; mount() builds it with createElement, setAttribute and text nodes, and the page never writes
// markup (no innerHTML, outerHTML, insertAdjacentHTML or document.write). A server answer, a cell's text,
// a stored turn and the prompt itself reach the DOM as text whatever they hold. mount() makes only the
// tags of its own list and only class, id and data-* attributes.
//
// THE POCKET. generateAsk() calls web/pocket.mjs generatePocket() after it writes the page, so the cells,
// cells.json, the web app manifest, the icon and the service worker are written on every build. The page
// links the manifest, sets the theme colour (the body background, which is what the manifest takes) and
// the apple mobile web app metas, and registers /ask/sw.js (scope /ask/) only when serviceWorker is in
// navigator and the page is on https or localhost.
//
// The view functions below are exported so the tests call them in node, and the page carries their
// source text (Function.prototype.toString), so the tested function IS the page's function. The *Html
// functions are their node side serialisation (toHtml), kept for the tests and the benches.
//
// Writes web/dist/ask/index.html and web/dist/organism/ (the copied modules and manifest.json with the
// sha256 of every copy, which must equal the sha256 of its source or the build throws), then the pocket.
// Run: node web/ask.mjs   (web/build.mjs calls generateAsk() on every build)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { generatePocket, POCKET_HEAD } from './pocket.mjs';
import { OFFLINE_LINE } from '../act/cells-tab.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIST = path.join(ROOT, 'web', 'dist');
// Every module the browser organism imports, as repository paths. Each must import only the others.
export const MODULES = Object.freeze(['act/exact-read.mjs', 'tasks/exact.mjs', 'act/word.mjs', 'act/converse.mjs', 'act/thread.mjs', 'act/cells-tab.mjs']);
// What the page offers as one-click prompts: two turns of the conversation region, the reader's
// shapes, and one the tab must send to the server.
export const EXAMPLES = Object.freeze([
  'hey',
  'who are you',
  'what is 17 times 23',
  '2 to the power of 100',
  '15 percent of 200',
  'the square root of 144',
  'subtract 3 from 10',
  'Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?',
  'write a poem about the sea',
]);
// The first visible line of the server block while the request is in flight (his rule: the first
// thing a phone shows after a prompt the tab does not carry is that the organism is answering it).
export const PENDING_LINE = 'asking the organism on the server ...';
// How long the page waits for the server before it prints the failure in the server block.
export const SERVER_TIMEOUT_MS = 25000;
// The thread in localStorage: one key, the newest KEEP_TURNS turns, each text cut to TEXT_CAP characters
// (its head and its last lines, where the numeric answer a follow-up reads is printed).
export const THREAD_KEY = 'dilation.thread';
export const KEEP_TURNS = 20;
export const TEXT_CAP = 8000;
// Where web/pocket.mjs puts cells.json and the cells, and where the service worker lives.
export const CELLS_BASE = '/organism/';
export const SW_URL = '/ask/sw.js';
export const SW_SCOPE = '/ask/';
// The page background: the CSS body background, the theme-color meta and (through web/pocket.mjs
// askColors) the manifest's theme and background colours are this one value.
export const BACKGROUND = '#02030a';
export const HELLO_LINE = 'ready. type a question, or pick one below. Enter sends, Shift+Enter is a new line; a follow-up is read against the turns before it.';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// ---------------------------------------------------------------- the page functions
// Each is pure, references only the page functions above it, the page constants (THREAD_KEY,
// KEEP_TURNS, TEXT_CAP, OFFLINE_LINE) and the globals of every browser and of Node 24 (performance),
// and is written into the page by page().

/** Escape text for HTML text and attribute values (the node side serialisation and the tests). */
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Nanoseconds per call of fn on this device: warm, grow a batch until it takes 2 ms, then the median of 7 batches. */
export function clock(fn) {
  for (let i = 0; i < 20; i++) fn();
  let n = 8;
  for (;;) { const a = performance.now(); for (let i = 0; i < n; i++) fn(); if (performance.now() - a >= 2 || n >= 1 << 20) break; n *= 2; }
  const b = [];
  for (let k = 0; k < 7; k++) { const a = performance.now(); for (let i = 0; i < n; i++) fn(); b.push((performance.now() - a) * 1e6 / n); }
  b.sort((x, y) => x - y);
  return { ns: Math.max(1, Math.round(b[3])), asks: n * 7 };
}

/**
 * Build a view in doc: a node is [tag, attrs, ...children], a string or number child is a TEXT node,
 * null and '' are nothing. Only the tags below and class, id and data-* attributes are made; anything
 * else throws (a view is written by this file, never by the data it shows).
 */
export function mount(doc, n) {
  if (!Array.isArray(n)) return doc.createTextNode(String(n));
  const [tag, attrs, ...kids] = n;
  if (!['div', 'pre', 'span', 'b', 'code'].includes(tag)) throw new Error('mount: no <' + tag + '> in a view');
  const el = doc.createElement(tag);
  for (const k of Object.keys(attrs || {})) {
    if (attrs[k] == null) continue;
    if (!/^(class|id|data-[a-z0-9-]+)$/.test(k)) throw new Error('mount: no ' + k + ' attribute in a view');
    el.setAttribute(k, String(attrs[k]));
  }
  for (const c of kids) if (c != null && c !== '') el.appendChild(mount(doc, c));
  return el;
}

/** The empty thread's line. */
export function helloView() {
  return ['div', { class: 'entry dim', id: 'hello' }, HELLO_LINE];
}

/** The person's turn: the prompt as typed, and, when it carried, one dim line with the prompt that was asked. */
export function youView(typed, read) {
  return ['div', { class: 'q' }, ['div', { class: 'you' }, ['span', { class: 'acc' }, '>'], ' ' + typed],
    read ? ['div', { class: 'dim read', 'data-read': '1' }, 'read as: ' + read] : null];
}

/** A turn the conversation region carried, answered in the tab: the answer first, then how. */
export function tabNativeView(nat, c) {
  return ['div', { class: 'tab' },
    ['div', { class: 'ans say', 'data-answer': nat.answer, 'data-native': nat.kind }, nat.answer],
    ['pre', { class: 'dim' }, 'answered natively in this tab by the conversation region (kind ' + nat.kind + '), with no model, no memory read and no network.'],
    ['div', { class: 'foot', 'data-route': 'direct', 'data-provenance': 'native' }, 'route ', ['span', { class: 'ok' }, 'direct'], '  provenance ', ['span', { class: 'ok' }, 'native'],
      '  kind ' + nat.kind + '  model none  tokens 0  network 0  ', ['span', { class: 'ok', 'data-ns': c.ns }, c.ns.toLocaleString('en-US') + ' ns per ask on this device'],
      ' (median of 7 batches, ' + c.asks.toLocaleString('en-US') + ' asks)']];
}

/** A question the exact reader (or the word problem reader inside it) carried, answered in the tab. */
export function tabExactView(r, c) {
  return ['div', { class: 'tab' },
    ['pre', { class: 'dim' }, 'answered exactly by ' + r.method + ', with no model and no network.\n' + r.steps.map((s) => '- ' + s).join('\n')],
    ['div', { class: 'ans', 'data-answer': r.answer }, r.answer],
    ['div', { class: 'foot', 'data-route': 'exact', 'data-provenance': 'exact' }, 'route ', ['span', { class: 'ok' }, 'exact'], '  provenance ', ['span', { class: 'ok' }, 'exact'],
      '  method ' + r.method + '  model none  tokens 0  network 0  ', ['span', { class: 'ok', 'data-ns': c.ns }, c.ns.toLocaleString('en-US') + ' ns per ask on this device'],
      ' (median of 7 batches, ' + c.asks.toLocaleString('en-US') + ' asks)']];
}

/** A prompt a grown cell carried, answered in the tab with the cell web/pocket.mjs bundled: no server. */
export function cellView(hit, gen) {
  const ms = Math.round(Number(hit.ms) * 100) / 100;
  return ['div', { class: 'tab' },
    ['pre', { class: 'reply', 'data-answer': hit.text, 'data-cell': hit.cell }, hit.text],
    ['div', { class: 'foot', 'data-route': 'cell', 'data-provenance': 'grown' }, 'route ', ['span', { class: 'ok' }, 'grown cell ' + hit.cell + ', generation ' + (gen == null ? 'unknown' : gen) + ', no server'],
      '  class ' + (hit.class == null ? 'unknown' : hit.class) + '  model none  tokens 0  ' + (Number.isFinite(ms) ? ms : 0) + ' ms in this tab']];
}

/** The server block while the request is in flight; waitedS > 0 says how long it has waited. */
export function pendingView(waitedS) {
  return ['div', { class: 'srv pending acc', 'data-server-pending': '1' }, 'asking the organism on the server ...' + (waitedS > 0 ? ' ' + waitedS + ' s, still waiting' : '')];
}

/** The tab's refusal lines, dim, every one printed; note says what the grown cells did with it. */
export function refusalView(unknown, why, note) {
  return ['div', { class: 'refusal dim', 'data-refusal': '1' },
    ['pre', { class: 'dim' }, 'no cell in this tab carries this question, so the tab refuses it, not guesses; the organism on the server answers it.'],
    ['div', { class: 'foot', 'data-route': 'refused', 'data-provenance': 'none' }, 'tab: route refused  provenance none  model none (the model cell is not in the browser)  tokens 0'
      + (unknown.length ? '  words the spoken reader could not read: ' + unknown.join(', ') : '')],
    why ? ['div', { class: 'foot' }, 'the word problem reader stopped at: ' + why] : null,
    note ? ['div', { class: 'foot', 'data-cells': '1' }, note] : null];
}

/** Offline: the one honest line in place of the server block, never a spinner. */
export function offlineView() {
  return ['div', { class: 'srv', 'data-server-done': '1', 'data-status': '0', 'data-offline': '1' }, ['div', { class: 'foot' }, ['span', { class: 'warn' }, OFFLINE_LINE]]];
}

/** The server's model line as view children: none, or the provider and model it called. */
export function modelParts(l) {
  if (!l) return ['model none'];
  if (l.ok && l.provider && l.provider !== 'null') return ['model ' + l.provider + '/' + (l.model || '-') + ' ' + Math.round(l.ms || 0) + ' ms ' + (l.tokens || 0) + ' tokens'];
  return ['model none' + (l.reason ? ': ' + l.reason : ''), l.fellBack ? '  ' : null, l.fellBack ? ['span', { class: 'warn' }, 'fell back from ' + l.fellBack] : null];
}

/**
 * The once-only rule for a server answer. mode 'equal': the text IS the answer (textIsTheAnswer), print
 * the answer once. mode 'tail': the text ends, on its own line, with the native or exact answer, so the
 * head lines print dim and the answer prints once. mode 'text': the text has no such tail (a memory or
 * model answer), so the text prints as it came, and an answer the JSON carries prints below it.
 */
export function answerOnce(j) {
  const src = j.exact && j.exact.answer != null ? j.exact : j.native && j.native.answer != null ? j.native : null;
  const text = String(j.text == null ? '' : j.text).trimEnd();
  const a = src ? String(src.answer).trim() : '';
  if (!a) return { mode: 'text', answer: src ? String(src.answer) : null, head: null, text };
  if (text.trim() === a) return { mode: 'equal', answer: String(src.answer), head: null, text };
  const cut = text.length - a.length;
  if (cut > 0 && text.endsWith(a) && text[cut - 1] === '\n') return { mode: 'tail', answer: String(src.answer), head: text.slice(0, cut).trimEnd(), text };
  return { mode: 'text', answer: String(src.answer), head: null, text };
}

/** The server block once the server answered, or its failure: status, route, provenance, model, two clocks. */
export function serverView(s) {
  const j = s.j || {};
  const rtt = Math.round(s.rttMs);
  if (s.status !== 200 || !j.ok) {
    const why = s.err ? 'the server half did not answer: ' + s.err : 'the server answered ' + s.status + ': ' + (j.error || 'no JSON') + (s.retry ? ' (retry after ' + s.retry + ' s)' : '');
    return ['div', { class: 'srv', 'data-server-done': '1', 'data-status': String(s.status), 'data-rtt-ms': rtt }, ['div', { class: 'foot' }, ['span', { class: 'warn' }, 'server'], '  ' + why + '  round trip ' + rtt + ' ms in this tab']];
  }
  const l = j.llm || {}, p = j.provenance || {}, k = j.knowledge || {};
  const nat = j.native && j.native.answer != null ? j.native : null;
  const once = answerOnce(j);
  const isExact = Boolean(j.exact && j.exact.answer != null);
  const ans = once.answer == null ? null
    : isExact ? ['div', { class: 'ans srv-ans', 'data-srv-answer': once.answer }, once.answer]
      : ['div', { class: 'ans say srv-ans srv-native', 'data-srv-answer': once.answer, 'data-srv-native': String(nat.kind) }, once.answer];
  const body = once.mode === 'equal' ? [ans]
    : once.mode === 'tail' ? [ans, once.head ? ['pre', { class: 'srvtext dim', 'data-srv-head': '1' }, once.head] : null]
      : [['pre', { class: 'srvtext' }, String(j.text)], ans];
  return ['div', { class: 'srv', 'data-server-done': '1', 'data-status': '200', 'data-srv-route': String(j.route), 'data-srv-provenance': String(p.answer), 'data-srv-provider': l.provider == null ? 'none' : String(l.provider),
    'data-server-us': String(Number(j.serverUs)), 'data-rtt-ms': rtt, 'data-srv-once': once.mode }, ...body,
  ['div', { class: 'foot' }, 'server: route ', ['span', { class: 'acc' }, String(j.route)], '  provenance ', ['span', { class: 'acc' }, String(p.answer)], '  ', ...modelParts(l),
    '  memory hits ' + (p.memoryHits || 0) + '  web pages ' + (p.webPages || 0)
    + (j.exact && typeof j.exact.ns === 'number' ? '  exact ' + j.exact.ns.toLocaleString('en-US') + ' ns' : '')
    + (nat && typeof nat.ns === 'number' ? '  native ' + nat.ns.toLocaleString('en-US') + ' ns' : '') + '  ',
    ['span', { class: 'ok' }, Number(j.serverUs).toLocaleString('en-US') + ' us on the server'], ' (' + String(j.host) + ')  round trip ' + rtt + ' ms in this tab'],
  k.ready ? null : ['div', { class: 'foot' }, 'knowledge store on the server: absent (' + (k.why || 'not ingested') + '), so the knowledge tier answers nothing there.']];
}

/** A turn read back from this device after a reload: its text as it was answered, and how. */
export function restoredView(t) {
  return ['div', { class: 'tab', 'data-restored': '1' }, t.text ? ['pre', { class: 'reply' }, t.text] : null,
    ['div', { class: 'foot' }, 'restored from this device' + (t.route ? ': ' + t.route : '')]];
}

/** A text cut to TEXT_CAP characters: its head, a gap line, and its last 2000 characters. */
export function clip(s) {
  const t = String(s == null ? '' : s);
  return t.length <= TEXT_CAP ? t : t.slice(0, TEXT_CAP - 2005) + '\n...\n' + t.slice(-2000);
}

/** The turns a store may hold: each { prompt, text, read?, route? } of strings, the newest KEEP_TURNS. */
export function cleanTurns(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const t of raw) {
    if (!t || typeof t !== 'object' || typeof t.prompt !== 'string' || typeof t.text !== 'string') continue;
    const prompt = t.prompt.trim().slice(0, 2000);
    if (!prompt) continue;
    const turn = { prompt, text: clip(t.text) };
    if (typeof t.read === 'string' && t.read.trim()) turn.read = t.read.trim().slice(0, 2000);
    if (typeof t.route === 'string' && t.route.trim()) turn.route = t.route.trim().slice(0, 300);
    out.push(turn);
  }
  return out.slice(-KEEP_TURNS);
}

/** The thread a store holds, or [] (no store, a store that throws, JSON that does not parse). */
export function loadTurns(store) {
  try {
    const s = store ? store.getItem(THREAD_KEY) : null;
    return s ? cleanTurns(JSON.parse(s)) : [];
  } catch {
    return [];
  }
}

/** Write the thread (an empty one removes the key); false when there is no store or it throws. */
export function saveTurns(store, turns) {
  try {
    if (!store) return false;
    const keep = cleanTurns(turns);
    if (keep.length) store.setItem(THREAD_KEY, JSON.stringify(keep));
    else store.removeItem(THREAD_KEY);
    return true;
  } catch {
    return false;
  }
}

/** May this page register the service worker: serviceWorker in navigator, and https or localhost. */
export function swAllowed(nav, loc) {
  if (!nav || typeof nav !== 'object' || !('serviceWorker' in nav) || !loc) return false;
  const h = String(loc.hostname || '');
  return loc.protocol === 'https:' || h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h.endsWith('.localhost');
}

/** Does this keydown send the prompt: Enter without Shift, outside an input method composition. */
export function sendsOnKey(ev) {
  return Boolean(ev) && ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing && ev.keyCode !== 229;
}

// The page functions in the order the page script declares them.
export const PAGE_FUNCTIONS = Object.freeze({ esc, clock, mount, helloView, youView, tabNativeView, tabExactView, cellView, pendingView, refusalView, offlineView, modelParts, answerOnce, serverView, restoredView, clip, cleanTurns, loadTurns, saveTurns, swAllowed, sendsOnKey });
const pageSource = () => Object.entries(PAGE_FUNCTIONS).map(([name, fn]) => (/^function\s/.test(fn.toString()) ? fn.toString() : 'const ' + name + ' = ' + fn.toString() + ';')).join('\n');

// ---------------------------------------------------------------- the node side serialisation

/** A view as HTML: the markup mount() builds, with every text and attribute value escaped. */
export function toHtml(n) {
  if (n == null || n === '') return '';
  if (!Array.isArray(n)) return esc(n);
  const [tag, attrs, ...kids] = n;
  let s = '<' + tag;
  for (const k of Object.keys(attrs || {})) if (attrs[k] != null) s += ' ' + k + '="' + esc(attrs[k]) + '"';
  return s + '>' + kids.map(toHtml).join('') + '</' + tag + '>';
}
export const tabNativeHtml = (nat, c) => toHtml(tabNativeView(nat, c));
export const tabExactHtml = (r, c) => toHtml(tabExactView(r, c));
export const pendingHtml = (waitedS) => toHtml(pendingView(waitedS));
/** A prompt no cell in the tab carries: the SERVER block first, then the tab's refusal lines, dim, every one printed. */
export const refusedHtml = (unknown, why, note) => toHtml(pendingView(0)) + toHtml(refusalView(unknown, why, note));
export const modelLine = (l) => modelParts(l).map(toHtml).join('');
export const serverHtml = (s) => toHtml(serverView(s));

// ---------------------------------------------------------------- the build

/** Copy the organism modules that exist, verify every byte, write the manifest. */
export function copyOrganism(dist = DIST) {
  const out = path.join(dist, 'organism');
  const files = [];
  for (const rel of MODULES) {
    const src = path.join(ROOT, rel);
    if (!existsSync(src)) continue;
    const bytes = readFileSync(src);
    const text = bytes.toString('utf8');
    for (const m of text.matchAll(/^\s*import\s[^'"]*?from\s*['"]([^'"]+)['"]/gm)) {
      const dep = path.relative(ROOT, path.resolve(path.dirname(src), m[1])).split(path.sep).join('/');
      if (!MODULES.includes(dep)) throw new Error('web/ask.mjs: ' + rel + ' imports ' + m[1] + ', which is not a browser organism module');
    }
    if (/\bfrom\s*['"]node:|\brequire\(|\bprocess\.|\bfetch\(/.test(text)) throw new Error('web/ask.mjs: ' + rel + ' touches node, the process or the network');
    const dst = path.join(out, rel);
    mkdirSync(path.dirname(dst), { recursive: true });
    writeFileSync(dst, bytes);
    const back = sha256(readFileSync(dst));
    if (back !== sha256(bytes)) throw new Error('web/ask.mjs: the copy of ' + rel + ' differs from its source');
    files.push({ file: rel, bytes: bytes.length, sha256: back });
  }
  const manifest = { what: 'the organism modules this site runs in the visitor tab, copied byte for byte from the repository by web/ask.mjs', files };
  writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

/** The page. The module script is the only script; it imports the copies above and nothing else. */
export function page(manifest) {
  const has = (f) => manifest.files.some((x) => x.file === f);
  const hasWord = has('act/word.mjs'), hasConverse = has('act/converse.mjs'), hasThread = has('act/thread.mjs'), hasCells = has('act/cells-tab.mjs');
  const shas = manifest.files.map((f) => '<span class="port">' + esc(f.file) + ' ' + f.sha256.slice(0, 12) + '</span>').join(' ');
  const chips = EXAMPLES.filter((e) => (hasWord || !/Natalia/.test(e)) && (hasConverse || !['hey', 'who are you'].includes(e)))
    .map((e) => '<button class="chip" type="button" data-q="' + esc(e) + '">' + esc(e.length > 64 ? e.slice(0, 61) + '...' : e) + '</button>').join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ASK / DILATION</title>
<meta name="description" content="Ask the organism, as a conversation. A greeting, a sum, a word problem or what its grown cells hold is answered in your tab with no request; a follow-up is read against the turns before it; anything else goes to the organism on the server, which prints its route.">
<meta name="theme-color" content="${BACKGROUND}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Dilation">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
${POCKET_HEAD}
<style>
:root { color-scheme: dark; --ink: #e8eefc; --dim: #7f8ba6; --line: rgba(150,180,255,0.14); --glass: rgba(10,14,26,0.62); --ok: #7fffb0; --warn: #ffb27f; --acc: #7fb0ff; }
* { box-sizing: border-box; }
html, body { margin: 0; background: ${BACKGROUND}; color: var(--ink); font: 13px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
main { max-width: 920px; margin: 0 auto; padding: 28px 16px 0; }
a { color: var(--acc); }
.top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin: 0 0 6px; }
h1 { font-size: 13px; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 600; margin: 0; }
.dim { color: var(--dim); }
.ok { color: var(--ok); }
.warn { color: var(--warn); }
.acc { color: var(--acc); }
.port { display: inline-block; max-width: 100%; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 5px; padding: 0 6px; margin: 2px 2px 0 0; font-size: 11px; color: var(--dim); }
#term { margin-top: 14px; background: var(--glass); border: 1px solid var(--line); border-radius: 10px; min-height: 240px; padding: 14px 16px; overflow-wrap: anywhere; }
.entry { margin-bottom: 14px; scroll-margin-bottom: 150px; }
.entry + .entry { border-top: 1px solid var(--line); padding-top: 12px; }
.entry pre { margin: 4px 0; white-space: pre-wrap; font: inherit; }
.you { white-space: pre-wrap; }
.read { font-size: 12px; margin: 2px 0 0 14px; }
.ans { font-size: 22px; color: var(--ok); letter-spacing: 0.02em; margin: 4px 0; }
.ans.say { font-size: 16px; line-height: 1.5; letter-spacing: 0; }
.entry .reply { font-size: 14px; line-height: 1.6; color: var(--ink); }
.pending { margin: 4px 0; }
.refusal { margin-top: 6px; opacity: 0.85; }
.refusal .foot { font-size: 11px; }
.foot { color: var(--dim); font-size: 12px; }
form { position: sticky; bottom: 0; z-index: 2; display: flex; gap: 8px; align-items: flex-end; margin-top: 12px; padding: 10px 0 calc(14px + env(safe-area-inset-bottom)); background: ${BACKGROUND}; border-top: 1px solid var(--line); }
#q { flex: 1; min-width: 0; background: #060913; color: var(--ink); border: 1px solid var(--line); border-radius: 8px; padding: 11px 12px; font: inherit; font-size: 16px; line-height: 1.4; resize: none; max-height: 40vh; overflow-y: auto; display: block; }
#q:focus { outline: none; border-color: var(--acc); box-shadow: 0 0 0 3px rgba(127,176,255,0.12); }
button { font: inherit; cursor: pointer; }
#go { background: #0d1630; color: var(--ink); border: 1px solid var(--acc); border-radius: 8px; padding: 10px 16px; letter-spacing: 0.12em; text-transform: uppercase; font-size: 11px; }
#new { background: transparent; color: var(--dim); border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
#new:hover { color: var(--ink); border-color: var(--acc); }
.chips { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.chip { background: transparent; color: var(--dim); border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px; font-size: 11px; max-width: 100%; overflow-wrap: anywhere; text-align: left; }
.chip:hover { color: var(--ink); border-color: var(--acc); }
details.foot { margin-top: 10px; }
summary { cursor: pointer; }
nav { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 18px; }
code { color: var(--ink); overflow-wrap: anywhere; }
@media (max-width: 480px) { .prompt-label { display: none; } main { padding-top: 20px; } }
</style>
</head>
<body>
<main>
<nav><a href="../">organism</a><a href="../ladder/">ladder</a><a href="../findings/">findings</a><a href="../portfolio/">portfolio</a></nav>
<div class="top"><h1>Ask the organism</h1><button id="new" type="button">new chat</button></div>
<div class="dim">A conversation with the organism, answered in this tab first. The code below is its own conversation region (a greeting, a question about the organism, thanks, a farewell), its exact reader, its word problem reader, its follow-up reader and the router to the cells it grew, the same files <code>node bin/brain.mjs ask</code> runs, copied byte for byte: no model, no token. A follow-up ("and germany?", "plus 9", "when was she born") is rewritten by rule into a question that stands alone, printed as "read as", and that is what is asked. A question no reader and no grown cell carries is posted once to the organism on the server (<code>/api/ask</code>); the tab's own refusal lines print under that answer, never guessed. Installed from the browser menu, the grown cells answer with no network.</div>
<div style="margin-top:8px">${shas}</div>
<details class="foot"><summary>how every answer prints its route</summary>Every answer prints how it was reached: <b>route</b> (which path answered), <b>provenance</b> (native: the conversation region; exact: computed with BigInt rationals, never rounded; grown: a cell the organism grew; memory; model), <b>model</b> (none: no language model was called, or the provider and model the server called), and its clock: a tab answer prints the nanoseconds per ask measured on YOUR device (median of 7 timed batches of the same ask) or the milliseconds a grown cell took; a server answer prints the microseconds <code>ask()</code> took on the server and the round trip this tab measured in milliseconds. The same question on the command line: <code>node bin/brain.mjs ask dilation "hey" --provider null</code>. The distance to the frontier is on the <a href="../ladder/">ladder</a>, from the verdict files.</details>
<div class="chips">${chips}</div>
<div id="term" aria-live="polite">${toHtml(helloView())}</div>
<form id="f" autocomplete="off"><span class="acc prompt-label">brain ask dilation &gt;</span><textarea id="q" name="q" rows="1" placeholder="hey, or what is 17 times 23" spellcheck="false" enterkeyhint="send" aria-label="your prompt"></textarea><button id="go" type="submit">ask</button></form>
</main>
<script type="module">
${hasConverse ? "import { converse } from '../organism/act/converse.mjs';" : 'const converse = () => null;'}
import { readExact, spokenExpression, spokenLeftover } from '../organism/act/exact-read.mjs';
${hasWord ? "import { readWord, wordRefusal } from '../organism/act/word.mjs';" : 'const readWord = null, wordRefusal = null;'}
${hasThread ? "import { carry } from '../organism/act/thread.mjs';" : 'const carry = (turns, prompt) => ({ prompt, carried: false, from: null, rule: null });'}
${hasCells ? "import { loadCells, route, OFFLINE_LINE } from '../organism/act/cells-tab.mjs';" : 'const loadCells = null, route = null, OFFLINE_LINE = ' + JSON.stringify(OFFLINE_LINE) + ';'}
const $ = (s) => document.querySelector(s);
const opts = readWord ? { word: readWord } : {};
const THREAD_KEY = ${JSON.stringify(THREAD_KEY)}, KEEP_TURNS = ${KEEP_TURNS}, TEXT_CAP = ${TEXT_CAP}, HELLO_LINE = ${JSON.stringify(HELLO_LINE)};
${pageSource()}
// The one request this page ever makes: a prompt the tab refused, POSTed once to the same origin.
const API = '/api/ask';
async function server(q) {
  const t0 = performance.now();
  const out = { status: 0, j: null, err: null, retry: null, rttMs: 0 };
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const stop = ctl ? setTimeout(() => ctl.abort(), ${SERVER_TIMEOUT_MS}) : null;
  try {
    const res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: q }), signal: ctl ? ctl.signal : undefined });
    out.status = res.status;
    out.retry = res.headers.get('retry-after');
    try { out.j = await res.json(); } catch { out.j = null; }
  } catch (err) {
    out.err = ctl && ctl.signal.aborted ? 'no answer in ${SERVER_TIMEOUT_MS / 1000} s, the request was stopped' : String((err && err.message) || err);
  }
  if (stop) clearTimeout(stop);
  out.rttMs = performance.now() - t0;
  return out;
}
// The thread this tab holds, read back from this device (one localStorage key; a store that throws is no store).
const store = () => { try { return window.localStorage || null; } catch { return null; } };
let turns = loadTurns(store());
let epoch = 0;
const online = () => !(typeof navigator !== 'undefined' && navigator && navigator.onLine === false);
const put = (e, view) => e.appendChild(mount(document, view));
const show = (e) => { try { e.scrollIntoView({ block: 'end' }); } catch {} };
function record(my, typed, c, text, how) {
  if (my !== epoch) return;
  const t = { prompt: typed, text: String(text == null ? '' : text), route: how };
  if (c.carried) t.read = c.prompt;
  turns = cleanTurns(turns.concat([t]));
  saveTurns(store(), turns);
}
// The grown cells web/pocket.mjs bundled: cells.json read once, a cell imported the first time a prompt reaches it.
let cells = null;
function grown() {
  if (!cells) cells = loadCells(new URL(${JSON.stringify(CELLS_BASE)}, location.href).href).catch((err) => { cells = null; throw err; });
  return cells;
}
// The order of the tab: the follow-up carry, then (1) the conversation region, (2) the exact reader, (3) the word
// problem reader, (4) the grown cells, (5) the server.
async function ask(q) {
  const typed = String(q || '').trim(); if (!typed) return null;
  const my = epoch;
  let c = { prompt: typed, carried: false, rule: null };
  try { const k = carry(turns, typed); if (k && k.carried && typeof k.prompt === 'string' && k.prompt.trim()) c = k; } catch {}
  q = c.prompt;
  const read = c.carried ? q : null;
  const hello = $('#hello'); if (hello) hello.remove();
  const e = mount(document, ['div', { class: 'entry' }]);
  put(e, youView(typed, read));
  $('#term').appendChild(e); show(e);
  const nat = converse(q);
  if (nat) {
    put(e, tabNativeView(nat, clock(() => converse(q)))); show(e);
    record(my, typed, c, nat.answer, 'direct, native, kind ' + nat.kind);
    return { tab: true, answer: nat.answer, route: 'direct', provenance: 'native', kind: nat.kind, read };
  }
  const r = readExact(q, opts);
  if (r) {
    put(e, tabExactView(r, clock(() => readExact(q, opts)))); show(e);
    record(my, typed, c, r.answer, 'exact, method ' + r.method);
    return { tab: true, answer: r.answer, route: 'exact', provenance: 'exact', read };
  }
  let note = null;
  if (route) {
    try {
      const router = await grown();
      const hit = await route(router, q);
      if (hit) {
        const row = router.rows.find((x) => x.id === hit.cell);
        const gen = row && row.generation != null ? row.generation : router.generation;
        put(e, cellView(hit, gen)); show(e);
        record(my, typed, c, hit.text, 'grown cell ' + hit.cell + ', generation ' + (gen == null ? 'unknown' : gen) + ', no server');
        return { tab: true, answer: hit.text, route: 'cell', provenance: 'grown', cell: hit.cell, generation: gen, read };
      }
      note = 'the grown cells in this tab: none of the ' + router.rows.length + ' carries it.';
    } catch (err) {
      note = 'the grown cells did not load in this tab (' + String((err && err.message) || err) + '), so none was asked.';
    }
  }
  // A new chat started while the cells were read: this prompt belongs to the cleared thread, so it is not sent.
  if (my !== epoch) return { tab: false, dropped: true, read };
  const refusal = refusalView(spokenLeftover(q).slice(0, 8), wordRefusal ? wordRefusal(q) : null, note);
  if (!online()) {
    put(e, offlineView()); put(e, refusal); show(e);
    record(my, typed, c, '', 'offline, not sent');
    return { tab: false, offline: true, read };
  }
  let slot = mount(document, pendingView(0));
  e.appendChild(slot); put(e, refusal); show(e);
  const t0 = performance.now();
  const tick = setInterval(() => {
    const w = Math.round((performance.now() - t0) / 1000);
    if (w >= 3 && slot.getAttribute('data-server-pending')) { const n = mount(document, pendingView(w)); slot.replaceWith(n); slot = n; }
  }, 1000);
  const s = await server(q);
  clearInterval(tick);
  const off = Boolean(s.err) && !online();
  slot.replaceWith(mount(document, off ? offlineView() : serverView(s)));
  show(e);
  const ok = s.status === 200 && s.j && s.j.ok;
  record(my, typed, c, ok ? s.j.text : '', off ? 'offline, not answered' : ok ? 'server, route ' + s.j.route + ', provenance ' + ((s.j.provenance && s.j.provenance.answer) || 'none') : 'server, no answer (' + (s.err || 'status ' + s.status) + ')');
  return { tab: false, status: s.status, json: s.j, offline: off, read };
}
// One prompt at a time, in the order typed: a follow-up is carried against the answer before it.
let chain = Promise.resolve();
function send(v) { const p = chain.then(() => ask(v)); chain = p.then(() => null, () => null); return p; }
function newChat() {
  epoch++;
  turns = [];
  saveTurns(store(), turns);
  $('#term').replaceChildren(mount(document, helloView()));
  $('#q').focus();
}
const box = $('#q');
const fit = () => { try { box.style.height = 'auto'; box.style.height = Math.min(Math.max(box.scrollHeight || 0, 44), 200) + 'px'; } catch {} };
function submit() { const v = box.value; box.value = ''; fit(); return send(v); }
$('#f').addEventListener('submit', (ev) => { ev.preventDefault(); submit(); });
box.addEventListener('keydown', (ev) => { if (sendsOnKey(ev)) { ev.preventDefault(); submit(); } });
box.addEventListener('input', fit);
$('#new').addEventListener('click', newChat);
for (const b of document.querySelectorAll('.chip')) b.addEventListener('click', () => send(b.dataset.q));
if (turns.length) {
  const hello = $('#hello'); if (hello) hello.remove();
  let last = null;
  for (const t of turns) { last = mount(document, ['div', { class: 'entry', 'data-restored': '1' }, youView(t.prompt, t.read || null), restoredView(t)]); $('#term').appendChild(last); }
  show(last);
}
// The pocket: the service worker of /ask/, on https or localhost only.
if (swAllowed(typeof navigator === 'undefined' ? null : navigator, location)) {
  try { const p = navigator.serviceWorker.register(${JSON.stringify(SW_URL)}, { scope: ${JSON.stringify(SW_SCOPE)} }); if (p && typeof p.catch === 'function') p.catch(() => {}); } catch {}
}
const pre = new URLSearchParams(location.search).get('q'); if (pre) send(pre);
window.__brainAsk = { ready: true, spoken: spokenExpression, ask, send, newChat, turns: () => turns.slice() };
box.focus();
</script>
</body>
</html>
`;
}

/** Build /ask into dist (web/dist by default; a bench passes a scratch directory), then the pocket beside it. */
export function generateAsk(dist = DIST) {
  const manifest = copyOrganism(dist);
  const html = page(manifest);
  const dir = path.join(dist, 'ask');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
  // THE POCKET (web/pocket.mjs): the cells, cells.json, the manifest, the icon and the service worker, on every build.
  // It reads the page and the organism manifest just written, so it runs after them; a cell that breaks the contract
  // or a copy whose sha256 differs throws here, and the build with it.
  const pocket = generatePocket({ dist });
  return { bytes: Buffer.byteLength(html), modules: manifest.files.length, manifest, html, dist, pocket };
}

if (process.argv[1] && process.argv[1].endsWith(path.join('web', 'ask.mjs'))) {
  const r = generateAsk();
  console.log('dist ask/index.html ' + r.bytes + ' bytes; organism modules ' + r.modules + ': ' + r.manifest.files.map((f) => f.file + ' ' + f.bytes + ' bytes sha256 ' + f.sha256.slice(0, 12)).join(', ')
    + '; pocket: cells ' + r.pocket.cells + ', precache ' + r.pocket.precache + ' files, ' + r.pocket.bytes + ' bytes, version ' + r.pocket.version.slice(0, 12));
}
