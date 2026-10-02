// web/ask.mjs: THE PROMPT BOX ON dilation.dev, A SURFACE OF THE CLOUD (queue item 12, docs/CLOUD-SESSION.md; orders 9 and 10).
//
// His words (grow/NEO.md head): "it should be cli in dilation.dev someday so i can prompt like any ai" (2026-09-26);
// "Should work exactly like llms fronteir level" (2026-10-01); and of 2026-10-02: "its should be all on cloud so even
// phones can use no hardware constraints its cloud ai" and "$0 per token to run its ai datacenter in the cloud and works
// Exaxtly like a FRONTEIR LLM". So the CLOUD does the work and any phone gets all of it: the page is only its surface.
//
// CLOUD FIRST. Every prompt is POSTed to the organism in the cloud (/api/ask on the same origin) and the answer prints
// with its route. The first paint and the first prompt wait for NOTHING of the organism: the page's one script imports no
// module; the readers and the cells are imported only when the cloud cannot be reached (firstVisit() counts the bytes a
// first visit downloads before it can ask, and web/build.mjs prints them).
//
// THE DEVICE TIER IS ONLY THE OFFLINE FALLBACK. When the device is offline, the request fails, times out or the cloud
// answers anything but an answer, the page says so in one line (fallbackView) and asks what this device already holds,
// in order: the conversation region, the exact reader (with the word problem reader), the grown cells web/pocket.mjs
// bundled (act/cells-tab.mjs route; a NEO colony only on THE GATE's template fit) and a cell grown on this device
// (web/pocket-era.mjs deviceAnswer). These are the same files `node bin/brain.mjs ask` runs, copied byte for byte.
//
// IT FEELS LIKE AN LLM. A thread: turns stack, Enter sends, Shift+Enter is a new line, "new chat" clears it, and it
// survives a reload (ONE localStorage key, THREAD_KEY). FOLLOW-UPS carry the last relation: when the last answer was a
// lookup (its `via`: pack, key, column, op), "and X?" asks the same relation of X (carryRelation); otherwise the
// follow-up reader act/thread.mjs (imported only when the thread has a turn) rewrites it by rule; either way the turn
// prints one dim "read as" line. STREAMING is feature-detected: a response whose content type is application/x-ndjson
// or text/event-stream is read as it arrives (each line {"delta": "..."} appends text; the line that carries "ok" is
// the final JSON); any other response is read whole. A MISS IS NEVER A DEAD END: when the response says the cloud took
// the prompt as a task (`task`, `growing.logged`, `queued`), the page says so plainly (missLine).
//
// THE LIVE ORGANISM. A strip under the box reads /alive/data.json (web/alive.mjs) after the first paint and prints the
// era, cells, tasks, mastered, the held-out count, velocity, plateau, the last promote, the trials and the compute
// ledger, each only when data.json carries it; never on save-data.
//
// THE DEVICE WORKER is OFF by default: a switch starts it (web/pocket-era.mjs startBody), never the page by itself,
// and never on a metered connection, with save-data on or on a low battery (startBody refuses).
//
// INSTALLABLE: the manifest and the service worker of web/pocket.mjs (scope /, registered after the page is idle and
// never on save-data; vercel.json and web/serve.mjs send Service-Worker-Allowed "/" on /ask/sw.js and serve /ask with
// no redirect).
//
// TEXT IS TEXT. Every view below is DATA, a node [tag, attrs, ...children] whose string children are text; mount()
// builds it with createElement, setAttribute and text nodes, and the page never writes markup. A cloud answer, a cell's
// text, a stored turn and the prompt reach the DOM as text whatever they hold. The view functions are exported so the
// tests call them in node, and the page carries their source text (Function.prototype.toString), so the tested
// function IS the page's function.
//
// Writes <dist>/ask/index.html and <dist>/organism/ (the copied modules and manifest.json with the sha256 of every copy,
// which must equal the sha256 of its source or the build throws), then the pocket.
// Run: node web/ask.mjs   (web/build.mjs calls generateAsk() on every build)
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { generatePocket, POCKET_HEAD, SW_URL, SW_SCOPE } from './pocket.mjs';
import { ROUTE_LINE, SWITCH_KEY } from './pocket-era.mjs';
import { OFFLINE_LINE } from '../act/cells-tab.mjs';

export { SW_URL, SW_SCOPE };

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIST = path.join(ROOT, 'web', 'dist');
// Every module the device tier imports, as repository paths. Each must import only the others.
export const MODULES = Object.freeze(['act/exact-read.mjs', 'tasks/exact.mjs', 'act/word.mjs', 'act/converse.mjs', 'act/thread.mjs', 'act/cells-tab.mjs']);
// The device tier's imports by role (the page imports one only when it needs it).
export const TIER = Object.freeze({ converse: 'act/converse.mjs', exact: 'act/exact-read.mjs', word: 'act/word.mjs', thread: 'act/thread.mjs', cells: 'act/cells-tab.mjs' });
// What the page offers as one-click prompts.
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
// The first visible line while the cloud has not answered.
export const PENDING_LINE = 'asking the organism in the cloud ...';
// How long the page waits for the cloud before it stops the request and falls back to this device.
export const SERVER_TIMEOUT_MS = 25000;
// The thread in localStorage: one key, the newest KEEP_TURNS turns, each text cut to TEXT_CAP characters.
export const THREAD_KEY = 'dilation.thread';
export const KEEP_TURNS = 20;
export const TEXT_CAP = 8000;
// Where web/pocket.mjs puts cells.json, the cells and the device worker's module.
export const CELLS_BASE = '/organism/';
export const BODY_URL = '../organism/web/pocket-era.mjs';
// The live organism's numbers (web/alive.mjs writes them at every build).
export const ALIVE_URL = '/alive/data.json';
// The route line of an answer from a cell grown on this device (web/pocket-era.mjs deviceAnswer).
export const DEVICE_ROUTE = ROUTE_LINE;
// The content types the page reads as a stream.
export const STREAM_TYPES = Object.freeze(['application/x-ndjson', 'text/event-stream']);
// The page background: the CSS body background, the theme-color meta and (web/pocket.mjs askColors) the manifest's colours.
export const BACKGROUND = '#02030a';
export const HELLO_LINE = 'ready. every prompt goes to the organism in the cloud and comes back with its route; this device answers only when the cloud cannot be reached. Enter sends, Shift+Enter is a new line; a follow-up is read against the turns before it.';
export const BODY_OFF_LINE = 'this device grows nothing: the cloud does the work. The switch lets it grow cells too (never on a metered connection, with save-data on or on a low battery).';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// ---------------------------------------------------------------- the page functions
// Each is pure, references only the page functions above it, the page constants (THREAD_KEY, KEEP_TURNS, TEXT_CAP,
// OFFLINE_LINE, DEVICE_ROUTE) and the globals of every browser and of Node 22 and 24, and is written into the page.

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
 * Build a view in doc: a node is [tag, attrs, ...children], a string or number child is a TEXT node, null and '' are
 * nothing. Only the tags below and class, id and data-* attributes are made; anything else throws.
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

/** The offline fallback's one line: why the cloud gave no answer, and that what follows is this device's answer. */
export function fallbackView(why) {
  return ['div', { class: 'foot', 'data-fallback': '1' }, ['span', { class: 'warn' }, 'offline fallback'],
    '  the cloud gave no answer (' + why + '), so this device answered from what it already holds:'];
}

/** A turn the conversation region carried on this device. */
export function tabNativeView(nat, c) {
  return ['div', { class: 'tab' },
    ['div', { class: 'ans say', 'data-answer': nat.answer, 'data-native': nat.kind }, nat.answer],
    ['div', { class: 'foot', 'data-route': 'direct', 'data-provenance': 'native' }, 'device: route ', ['span', { class: 'ok' }, 'direct'], '  provenance native  kind ' + nat.kind
      + '  model none  tokens 0  network 0  ', ['span', { class: 'ok', 'data-ns': c.ns }, c.ns.toLocaleString('en-US') + ' ns per ask on this device']]];
}

/** A question the exact reader (or the word problem reader inside it) carried on this device. */
export function tabExactView(r, c) {
  return ['div', { class: 'tab' },
    ['pre', { class: 'dim' }, 'answered exactly by ' + r.method + '.\n' + r.steps.map((s) => '- ' + s).join('\n')],
    ['div', { class: 'ans', 'data-answer': r.answer }, r.answer],
    ['div', { class: 'foot', 'data-route': 'exact', 'data-provenance': 'exact' }, 'device: route ', ['span', { class: 'ok' }, 'exact'], '  method ' + r.method
      + '  model none  tokens 0  network 0  ', ['span', { class: 'ok', 'data-ns': c.ns }, c.ns.toLocaleString('en-US') + ' ns per ask on this device']]];
}

/** A prompt a grown cell carried on this device (the cell web/pocket.mjs bundled). */
export function cellView(hit, gen) {
  const ms = Math.round(Number(hit.ms) * 100) / 100;
  return ['div', { class: 'tab' },
    ['pre', { class: 'reply', 'data-answer': hit.text, 'data-cell': hit.cell }, hit.text],
    ['div', { class: 'foot', 'data-route': 'cell', 'data-provenance': 'grown' }, 'device: route ', ['span', { class: 'ok' }, 'grown cell ' + hit.cell + ', generation ' + (gen == null ? 'unknown' : gen)],
      '  class ' + (hit.class == null ? 'unknown' : hit.class) + '  model none  tokens 0  ' + (Number.isFinite(ms) ? ms : 0) + ' ms on this device']];
}

/** A prompt a cell grown on THIS device carried (web/pocket-era.mjs deviceAnswer). */
export function deviceView(d) {
  return ['div', { class: 'tab' },
    ['pre', { class: 'reply', 'data-answer': d.text, 'data-device': d.task }, d.text],
    ['div', { class: 'foot', 'data-route': 'device', 'data-provenance': 'grown' }, 'device: route ', ['span', { class: 'ok' }, DEVICE_ROUTE], '  task ' + d.task + '  cells ' + d.cells + '  model none  tokens 0']];
}

/** The cloud block while the request is in flight; waitedS > 0 says how long it has waited. */
export function pendingView(waitedS) {
  return ['div', { class: 'srv pending acc', 'data-server-pending': '1' }, 'asking the organism in the cloud ...' + (waitedS > 0 ? ' ' + waitedS + ' s, still waiting' : '')];
}

/** The cloud block while a streamed answer arrives: the text so far. */
export function streamView(text) {
  return ['div', { class: 'srv', 'data-streaming': '1' }, ['pre', { class: 'reply' }, text], ['div', { class: 'foot' }, ['span', { class: 'acc' }, 'streaming from the cloud ...']]];
}

/** Nothing this device holds carries the prompt either: one dim line, and what was asked. */
export function deviceMissView(note) {
  return ['div', { class: 'refusal dim', 'data-refusal': '1' },
    ['div', { class: 'foot', 'data-route': 'refused', 'data-provenance': 'none' }, 'device: nothing this device holds carries it, so it refuses it, not guesses' + (note ? ' (' + note + ')' : '') + '. Ask again when the cloud answers.']];
}

/** Offline and nothing on this device carries the prompt: the one honest line, never a spinner. */
export function offlineView() {
  return ['div', { class: 'srv', 'data-server-done': '1', 'data-status': '0', 'data-offline': '1' }, ['div', { class: 'foot' }, ['span', { class: 'warn' }, OFFLINE_LINE]]];
}

/** The cloud's model line as view children: none, or the provider and model it called. */
export function modelParts(l) {
  if (!l) return ['model none'];
  if (l.ok && l.provider && l.provider !== 'null') return ['model ' + l.provider + '/' + (l.model || '-') + ' ' + Math.round(l.ms || 0) + ' ms ' + (l.tokens || 0) + ' tokens'];
  return ['model none' + (l.reason ? ': ' + l.reason : ''), l.fellBack ? '  ' : null, l.fellBack ? ['span', { class: 'warn' }, 'fell back from ' + l.fellBack] : null];
}

/**
 * The once-only rule for a cloud answer. mode 'equal': the text IS the answer, print it once. mode 'tail': the text
 * ends, on its own line, with the native or exact answer, so the head prints dim and the answer once. mode 'text': the
 * text has no such tail, so it prints as it came, and an answer the JSON carries prints below it.
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

/** The line that says the cloud took a prompt it could not answer as a task, or null when the response does not say. */
export function missLine(j) {
  if (!j || typeof j !== 'object') return null;
  const g = j.growing && typeof j.growing === 'object' ? j.growing : null;
  const name = (v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 80) : null);
  const task = name(j.task) || (g ? name(g.task) : null);
  if (task) return 'the cloud has taken this as a task (' + task + ') and grows cells for it in its next era; ask again after that.';
  if (g && g.logged === true) return 'the cloud has taken this as a task: it is logged, and its next era grows cells for it; ask again after that.';
  if (j.queued === true) return 'the cloud has taken this as a task: it is queued, and its next era grows cells for it; ask again after that.';
  if (g && g.logged === false) return 'the cloud could not log this as a task (' + (name(g.reason) || 'no reason given') + '), so nothing grows for it yet.';
  return null;
}

/** The lookup an answer was composed from ({ pack, key, column, op }, strings), or null. */
export function viaOf(j) {
  const v = j && typeof j === 'object' ? (j.native && typeof j.native === 'object' && j.native.via) || j.via : null;
  if (!v || typeof v !== 'object') return null;
  const s = (x) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, 120) : null);
  const out = { pack: s(v.pack), key: s(v.key), column: s(v.column), op: s(v.op) };
  return out.pack || out.column ? out : null;
}

/** The cloud block once the cloud answered, or its failure: status, route, provenance, model, the lookup, two clocks. */
export function serverView(s) {
  const j = s.j || {};
  const rtt = Math.round(s.rttMs);
  if (s.status !== 200 || !j.ok) {
    const why = s.err ? 'the cloud did not answer: ' + s.err : 'the cloud answered ' + s.status + ': ' + (j.error || 'no JSON') + (s.retry ? ' (retry after ' + s.retry + ' s)' : '');
    return ['div', { class: 'srv', 'data-server-done': '1', 'data-status': String(s.status), 'data-rtt-ms': rtt }, ['div', { class: 'foot' }, ['span', { class: 'warn' }, 'cloud'], '  ' + why + '  round trip ' + rtt + ' ms']];
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
  const via = viaOf(j), miss = missLine(j);
  const us = Number(j.serverUs);
  return ['div', { class: 'srv', 'data-server-done': '1', 'data-status': '200', 'data-srv-route': String(j.route), 'data-srv-provenance': String(p.answer), 'data-srv-provider': l.provider == null ? 'none' : String(l.provider),
    'data-server-us': String(us), 'data-rtt-ms': rtt, 'data-srv-once': once.mode, 'data-streamed': s.streamed ? '1' : null }, ...body,
  miss ? ['div', { class: 'foot miss', 'data-miss': '1' }, ['span', { class: 'acc' }, 'taken as a task'], '  ' + miss] : null,
  via ? ['div', { class: 'foot', 'data-via': '1' }, 'looked up: pack ' + (via.pack || '-') + ', key ' + (via.key || '-') + ', column ' + (via.column || '-') + (via.op ? ', op ' + via.op : '')] : null,
  ['div', { class: 'foot' }, 'cloud: route ', ['span', { class: 'acc' }, String(j.route)], '  provenance ', ['span', { class: 'acc' }, String(p.answer)], '  ', ...modelParts(l),
    '  memory hits ' + (p.memoryHits || 0) + '  web pages ' + (p.webPages || 0) + '  ',
    Number.isFinite(us) ? ['span', { class: 'ok' }, us.toLocaleString('en-US') + ' us in the cloud'] : null, (j.host ? ' (' + String(j.host) + ')' : '') + '  round trip ' + rtt + ' ms'],
  k.ready === false ? ['div', { class: 'foot' }, 'knowledge store in the cloud: absent (' + (k.why || 'not ingested') + ').'] : null];
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

/** The turns a store may hold: each { prompt, text, read?, route?, via? }, the newest KEEP_TURNS. */
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
    if (t.via && typeof t.via === 'object') {
      const v = {};
      for (const k of ['pack', 'key', 'column', 'op']) if (typeof t.via[k] === 'string' && t.via[k].trim()) v[k] = t.via[k].trim().slice(0, 120);
      if (v.pack || v.column) turn.via = v;
    }
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

/**
 * A follow-up that asks the LAST RELATION of something else: after an answer looked up by { key, column }, "and X?",
 * "what about X?", "how about X?" or "same for X" asks the standalone question with X in place of the key (or, when the
 * question does not hold the key, "what is the <column> of X"). null when it is not such a follow-up.
 */
export function carryRelation(last, typed) {
  const t = String(typed == null ? '' : typed).trim();
  const v = last && typeof last === 'object' ? last.via : null;
  if (!t || !v || typeof v !== 'object' || typeof last.prompt !== 'string') return null;
  const m = /^(?:and what about|and how about|and|what about|how about|same for)\s+(.+?)\s*\?*$/i.exec(t);
  if (!m) return null;
  const x = m[1].trim();
  if (!x || x.length > 120) return null;
  const base = typeof last.read === 'string' && last.read.trim() ? last.read.trim() : last.prompt;
  if (typeof v.key === 'string' && v.key) {
    const i = base.toLowerCase().indexOf(v.key.toLowerCase());
    if (i >= 0) return { prompt: base.slice(0, i) + x + base.slice(i + v.key.length), carried: true, from: base, rule: 'relation' };
  }
  if (typeof v.column === 'string' && v.column) return { prompt: 'what is the ' + v.column + ' of ' + x, carried: true, from: base, rule: 'relation' };
  return null;
}

/** 'ndjson', 'sse' or null: how a response with this content type is read. */
export function streamKind(ct) {
  const c = String(ct == null ? '' : ct).toLowerCase();
  if (c.includes('application/x-ndjson') || c.includes('application/jsonl')) return 'ndjson';
  if (c.includes('text/event-stream')) return 'sse';
  return null;
}

/**
 * Read a streamed answer as it arrives: every line (an SSE "data:" line) is one JSON object; { delta } appends text
 * and calls onDelta with the text so far; the object that carries "ok" is the final answer. A line that does not parse
 * is skipped. Without a final object the text is the answer. Returns { j, text, events }.
 */
export async function readStream(res, kind, onDelta) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', text = '', final = null, events = 0;
  const take = (line) => {
    let s = line.trim();
    if (kind === 'sse') { if (!s.startsWith('data:')) return; s = s.slice(5).trim(); }
    if (!s || s === '[DONE]') return;
    let o;
    try { o = JSON.parse(s); } catch { return; }
    if (!o || typeof o !== 'object' || Array.isArray(o)) return;
    events++;
    if (typeof o.delta === 'string' && o.delta) { text += o.delta; if (onDelta) onDelta(text); }
    if ('ok' in o) final = o;
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += typeof value === 'string' ? value : dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) { take(buf.slice(0, i)); buf = buf.slice(i + 1); }
  }
  buf += dec.decode();
  if (buf) take(buf);
  const j = final ? { ...final } : text ? { ok: true, text, route: 'stream', provenance: { answer: 'stream' } } : null;
  if (j && j.text == null && text) j.text = text;
  return { j, text, events };
}

/** The live strip from /alive/data.json (web/alive.mjs): the organism's own numbers, or null when it holds none. */
export function stripView(d) {
  const n = d && typeof d === 'object' && d.neo && typeof d.neo === 'object' ? d.neo : null;
  const now = n && n.now && typeof n.now === 'object' ? n.now : null;
  if (!now) return null;
  const num = (v) => typeof v === 'number' && Number.isFinite(v);
  const parts = [];
  const add = (v, one, many) => { if (num(v)) parts.push(v.toLocaleString('en-US') + ' ' + (v === 1 ? one : many)); };
  if (num(now.era)) parts.push('era ' + now.era);
  add(now.cells, 'cell', 'cells');
  add(now.tasks, 'task', 'tasks');
  if (num(now.mastered)) parts.push(now.mastered + ' mastered');
  if (num(now.ok) && num(now.n)) parts.push('held-out ' + now.ok + ' of ' + now.n + (num(now.score) ? ' (' + now.score + ')' : ''));
  const vel = Array.isArray(now.velocity) ? now.velocity.find((x) => x && x.key === 'cellsPerSecond' && num(x.value)) : null;
  if (vel) parts.push(vel.value + ' cells per second');
  if (num(now.plateau)) parts.push('plateau ' + now.plateau);
  const p = n.pipeline && typeof n.pipeline === 'object' ? n.pipeline : null;
  if (p && typeof p.promoted === 'boolean') parts.push('last promote ' + (p.promoted ? 'kept' : 'refused') + (num(p.era) ? ' at era ' + p.era : ''));
  // the trials and the compute ledger, each only when data.json carries it (web/alive.mjs neo.selfMod.trials, neo.compute)
  const t = n.selfMod && typeof n.selfMod === 'object' && n.selfMod.trials && typeof n.selfMod.trials === 'object' ? n.selfMod.trials : null;
  if (t && num(t.rows) && num(t.kept)) parts.push('trials ' + t.kept + ' kept of ' + t.rows);
  const cf = n.compute && typeof n.compute === 'object' && Array.isArray(n.compute.fields) ? n.compute.fields : [];
  const field = (k) => { const x = cf.find((f) => f && f.key === k); return x && num(x.value) ? x.value : null; };
  const spent = field('spentMinutes'), budget = field('budgetMinutes');
  if (spent !== null) parts.push('compute ' + spent + (budget !== null ? ' of ' + budget : '') + (spent === 1 && budget === null ? ' minute' : ' minutes'));
  if (!parts.length) return null;
  return ['div', { class: 'foot strip', 'data-alive': '1' }, ['span', { class: 'ok' }, 'live'], '  the organism in the cloud: ' + parts.join(', ')
    + (typeof d.builtAt === 'string' ? ' (built ' + d.builtAt.slice(0, 40) + ')' : '')];
}

/** Save-data is on: the page then fetches nothing it does not need to answer. */
export function saveDataOn(nav) {
  return Boolean(nav && typeof nav === 'object' && nav.connection && nav.connection.saveData === true);
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
export const PAGE_FUNCTIONS = Object.freeze({ esc, clock, mount, helloView, youView, fallbackView, tabNativeView, tabExactView, cellView, deviceView, pendingView, streamView, deviceMissView,
  offlineView, modelParts, answerOnce, missLine, viaOf, serverView, restoredView, clip, cleanTurns, loadTurns, saveTurns, carryRelation, streamKind, readStream, stripView, saveDataOn, swAllowed, sendsOnKey });
const pageSource = () => Object.entries(PAGE_FUNCTIONS).map(([name, fn]) => (/^(async\s+)?function\s/.test(fn.toString()) ? fn.toString() : 'const ' + name + ' = ' + fn.toString() + ';')).join('\n');

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
  const manifest = { what: 'the organism modules this site runs on the visitor device when the cloud cannot be reached, copied byte for byte from the repository by web/ask.mjs', files };
  writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

/** The device tier's URLs (relative to /ask) for the modules the manifest carries: { converse, exact, word, thread, cells }. */
export function tierUrls(manifest) {
  const has = (f) => manifest.files.some((x) => x.file === f);
  const out = {};
  for (const [role, file] of Object.entries(TIER)) if (has(file)) out[role] = '../organism/' + file;
  return out;
}

/** The /ask page: no static import, so the first paint and the first prompt wait for nothing of the organism. */
export function page(manifest) {
  const shas = manifest.files.map((f) => '<span class="port">' + esc(f.file) + ' ' + f.sha256.slice(0, 12) + '</span>').join(' ');
  const chips = EXAMPLES.map((e) => '<button class="chip" type="button" data-q="' + esc(e) + '">' + esc(e.length > 64 ? e.slice(0, 61) + '...' : e) + '</button>').join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ASK / DILATION</title>
<meta name="description" content="Ask the organism in the cloud, as a conversation: every prompt goes to the cloud and comes back with its route; any phone gets all of it, and this device answers only when the cloud cannot be reached.">
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
.strip { margin-top: 10px; overflow-wrap: anywhere; }
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
#bodyrow { margin-top: 10px; }
[hidden] { display: none !important; }
details.foot { margin-top: 10px; }
summary { cursor: pointer; }
nav { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 18px; }
code { color: var(--ink); overflow-wrap: anywhere; }
@media (max-width: 480px) { .prompt-label { display: none; } main { padding-top: 20px; } }
</style>
</head>
<body>
<main>
<nav><a href="../">organism</a><a href="/alive">alive</a><a href="../ladder/">ladder</a><a href="../findings/">findings</a><a href="../portfolio/">portfolio</a></nav>
<div class="top"><h1>Ask the organism</h1><button id="new" type="button">new chat</button></div>
<div class="dim">A conversation with the organism in the cloud. Every prompt is posted to it (<code>/api/ask</code>) and its answer prints with its route; no model, no token, and nothing to install: any phone gets all of it. A follow-up ("and germany?", "plus 9") is read against the turns before it and printed as "read as". A prompt the cloud cannot answer yet is taken as a task: it says so, and its next era grows cells for it. Only when the cloud cannot be reached does this device answer, from what it already holds, and the answer says so.</div>
<div class="foot strip" id="alive"><a href="/alive">the organism, live</a></div>
<details class="foot"><summary>how every answer prints its route</summary>Every answer prints how it was reached: <b>route</b> (which path answered), <b>provenance</b> (native: the conversation region; exact: computed with BigInt rationals, never rounded; grown: a cell the organism grew; memory; model), <b>model</b> (none: no language model was called), the lookup an answer was composed from, the microseconds the cloud took and the round trip this page measured. When the cloud is not reached, this device runs the same files <code>node bin/brain.mjs ask</code> runs, copied byte for byte, and prints the nanoseconds per ask measured on it: <div style="margin-top:6px">${shas}</div></details>
<div class="chips">${chips}</div>
<div class="foot" id="bodyrow"><span id="body">${esc(BODY_OFF_LINE)}</span> <button id="bodysw" class="chip" type="button" aria-pressed="false">grow on this device too</button></div>
<div id="term" aria-live="polite">${toHtml(helloView())}</div>
<form id="f" autocomplete="off"><span class="acc prompt-label">brain ask dilation &gt;</span><textarea id="q" name="q" rows="1" placeholder="hey, or what is 17 times 23" spellcheck="false" enterkeyhint="send" aria-label="your prompt"></textarea><button id="go" type="submit">ask</button></form>
</main>
<script type="module">
const $ = (s) => document.querySelector(s);
const THREAD_KEY = ${JSON.stringify(THREAD_KEY)}, KEEP_TURNS = ${KEEP_TURNS}, TEXT_CAP = ${TEXT_CAP}, HELLO_LINE = ${JSON.stringify(HELLO_LINE)}, DEVICE_ROUTE = ${JSON.stringify(DEVICE_ROUTE)}, OFFLINE_LINE = ${JSON.stringify(OFFLINE_LINE)};
${pageSource()}
// The cloud: every prompt, POSTed once to the same origin. A stream is read as it arrives; anything else whole.
const API = '/api/ask';
async function cloud(q, onDelta) {
  const t0 = performance.now();
  const out = { status: 0, j: null, err: null, retry: null, rttMs: 0, streamed: false };
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const stop = ctl ? setTimeout(() => ctl.abort(), ${SERVER_TIMEOUT_MS}) : null;
  try {
    const res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/x-ndjson, text/event-stream;q=0.9, application/json;q=0.8' }, body: JSON.stringify({ prompt: q }), signal: ctl ? ctl.signal : undefined });
    out.status = res.status;
    const h = (k) => (res.headers && typeof res.headers.get === 'function' ? res.headers.get(k) : null);
    out.retry = h('retry-after');
    const kind = streamKind(h('content-type'));
    if (kind && res.body && typeof res.body.getReader === 'function') { const r = await readStream(res, kind, onDelta); out.j = r.j; out.streamed = true; }
    else { try { out.j = await res.json(); } catch { out.j = null; } }
  } catch (err) {
    out.err = ctl && ctl.signal.aborted ? 'no answer in ${SERVER_TIMEOUT_MS / 1000} s, the request was stopped' : String((err && err.message) || err);
  }
  if (stop) clearTimeout(stop);
  out.rttMs = performance.now() - t0;
  return out;
}
// The device tier, imported only when the cloud cannot be reached (and the follow-up reader only when the thread has a
// turn): one import each, retried after a failure.
const TIER = ${JSON.stringify(tierUrls(manifest))};
function lazy(u) { let p = null; return () => { if (!u) return Promise.resolve(null); if (!p) p = import(u).then((m) => m, () => { p = null; return null; }); return p; }; }
const mods = { converse: lazy(TIER.converse), exact: lazy(TIER.exact), word: lazy(TIER.word), thread: lazy(TIER.thread), cells: lazy(TIER.cells), body: lazy(${JSON.stringify(BODY_URL)}) };
const fits = async (t, s) => { const m = await mods.body(); return m && typeof m.gateFits === 'function' ? m.gateFits(t, s) : false; };
let cells = null;
function grown(ct) {
  if (!cells) cells = ct.loadCells(new URL(${JSON.stringify(CELLS_BASE)}, location.href).href, { fits }).catch((err) => { cells = null; throw err; });
  return cells;
}
// The order on this device: the conversation region, the exact reader (with the word problem reader), the grown cells,
// a cell grown on this device. { view, text, how, out } on an answer, { note } when none carries it.
async function deviceTier(q) {
  const notes = [];
  const cv = await mods.converse();
  const nat = cv && typeof cv.converse === 'function' ? cv.converse(q) : null;
  if (nat) return { view: tabNativeView(nat, clock(() => cv.converse(q))), text: nat.answer, how: 'direct, native, kind ' + nat.kind, out: { answer: nat.answer, route: 'direct', provenance: 'native', kind: nat.kind } };
  const ex = await mods.exact();
  if (ex && typeof ex.readExact === 'function') {
    const w = await mods.word();
    const opts = w && typeof w.readWord === 'function' ? { word: w.readWord } : {};
    const r = ex.readExact(q, opts);
    if (r) return { view: tabExactView(r, clock(() => ex.readExact(q, opts))), text: r.answer, how: 'exact, method ' + r.method, out: { answer: r.answer, route: 'exact', provenance: 'exact' } };
  }
  const ct = await mods.cells();
  if (ct && typeof ct.loadCells === 'function' && typeof ct.route === 'function') {
    try {
      const router = await grown(ct);
      const hit = await ct.route(router, q);
      if (hit) {
        const row = router.rows.find((x) => x.id === hit.cell);
        const gen = row && row.generation != null ? row.generation : router.generation;
        return { view: cellView(hit, gen), text: hit.text, how: 'grown cell ' + hit.cell + ', generation ' + (gen == null ? 'unknown' : gen), out: { answer: hit.text, route: 'cell', provenance: 'grown', cell: hit.cell, generation: gen } };
      }
      notes.push('none of the ' + router.rows.length + ' cells it holds carries it');
    } catch (err) {
      notes.push('its cells did not load: ' + String((err && err.message) || err));
    }
  }
  try {
    const b = await mods.body();
    const d = b && typeof b.deviceAnswer === 'function' ? await b.deviceAnswer(q) : null;
    if (d && typeof d.text === 'string') return { view: deviceView(d), text: d.text, how: DEVICE_ROUTE + ', task ' + d.task, out: { answer: d.text, route: 'device', provenance: 'grown', task: d.task } };
  } catch {}
  return { view: null, note: notes.join('; ') || null };
}
// The thread this page holds, read back from this device (one localStorage key; a store that throws is no store).
const store = () => { try { return window.localStorage || null; } catch { return null; } };
const nav = typeof navigator === 'undefined' ? null : navigator;
let turns = loadTurns(store());
let epoch = 0;
const online = () => !(nav && nav.onLine === false);
const put = (e, view) => e.appendChild(mount(document, view));
const show = (e) => { try { e.scrollIntoView({ block: 'end' }); } catch {} };
function record(my, typed, c, text, how, via) {
  if (my !== epoch) return;
  const t = { prompt: typed, text: String(text == null ? '' : text), route: how };
  if (c.carried) t.read = c.prompt;
  if (via) t.via = via;
  turns = cleanTurns(turns.concat([t]));
  saveTurns(store(), turns);
}
async function ask(q) {
  const typed = String(q || '').trim(); if (!typed) return null;
  const my = epoch;
  let c = carryRelation(turns[turns.length - 1], typed) || { prompt: typed, carried: false, rule: null };
  if (!c.carried && turns.length) {
    try { const th = await mods.thread(); const k = th && typeof th.carry === 'function' ? th.carry(turns, typed) : null; if (k && k.carried && typeof k.prompt === 'string' && k.prompt.trim()) c = k; } catch {}
  }
  if (my !== epoch) return { dropped: true, read: null };
  q = c.prompt;
  const read = c.carried ? q : null;
  const hello = $('#hello'); if (hello) hello.remove();
  const e = mount(document, ['div', { class: 'entry' }]);
  put(e, youView(typed, read));
  $('#term').appendChild(e); show(e);
  let why = 'this device is offline', s = null;
  if (online()) {
    let slot = mount(document, pendingView(0));
    e.appendChild(slot); show(e);
    const t0 = performance.now();
    const tick = setInterval(() => {
      const w = Math.round((performance.now() - t0) / 1000);
      if (w >= 3 && slot.getAttribute('data-server-pending')) { const n = mount(document, pendingView(w)); slot.replaceWith(n); slot = n; }
    }, 1000);
    s = await cloud(q, (text) => { if (my !== epoch) return; const n = mount(document, streamView(text)); slot.replaceWith(n); slot = n; show(e); });
    clearInterval(tick);
    if (s.status === 200 && s.j && s.j.ok) {
      slot.replaceWith(mount(document, serverView(s))); show(e);
      const j = s.j, via = viaOf(j);
      record(my, typed, c, j.text, 'cloud, route ' + j.route + ', provenance ' + ((j.provenance && j.provenance.answer) || 'none'), via);
      const once = answerOnce(j);
      return { cloud: true, status: s.status, json: j, answer: once.answer != null ? once.answer : once.text, route: String(j.route), streamed: s.streamed, miss: missLine(j), via, read };
    }
    if (online()) { slot.replaceWith(mount(document, serverView(s))); why = s.err ? s.err : 'it answered ' + s.status; }
    else slot.remove();
  }
  if (my !== epoch) return { cloud: false, dropped: true, read };
  const d = await deviceTier(q);
  if (my !== epoch) return { cloud: false, dropped: true, read };
  if (d.view) {
    put(e, fallbackView(why)); put(e, d.view); show(e);
    record(my, typed, c, d.text, 'offline fallback on this device: ' + d.how);
    return { cloud: false, fallback: true, why, status: s ? s.status : 0, read, ...d.out };
  }
  put(e, online() ? deviceMissView(d.note) : offlineView()); show(e);
  record(my, typed, c, '', online() ? 'the cloud did not answer (' + why + ')' : 'offline, not sent');
  return { cloud: false, fallback: false, offline: !online(), why, status: s ? s.status : 0, read };
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
for (const b of document.querySelectorAll('[data-q]')) b.addEventListener('click', () => send(b.dataset.q));
if (turns.length) {
  const hello = $('#hello'); if (hello) hello.remove();
  let lastEl = null;
  for (const t of turns) { lastEl = mount(document, ['div', { class: 'entry', 'data-restored': '1' }, youView(t.prompt, t.read || null), restoredView(t)]); $('#term').appendChild(lastEl); }
  show(lastEl);
}
// THE DEVICE WORKER (web/pocket-era.mjs): off unless the switch says on; imported only then, never on a metered
// connection, with save-data on or on a low battery (startBody refuses).
let body = null;
function bodyCtl() {
  if (!body) body = mods.body().then((m) => (m && typeof m.startBody === 'function' ? m.startBody({ document, navigator: nav, Worker: typeof Worker === 'function' ? Worker : null, storage: store(), lineEl: $('#body'), switchEl: $('#bodysw'), bind: false }) : null)).then((b) => { if (!b) body = null; return b; }, () => { body = null; return null; });
  return body;
}
$('#bodysw').addEventListener('click', async () => {
  const b = await bodyCtl();
  if (b) await b.toggle(); else { const l = $('#body'); if (l) l.textContent = 'this browser could not load the device worker.'; }
});
// After the first paint: the live strip, the service worker and a switch left on. None on save-data but the switch.
const later = (f) => { try { if (window && typeof window.requestIdleCallback === 'function') return window.requestIdleCallback(() => f(), { timeout: 4000 }); } catch {} return setTimeout(f, 300); };
later(() => {
  let on = null;
  try { const st = store(); on = st ? st.getItem(${JSON.stringify(SWITCH_KEY)}) : null; } catch {}
  if (on === '1') bodyCtl();
  if (saveDataOn(nav)) return;
  Promise.resolve().then(() => fetch(${JSON.stringify(ALIVE_URL)})).then((r) => (r && r.ok ? r.json() : null)).then((d) => { const v = stripView(d); const el = $('#alive'); if (v && el) el.replaceChildren(mount(document, v)); }).catch(() => {});
  // The pocket: the service worker, scope ${SW_SCOPE} (it holds /ask and the device tier under /organism/), on https or
  // localhost only; a registration of the same worker under another scope (the old /ask/) is removed.
  if (swAllowed(nav, location)) {
    try {
      const sw = nav.serviceWorker, path = (u) => { try { return new URL(u, location.href).pathname; } catch { return ''; } };
      const p = sw.register(${JSON.stringify(SW_URL)}, { scope: ${JSON.stringify(SW_SCOPE)} }); if (p && typeof p.catch === 'function') p.catch(() => {});
      if (typeof sw.getRegistrations === 'function') Promise.resolve(sw.getRegistrations()).then((rs) => { for (const r of rs || []) { const w = r.active || r.waiting || r.installing; if (w && path(w.scriptURL) === ${JSON.stringify(SW_URL)} && path(r.scope) !== ${JSON.stringify(SW_SCOPE)}) r.unregister(); } }).catch(() => {});
    } catch {}
  }
});
const pre = new URLSearchParams(location.search).get('q'); if (pre) send(pre);
window.__brainAsk = { ready: true, ask, send, newChat, turns: () => turns.slice() };
box.focus();
</script>
</body>
</html>
`;
}

/** The file under dist a URL on the site names, or null (another origin, or nothing there). */
function distPath(dist, u) {
  const url = new URL(u);
  if (url.origin !== 'https://site.invalid') return null;
  const p = decodeURIComponent(url.pathname);
  const f = path.join(dist, ...p.split('/').filter(Boolean));
  const isFile = (x) => { try { return statSync(x).isFile(); } catch { return false; } };
  // what a host with clean URLs serves at the path: the file, then <path>.html, then <path>/index.html
  for (const c of [f, f + '.html', path.join(f, 'index.html')]) if (isFile(c)) return c;
  return null;
}
const staticImports = (src) => [...src.matchAll(/(?:^|[;\n])\s*(?:import|export)\s+(?:[^'"();]*?\s+from\s+)?['"]([^'"]+)['"]/g)].map((m) => m[1]);

/**
 * The bytes a first visit to /ask downloads BEFORE it can ask: the page, every script and stylesheet it loads by
 * itself, and every module those import statically, recursively (a dynamic import() waits for a need, so it is not
 * counted). Read from a built dist: { html, files: [{ url, bytes }], bytes }.
 */
export function firstVisit(dist = DIST, pageUrl = '/ask') {
  const base = new URL(pageUrl, 'https://site.invalid/').href;
  const file = distPath(dist, base);
  if (!file) throw new Error('web/ask.mjs firstVisit: no page at ' + pageUrl + ' in ' + dist);
  const html = readFileSync(file, 'utf8');
  const seen = new Map();
  const visit = (u) => {
    if (seen.has(u)) return;
    const f = distPath(dist, u);
    if (!f) { seen.set(u, 0); return; }
    const b = readFileSync(f);
    seen.set(u, b.length);
    if (/\.m?js$/.test(f)) for (const s of staticImports(b.toString('utf8'))) visit(new URL(s, u).href);
  };
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = /\bsrc="([^"]+)"/.exec(m[1]);
    if (src) { if (!/\b(async|defer)\b/.test(m[1]) || /type="module"/.test(m[1])) visit(new URL(src[1], base).href); continue; }
    if (/type="module"/.test(m[1])) for (const s of staticImports(m[2])) visit(new URL(s, base).href);
  }
  for (const m of html.matchAll(/<link\b[^>]*rel="(?:stylesheet|modulepreload)"[^>]*>/g)) { const h = /\bhref="([^"]+)"/.exec(m[0]); if (h) visit(new URL(h[1], base).href); }
  const files = [...seen].map(([u, bytes]) => ({ url: new URL(u).pathname, bytes }));
  const htmlBytes = Buffer.byteLength(html);
  return { html: htmlBytes, files, bytes: htmlBytes + files.reduce((k, f) => k + f.bytes, 0) };
}

/**
 * Build /ask into dist (web/dist by default; a bench passes a scratch directory), then the pocket beside it. root is
 * where the pocket reads grown/, neo/ and the search core (the repository by default; a test passes a fixture tree).
 */
export function generateAsk(dist = DIST, { root = ROOT } = {}) {
  const manifest = copyOrganism(dist);
  const html = page(manifest);
  const dir = path.join(dist, 'ask');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
  // THE POCKET (web/pocket.mjs): the cells, cells.json, the manifest, the icon and the service worker, on every build.
  // It reads the page and the organism manifest just written, so it runs after them; a cell that breaks the contract
  // or a copy whose sha256 differs throws here, and the build with it.
  const pocket = generatePocket({ root, dist });
  return { bytes: Buffer.byteLength(html), modules: manifest.files.length, manifest, html, dist, pocket, first: firstVisit(dist) };
}

if (process.argv[1] && process.argv[1].endsWith(path.join('web', 'ask.mjs'))) {
  const r = generateAsk();
  console.log('dist ask/index.html ' + r.bytes + ' bytes; first visit before it can ask ' + r.first.bytes + ' bytes in ' + (1 + r.first.files.length) + ' files; organism modules ' + r.modules + ': ' + r.manifest.files.map((f) => f.file + ' ' + f.bytes + ' bytes sha256 ' + f.sha256.slice(0, 12)).join(', ')
    + '; pocket: cells ' + r.pocket.cells + ', precache ' + r.pocket.precache + ' files, ' + r.pocket.bytes + ' bytes, version ' + r.pocket.version.slice(0, 12));
}
