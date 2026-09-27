// web/ask.mjs: THE PROMPT BOX ON dilation.dev (queue item 12, docs/CLOUD-SESSION.md).
//
// His words, 2026-09-26 11:32 EDT: "it should be cli in dilation.dev someday so i can prompt like any
// ai", and 11:55 EDT: "Listen vcs must yell". A visitor types a question and the organism answers it
// IN THEIR TAB: the page imports the organism's own conversation region (act/converse.mjs), exact
// reader (act/exact-read.mjs) and word problem reader (act/word.mjs), copied here BYTE FOR BYTE from
// the repository, so the answer on the page is the answer `node bin/brain.mjs ask` prints, computed
// by the same code, with no server, no model and no token. The clock on the page is the visitor's
// own: the median of seven timed batches of the same ask, printed in nanoseconds per ask.
//
// THE ORDER OF THE TAB (board 25, item tab-converse; his 2026-09-27 09:28 EDT "Yeah but i said hey
// to it and it said it couldnt respond"): (1) converse(prompt), the conversation region: a greeting,
// a question about the organism, thanks or a farewell is answered in the tab with route direct,
// provenance native, model none, tokens 0 and no request; (2) the exact reader; (3) the word problem
// reader (readExact with opts.word); (4) the server. A prompt none of them carries is sent ONCE to
// the organism on the server (POST { prompt } to /api/ask on the same origin, act/ask-http.mjs, the
// Vercel function api/ask.mjs), and the SERVER BLOCK renders FIRST: its first visible line is
// "asking the organism on the server ..." and it is replaced by the server's answer when it arrives
// (a failed or slow request prints its failure in the same block, never silence). The tab's own
// refusal lines (what no cell here carried, the words the spoken reader could not read, where the
// word problem reader stopped) render AFTER the server block in the dim class, every one still
// printed: the route is printed, never guessed. A server answer prints ONCE: when its text ends
// with the native or exact answer, the head lines print dim and the answer prints once.
//
// The render functions below are exported so the tests call them in node, and the page carries
// their source text (Function.prototype.toString), so the tested function IS the page's function.
//
// Writes web/dist/ask/index.html and web/dist/organism/ (the copied modules and manifest.json with
// the sha256 of every copy, which must equal the sha256 of its source or the build throws).
// Run: node web/ask.mjs   (web/build.mjs calls generateAsk() on every build)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIST = path.join(ROOT, 'web', 'dist');
// Every module the browser organism imports, as repository paths. Each must import only the others.
export const MODULES = Object.freeze(['act/exact-read.mjs', 'tasks/exact.mjs', 'act/word.mjs', 'act/converse.mjs']);
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

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// ---------------------------------------------------------------- the page functions
// Each is pure (strings in, a string out), references only the page functions above it and the
// globals of every browser and of Node 24 (performance), and is written into the page by page().

/** Escape text for HTML text and attribute values. */
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

/** A turn the conversation region carried, answered in the tab: the answer first, then how. */
export function tabNativeHtml(nat, c) {
  return '<div class="ans say" data-answer="' + esc(nat.answer) + '" data-native="' + esc(nat.kind) + '">' + esc(nat.answer) + '</div>'
    + '<pre class="dim">answered natively in this tab by the conversation region (kind ' + esc(nat.kind) + '), with no model, no memory read and no network.</pre>'
    + '<div class="foot" data-route="direct" data-provenance="native">route <span class="ok">direct</span>  provenance <span class="ok">native</span>  kind ' + esc(nat.kind)
    + '  model none  tokens 0  network 0  <span class="ok" data-ns="' + c.ns + '">' + c.ns.toLocaleString('en-US') + ' ns per ask on this device</span> (median of 7 batches, ' + c.asks.toLocaleString('en-US') + ' asks)</div>';
}

/** A question the exact reader (or the word problem reader inside it) carried, answered in the tab. */
export function tabExactHtml(r, c) {
  return '<pre class="dim">answered exactly by ' + esc(r.method) + ', with no model and no network.\n' + r.steps.map((s) => '- ' + esc(s)).join('\n') + '</pre>'
    + '<div class="ans" data-answer="' + esc(r.answer) + '">' + esc(r.answer) + '</div>'
    + '<div class="foot" data-route="exact" data-provenance="exact">route <span class="ok">exact</span>  provenance <span class="ok">exact</span>  method ' + esc(r.method)
    + '  model none  tokens 0  network 0  <span class="ok" data-ns="' + c.ns + '">' + c.ns.toLocaleString('en-US') + ' ns per ask on this device</span> (median of 7 batches, ' + c.asks.toLocaleString('en-US') + ' asks)</div>';
}

/** The server block while the request is in flight; waitedS > 0 says how long it has waited. */
export function pendingHtml(waitedS) {
  return '<div class="srv pending acc" data-server-pending="1">asking the organism on the server ...' + (waitedS > 0 ? ' ' + waitedS + ' s, still waiting' : '') + '</div>';
}

/** A prompt no cell in the tab carries: the SERVER block first, then the tab's refusal lines, dim, every one printed. */
export function refusedHtml(unknown, why) {
  return pendingHtml(0)
    + '<div class="refusal dim" data-refusal="1">'
    + '<pre class="dim">no cell in this tab carries this question, so the tab refuses it, not guesses; the organism on the server answers it.</pre>'
    + '<div class="foot" data-route="refused" data-provenance="none">tab: route refused  provenance none  model none (the model cell is not in the browser)  tokens 0'
    + (unknown.length ? '  words the spoken reader could not read: ' + unknown.map(esc).join(', ') : '') + '</div>'
    + (why ? '<div class="foot">the word problem reader stopped at: ' + esc(why) + '</div>' : '')
    + '</div>';
}

/** The server's model line: none, or the provider and model it called. */
export function modelLine(l) {
  if (!l) return 'model none';
  if (l.ok && l.provider && l.provider !== 'null') return 'model ' + esc(l.provider) + '/' + esc(l.model || '-') + ' ' + Math.round(l.ms || 0) + ' ms ' + (l.tokens || 0) + ' tokens';
  return 'model none' + (l.reason ? ': ' + esc(l.reason) : '') + (l.fellBack ? '  <span class="warn">fell back from ' + esc(l.fellBack) + '</span>' : '');
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
export function serverHtml(s) {
  const j = s.j || {};
  const rtt = Math.round(s.rttMs);
  if (s.status !== 200 || !j.ok) {
    const why = s.err ? 'the server half did not answer: ' + esc(s.err) : 'the server answered ' + s.status + ': ' + esc(j.error || 'no JSON') + (s.retry ? ' (retry after ' + esc(s.retry) + ' s)' : '');
    return '<div class="srv" data-server-done="1" data-status="' + s.status + '" data-rtt-ms="' + rtt + '"><div class="foot"><span class="warn">server</span>  ' + why + '  round trip ' + rtt + ' ms in this tab</div></div>';
  }
  const l = j.llm || {}, p = j.provenance || {}, k = j.knowledge || {};
  const nat = j.native && j.native.answer != null ? j.native : null;
  const once = answerOnce(j);
  const textIsTheAnswer = once.mode === 'equal';
  const isExact = Boolean(j.exact && j.exact.answer != null);
  const ans = once.answer == null ? ''
    : isExact ? '<div class="ans srv-ans" data-srv-answer="' + esc(once.answer) + '">' + esc(once.answer) + '</div>'
      : '<div class="ans say srv-ans srv-native" data-srv-answer="' + esc(once.answer) + '" data-srv-native="' + esc(nat.kind) + '">' + esc(once.answer) + '</div>';
  const body = textIsTheAnswer ? ans
    : once.mode === 'tail' ? ans + (once.head ? '<pre class="srvtext dim" data-srv-head="1">' + esc(once.head) + '</pre>' : '')
      : '<pre class="srvtext">' + esc(j.text) + '</pre>' + ans;
  return '<div class="srv" data-server-done="1" data-status="200" data-srv-route="' + esc(j.route) + '" data-srv-provenance="' + esc(p.answer) + '" data-srv-provider="' + esc(l.provider == null ? 'none' : l.provider) + '" data-server-us="' + Number(j.serverUs) + '" data-rtt-ms="' + rtt + '" data-srv-once="' + once.mode + '">'
    + body
    + '<div class="foot">server: route <span class="acc">' + esc(j.route) + '</span>  provenance <span class="acc">' + esc(p.answer) + '</span>  ' + modelLine(l)
    + '  memory hits ' + (p.memoryHits || 0) + '  web pages ' + (p.webPages || 0)
    + (j.exact && typeof j.exact.ns === 'number' ? '  exact ' + j.exact.ns.toLocaleString('en-US') + ' ns' : '')
    + (nat && typeof nat.ns === 'number' ? '  native ' + nat.ns.toLocaleString('en-US') + ' ns' : '')
    + '  <span class="ok">' + Number(j.serverUs).toLocaleString('en-US') + ' us on the server</span> (' + esc(j.host) + ')  round trip ' + rtt + ' ms in this tab</div>'
    + (k.ready ? '' : '<div class="foot">knowledge store on the server: absent (' + esc(k.why || 'not ingested') + '), so the knowledge tier answers nothing there.</div>')
    + '</div>';
}

// The page functions in the order the page script declares them.
export const PAGE_FUNCTIONS = Object.freeze({ esc, clock, tabNativeHtml, tabExactHtml, pendingHtml, refusedHtml, modelLine, answerOnce, serverHtml });
const pageSource = () => Object.entries(PAGE_FUNCTIONS).map(([name, fn]) => (/^function\s/.test(fn.toString()) ? fn.toString() : 'const ' + name + ' = ' + fn.toString() + ';')).join('\n');

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
  const hasWord = has('act/word.mjs'), hasConverse = has('act/converse.mjs');
  const shas = manifest.files.map((f) => '<span class="port">' + esc(f.file) + ' ' + f.sha256.slice(0, 12) + '</span>').join(' ');
  const chips = EXAMPLES.filter((e) => (hasWord || !/Natalia/.test(e)) && (hasConverse || !['hey', 'who are you'].includes(e)))
    .map((e) => '<button class="chip" data-q="' + esc(e) + '">' + esc(e.length > 64 ? e.slice(0, 61) + '...' : e) + '</button>').join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ASK / DILATION</title>
<meta name="description" content="Ask the organism. A greeting, a sum or a word problem is answered in your tab in nanoseconds with no request; anything else goes to the organism on the server, which prints its route.">
<style>
:root { color-scheme: dark; --ink: #e8eefc; --dim: #7f8ba6; --line: rgba(150,180,255,0.14); --glass: rgba(10,14,26,0.62); --ok: #7fffb0; --warn: #ffb27f; --acc: #7fb0ff; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #02030a; color: var(--ink); font: 13px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
main { max-width: 920px; margin: 0 auto; padding: 28px 16px 60px; }
a { color: var(--acc); }
h1 { font-size: 13px; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 600; margin: 0 0 6px; }
.dim { color: var(--dim); }
.ok { color: var(--ok); }
.warn { color: var(--warn); }
.acc { color: var(--acc); }
.port { display: inline-block; max-width: 100%; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 5px; padding: 0 6px; margin: 2px 2px 0 0; font-size: 11px; color: var(--dim); }
#term { margin-top: 18px; background: var(--glass); border: 1px solid var(--line); border-radius: 10px; min-height: 340px; padding: 14px 16px; overflow-wrap: anywhere; }
.entry { margin-bottom: 14px; }
.entry pre { margin: 4px 0; white-space: pre-wrap; font: inherit; }
.ans { font-size: 22px; color: var(--ok); letter-spacing: 0.02em; margin: 4px 0; }
.ans.say { font-size: 16px; line-height: 1.5; letter-spacing: 0; }
.pending { margin: 4px 0; }
.refusal { margin-top: 6px; opacity: 0.85; }
.refusal .foot { font-size: 11px; }
.foot { color: var(--dim); font-size: 12px; }
form { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
#q { flex: 1; min-width: 0; background: #060913; color: var(--ink); border: 1px solid var(--line); border-radius: 8px; padding: 11px 12px; font: inherit; font-size: 16px; }
#q:focus { outline: none; border-color: var(--acc); box-shadow: 0 0 0 3px rgba(127,176,255,0.12); }
button { font: inherit; cursor: pointer; }
#go { background: #0d1630; color: var(--ink); border: 1px solid var(--acc); border-radius: 8px; padding: 10px 16px; letter-spacing: 0.12em; text-transform: uppercase; font-size: 11px; }
.chips { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.chip { background: transparent; color: var(--dim); border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px; font-size: 11px; max-width: 100%; overflow-wrap: anywhere; text-align: left; }
.chip:hover { color: var(--ink); border-color: var(--acc); }
.rule { height: 1px; background: var(--line); margin: 18px 0; }
nav { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 18px; }
code { color: var(--ink); overflow-wrap: anywhere; }
@media (max-width: 480px) { .prompt-label { display: none; } main { padding-top: 20px; } }
</style>
</head>
<body>
<main>
<nav><a href="../">organism</a><a href="../ladder/">ladder</a><a href="../findings/">findings</a><a href="../portfolio/">portfolio</a></nav>
<h1>Ask the organism</h1>
<div class="dim">It answers in this tab first. The code below is the organism's own conversation region (a greeting, a question about the organism, thanks, a farewell), its exact reader and its word problem reader, the same files <code>node bin/brain.mjs ask</code> runs, copied byte for byte: no model, no server, no token, no request. A question the tab does not carry is posted once to the organism on the server (<code>/api/ask</code>), which answers it through the same <code>ask()</code> as the CLI; the tab's own refusal lines print under that answer, never guessed.</div>
<div style="margin-top:8px">${shas}</div>
<div id="term" aria-live="polite"><div class="entry dim" id="hello">ready. type a question, or pick one below.</div></div>
<form id="f" autocomplete="off"><span class="acc prompt-label">brain ask dilation &gt;</span><input id="q" name="q" placeholder="hey, or what is 17 times 23" spellcheck="false" enterkeyhint="send"><button id="go" type="submit">ask</button></form>
<div class="chips">${chips}</div>
<div class="rule"></div>
<div class="foot">Every answer prints how it was reached: <b>route</b> (which path answered), <b>provenance</b> (native: the conversation region; exact: computed with BigInt rationals, never rounded; memory; model), <b>model</b> (none: no language model was called, or the provider and model the server called), and two clocks: a tab answer prints the nanoseconds per ask measured on YOUR device (median of 7 timed batches of the same ask); a server answer prints the microseconds <code>ask()</code> took on the server and the round trip this tab measured in milliseconds. The same question on the command line: <code>node bin/brain.mjs ask dilation "hey" --provider null</code>. The distance to the frontier is on the <a href="../ladder/">ladder</a>, from the verdict files.</div>
</main>
<script type="module">
${hasConverse ? "import { converse } from '../organism/act/converse.mjs';" : 'const converse = () => null;'}
import { readExact, spokenExpression, spokenLeftover } from '../organism/act/exact-read.mjs';
${hasWord ? "import { readWord, wordRefusal } from '../organism/act/word.mjs';" : 'const readWord = null, wordRefusal = null;'}
const $ = (s) => document.querySelector(s);
const opts = readWord ? { word: readWord } : {};
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
// The order of the tab: (1) the conversation region, (2) the exact reader, (3) the word problem reader, (4) the server.
async function ask(q) {
  q = String(q || '').trim(); if (!q) return null;
  const hello = $('#hello'); if (hello) hello.remove();
  const e = document.createElement('div'); e.className = 'entry';
  const head = '<div><span class="acc">&gt;</span> ' + esc(q) + '</div>';
  const show = (html) => { e.innerHTML = html; if (!e.isConnected) $('#term').appendChild(e); e.scrollIntoView({ block: 'nearest' }); };
  const nat = converse(q);
  if (nat) {
    show(head + tabNativeHtml(nat, clock(() => converse(q))));
    return { tab: true, answer: nat.answer, route: 'direct', provenance: 'native', kind: nat.kind };
  }
  const r = readExact(q, opts);
  if (r) {
    show(head + tabExactHtml(r, clock(() => readExact(q, opts))));
    return { tab: true, answer: r.answer, route: 'exact', provenance: 'exact' };
  }
  show(head + refusedHtml(spokenLeftover(q).slice(0, 8), wordRefusal ? wordRefusal(q) : null));
  const t0 = performance.now();
  const tick = setInterval(() => {
    const w = Math.round((performance.now() - t0) / 1000);
    const p = e.querySelector('[data-server-pending]');
    if (p && w >= 3) p.outerHTML = pendingHtml(w);
  }, 1000);
  const s = await server(q);
  clearInterval(tick);
  e.querySelector('.srv').outerHTML = serverHtml(s);
  e.scrollIntoView({ block: 'nearest' });
  return { tab: false, status: s.status, json: s.j };
}
$('#f').addEventListener('submit', (ev) => { ev.preventDefault(); ask($('#q').value); $('#q').value = ''; });
for (const b of document.querySelectorAll('.chip')) b.addEventListener('click', () => ask(b.dataset.q));
const pre = new URLSearchParams(location.search).get('q'); if (pre) ask(pre);
window.__brainAsk = { ready: true, spoken: spokenExpression, ask };
$('#q').focus();
</script>
</body>
</html>
`;
}

/** Build /ask into dist (web/dist by default; a bench passes a scratch directory). */
export function generateAsk(dist = DIST) {
  const manifest = copyOrganism(dist);
  const html = page(manifest);
  const dir = path.join(dist, 'ask');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
  return { bytes: Buffer.byteLength(html), modules: manifest.files.length, manifest, html, dist };
}

if (process.argv[1] && process.argv[1].endsWith(path.join('web', 'ask.mjs'))) {
  const r = generateAsk();
  console.log('dist ask/index.html ' + r.bytes + ' bytes; organism modules ' + r.modules + ': ' + r.manifest.files.map((f) => f.file + ' ' + f.bytes + ' bytes sha256 ' + f.sha256.slice(0, 12)).join(', '));
}
