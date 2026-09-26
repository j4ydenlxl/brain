// web/ask.mjs: THE PROMPT BOX ON dilation.dev (queue item 12, docs/CLOUD-SESSION.md).
//
// His words, 2026-09-26 11:32 EDT: "it should be cli in dilation.dev someday so i can prompt like any
// ai", and 11:55 EDT: "Listen vcs must yell". A visitor types a question and the organism answers it
// IN THEIR TAB: the page imports the organism's own exact reader (act/exact-read.mjs, and the word
// problem reader act/word.mjs when it exists) copied here BYTE FOR BYTE from the repository, so the
// answer on the page is the answer `node bin/brain.mjs ask` prints, computed by the same code, with no
// server, no model and no token. The clock on the page is the visitor's own: the median of seven
// timed batches of the same ask, printed in nanoseconds per ask.
//
// A question the reader does not carry is refused on the page with its route printed (the words it
// did not know, and that the model cell is not in the browser). Nothing on this page reaches out: the
// page makes no request after it loads, which is the boundary row's rule for everything that answers.
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
export const MODULES = Object.freeze(['act/exact-read.mjs', 'tasks/exact.mjs', 'act/word.mjs']);
// What the page offers as one-click prompts: the reader's shapes, and one it must refuse.
export const EXAMPLES = Object.freeze([
  'what is 17 times 23',
  '2 to the power of 100',
  '15 percent of 200',
  'the square root of 144',
  'subtract 3 from 10',
  'Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?',
  'write a poem about the sea',
]);

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Copy the organism modules that exist, verify every byte, write the manifest. */
export function copyOrganism() {
  const out = path.join(DIST, 'organism');
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
  const hasWord = manifest.files.some((f) => f.file === 'act/word.mjs');
  const shas = manifest.files.map((f) => '<span class="port">' + esc(f.file) + ' ' + f.sha256.slice(0, 12) + '</span>').join(' ');
  const chips = EXAMPLES.filter((e) => hasWord || !/Natalia/.test(e))
    .map((e) => '<button class="chip" data-q="' + esc(e) + '">' + esc(e.length > 64 ? e.slice(0, 61) + '...' : e) + '</button>').join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ASK / DILATION</title>
<meta name="description" content="Ask the organism. It answers in your tab, exactly, in nanoseconds, with no model, no server and no token.">
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
.port { display: inline-block; border: 1px solid var(--line); border-radius: 5px; padding: 0 6px; margin: 2px 2px 0 0; font-size: 11px; color: var(--dim); }
#term { margin-top: 18px; background: var(--glass); border: 1px solid var(--line); border-radius: 10px; min-height: 340px; padding: 14px 16px; overflow-wrap: anywhere; }
.entry { margin-bottom: 14px; }
.entry pre { margin: 4px 0; white-space: pre-wrap; font: inherit; }
.ans { font-size: 22px; color: var(--ok); letter-spacing: 0.02em; }
.foot { color: var(--dim); font-size: 12px; }
form { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
#q { flex: 1; min-width: 0; background: #060913; color: var(--ink); border: 1px solid var(--line); border-radius: 8px; padding: 11px 12px; font: inherit; font-size: 14px; }
#q:focus { outline: none; border-color: var(--acc); box-shadow: 0 0 0 3px rgba(127,176,255,0.12); }
button { font: inherit; cursor: pointer; }
#go { background: #0d1630; color: var(--ink); border: 1px solid var(--acc); border-radius: 8px; padding: 10px 16px; letter-spacing: 0.12em; text-transform: uppercase; font-size: 11px; }
.chips { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.chip { background: transparent; color: var(--dim); border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px; font-size: 11px; }
.chip:hover { color: var(--ink); border-color: var(--acc); }
.rule { height: 1px; background: var(--line); margin: 18px 0; }
nav { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 18px; }
code { color: var(--ink); }
</style>
</head>
<body>
<main>
<nav><a href="../">organism</a><a href="../ladder/">ladder</a><a href="../findings/">findings</a><a href="../portfolio/">portfolio</a></nav>
<h1>Ask the organism</h1>
<div class="dim">It answers in this tab. The code below is the organism's own exact reader, the same file <code>node bin/brain.mjs ask</code> runs, copied byte for byte: no model, no server, no token. A question it does not carry is refused with its route printed, never guessed.</div>
<div style="margin-top:8px">${shas}</div>
<div id="term" aria-live="polite"><div class="entry dim" id="hello">ready. type a question, or pick one below.</div></div>
<form id="f" autocomplete="off"><span class="acc">brain ask dilation &gt;</span><input id="q" name="q" placeholder="what is 17 times 23" spellcheck="false"><button id="go" type="submit">ask</button></form>
<div class="chips">${chips}</div>
<div class="rule"></div>
<div class="foot">Every answer prints how it was reached: <b>route</b> (which path answered), <b>provenance</b> (exact: computed with BigInt rationals, never rounded), <b>model</b> (none: no language model was called), and the nanoseconds per ask measured on YOUR device (median of 7 timed batches of the same ask). The same question on the command line: <code>node bin/brain.mjs ask dilation "what is 17 times 23" --provider null</code>. The distance to the frontier is on the <a href="../ladder/">ladder</a>, from the verdict files.</div>
</main>
<script type="module">
import { readExact, spokenExpression, spokenLeftover } from '../organism/act/exact-read.mjs';
${hasWord ? "import { readWord, wordRefusal } from '../organism/act/word.mjs';" : 'const readWord = null, wordRefusal = null;'}
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const opts = readWord ? { word: readWord } : {};
const answer = (t) => readExact(t, opts);
// nanoseconds per ask on this device: warm, then grow a batch until it takes 2 ms, then 7 batches
function clock(t) {
  for (let i = 0; i < 20; i++) answer(t);
  let n = 8;
  for (;;) { const a = performance.now(); for (let i = 0; i < n; i++) answer(t); if (performance.now() - a >= 2 || n >= 1 << 20) break; n *= 2; }
  const b = [];
  for (let k = 0; k < 7; k++) { const a = performance.now(); for (let i = 0; i < n; i++) answer(t); b.push((performance.now() - a) * 1e6 / n); }
  b.sort((x, y) => x - y);
  return { ns: Math.round(b[3]), asks: n * 7 };
}
function ask(q) {
  q = String(q || '').trim(); if (!q) return;
  const hello = $('#hello'); if (hello) hello.remove();
  const e = document.createElement('div'); e.className = 'entry';
  const r = answer(q);
  let html = '<div><span class="acc">&gt;</span> ' + esc(q) + '</div>';
  if (r) {
    const c = clock(q);
    html += '<pre class="dim">answered exactly by ' + esc(r.method) + ', with no model and no network.\\n' + r.steps.map((s) => '- ' + esc(s)).join('\\n') + '</pre>';
    html += '<div class="ans" data-answer="' + esc(r.answer) + '">' + esc(r.answer) + '</div>';
    html += '<div class="foot" data-route="exact" data-provenance="exact">route <span class="ok">exact</span>  provenance <span class="ok">exact</span>  method ' + esc(r.method) + '  model none  tokens 0  network 0  <span class="ok" data-ns="' + c.ns + '">' + c.ns.toLocaleString('en-US') + ' ns per ask on this device</span> (median of 7 batches, ' + c.asks.toLocaleString('en-US') + ' asks)</div>';
  } else {
    const unknown = spokenLeftover(q).slice(0, 8);
    const why = wordRefusal ? wordRefusal(q) : null;
    html += '<pre class="warn">no cell in this tab carries this question, so it is refused, not guessed.</pre>';
    html += '<div class="foot" data-route="refused" data-provenance="none">route <span class="warn">refused</span>  provenance none  model none (the model cell is not in the browser)  tokens 0  network 0' + (unknown.length ? '  words the spoken reader could not read: ' + unknown.map(esc).join(', ') : '') + '</div>'
      + (why ? '<div class="foot">the word problem reader stopped at: ' + esc(why) + '</div>' : '');
    html += '<div class="foot">on the command line the organism routes it on: knowledge tier, regions, then the model cell: <code>node bin/brain.mjs ask dilation "' + esc(q.slice(0, 80)) + '" --provider ollama</code></div>';
  }
  e.innerHTML = html;
  $('#term').appendChild(e);
  e.scrollIntoView({ block: 'nearest' });
}
$('#f').addEventListener('submit', (ev) => { ev.preventDefault(); ask($('#q').value); $('#q').value = ''; });
for (const b of document.querySelectorAll('.chip')) b.addEventListener('click', () => ask(b.dataset.q));
const pre = new URLSearchParams(location.search).get('q'); if (pre) ask(pre);
window.__brainAsk = { ready: true, spoken: spokenExpression };
$('#q').focus();
</script>
</body>
</html>
`;
}

export function generateAsk() {
  const manifest = copyOrganism();
  const html = page(manifest);
  const dir = path.join(DIST, 'ask');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
  return { bytes: Buffer.byteLength(html), modules: manifest.files.length, manifest };
}

if (process.argv[1] && process.argv[1].endsWith(path.join('web', 'ask.mjs'))) {
  const r = generateAsk();
  console.log('dist ask/index.html ' + r.bytes + ' bytes; organism modules ' + r.modules + ': ' + r.manifest.files.map((f) => f.file + ' ' + f.bytes + ' bytes sha256 ' + f.sha256.slice(0, 12)).join(', '));
}
