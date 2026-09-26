// web/handoff.mjs: docs/HANDOFF.md rendered as /handoff on the site (web/dist/handoff/index.html),
// at every build, so the page a person opens on dilation.dev is the file tools/handoff.mjs last
// wrote from the machine's own measurements. The raw file is written beside the page as
// handoff/HANDOFF.md.
//
// The renderer handles exactly the markdown tools/handoff.mjs writes: "#", "##" and "###"
// headings, paragraphs, "- " bullets, fenced code blocks, and inline code spans. Any other markup
// stays literal text. Every block must reach the page or the build throws (the portfolio page's
// rule), and a secret pattern in the file (tools/handoff.mjs SECRET_PATTERNS) throws too: this page
// is public, and a build that would publish one is a failure, not a warning.
//
// When docs/HANDOFF.md does not exist yet the page says so and names the command that writes it;
// the build does not fail for that, because the file is generated and a fresh tree has none.
//
// Run: node web/handoff.mjs   (writes web/dist/handoff/index.html and HANDOFF.md)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { secretHit } from '../tools/handoff.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DOC = path.join(ROOT, 'docs', 'HANDOFF.md');
export const OUT_DIR = path.join(ROOT, 'web', 'dist', 'handoff');
const EM = String.fromCharCode(0x2014);

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/** Inline code spans and nothing else; an odd backtick count leaves every backtick literal. */
export function inline(text) {
  const parts = String(text).split('`');
  if (parts.length % 2 === 0) return esc(text);
  return parts.map((p, i) => (i % 2 ? '<code>' + esc(p) + '</code>' : esc(p))).join('');
}

/**
 * The document as blocks: {kind: 'h1'|'h2'|'h3', text}, {kind: 'p', text}, {kind: 'ul', items},
 * {kind: 'pre', lines}. A fence runs to the next line that is exactly ```.
 */
export function blocks(md) {
  const lines = String(md).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = null, list = null;
  const flush = () => {
    if (para) { out.push({ kind: 'p', text: para.join(' ') }); para = null; }
    if (list) { out.push({ kind: 'ul', items: list }); list = null; }
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim() === '```') {
      flush();
      const body = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '```') body.push(lines[i++]);
      out.push({ kind: 'pre', lines: body });
      continue;
    }
    if (!l.trim()) { flush(); continue; }
    const h = /^(#{1,3}) (.+)$/.exec(l);
    if (h) { flush(); out.push({ kind: 'h' + h[1].length, text: h[2].trim() }); continue; }
    if (l.startsWith('- ')) {
      if (para) { out.push({ kind: 'p', text: para.join(' ') }); para = null; }
      (list ||= []).push(l.slice(2).trim());
      continue;
    }
    if (list) { out.push({ kind: 'ul', items: list }); list = null; }
    (para ||= []).push(l.trim());
  }
  flush();
  return out;
}

const slug = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function render(md) {
  return blocks(md).map((b) => {
    if (b.kind === 'pre') return '<pre><code>' + b.lines.map(esc).join('\n') + '</code></pre>';
    if (b.kind === 'ul') return '<ul>\n' + b.items.map((x) => '<li>' + inline(x) + '</li>').join('\n') + '\n</ul>';
    if (b.kind === 'h2') return '<h2 id="' + slug(b.text) + '">' + inline(b.text) + '</h2>';
    return '<' + b.kind + '>' + inline(b.text) + '</' + b.kind + '>';
  }).join('\n');
}

/** The visible words of a text the way the page shows them: spans unwrapped, spaces folded. */
const plain = (text) => String(text).replace(/`/g, '').replace(/\s+/g, ' ').trim();

const STYLE = `:root { color-scheme: dark; --ink: #e8eefc; --dim: #7f8ba6; --line: rgba(150,180,255,0.14);
  --glass: rgba(10,14,26,0.62); --accent: #7fb0ff; --warm: #ffb27f; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #02030a; color: var(--ink);
  font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
body { padding: 0 16px 72px; }
a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--line); }
a:hover { border-bottom-color: var(--accent); }
.wrap { max-width: 980px; margin: 0 auto; }
header.top { display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
  flex-wrap: wrap; padding: 34px 0 10px; border-bottom: 1px solid var(--line); }
header.top h1 { font-size: 15px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; margin: 0; }
.dim { color: var(--dim); }
nav.toc { margin: 16px 0 0; display: flex; flex-wrap: wrap; gap: 6px 14px; }
article { margin: 18px 0 0; font-size: 13px; line-height: 1.7; overflow-wrap: anywhere; }
article h1 { font-size: 17px; letter-spacing: 0.08em; margin: 0 0 18px; }
article h2 { font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; margin: 34px 0 8px;
  padding-top: 10px; border-top: 1px solid var(--line); }
article h3 { font-size: 12px; letter-spacing: 0.1em; margin: 20px 0 6px; color: var(--accent); }
article p { margin: 0 0 12px; }
article ul { margin: 0 0 14px; padding-left: 18px; }
article li { margin: 0 0 4px; }
article code { color: var(--warm); background: rgba(255,178,127,0.06); border: 1px solid rgba(255,178,127,0.14);
  border-radius: 4px; padding: 0 4px; }
pre { background: var(--glass); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px;
  overflow-x: auto; margin: 0 0 14px; }
pre code { background: none; border: 0; padding: 0; color: var(--ink); white-space: pre; }
footer { margin-top: 40px; color: var(--dim); border-top: 1px solid var(--line); padding-top: 12px; }`;

function page({ body, toc, bytes, sections }) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>DILATION / BRAIN / HANDOFF</title>\n'
    + '<meta name="description" content="What runs by itself, what is undone, how to check it and how to stop it: docs/HANDOFF.md, written from the machine\'s own measurements and rendered at every build.">\n'
    + '<style>\n' + STYLE + '\n</style>\n</head>\n<body>\n<div class="wrap">\n'
    + '<header class="top">\n  <h1>DILATION <span class="dim">/</span> BRAIN <span class="dim">/</span> HANDOFF</h1>\n  <a href="../">back to the organism</a>\n</header>\n'
    + '<p class="dim">docs/HANDOFF.md, ' + bytes + ' bytes, ' + sections + ' sections, rendered by web/handoff.mjs at build time. <a href="HANDOFF.md">the raw file</a></p>\n'
    + (toc ? '<nav class="toc">' + toc + '</nav>\n' : '')
    + '<article id="doc">\n' + body + '\n</article>\n'
    + '<footer>Regenerate the file with <code>node tools/handoff.mjs</code>, then rebuild with <code>node web/build.mjs</code>.</footer>\n'
    + '</div>\n</body>\n</html>\n';
}

export function generateHandoff({ doc = DOC, outDir = OUT_DIR } = {}) {
  mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'index.html');
  if (!existsSync(doc)) {
    const html = page({ body: '<p>docs/HANDOFF.md has not been generated on this tree yet. Run <code>node tools/handoff.mjs</code>, then <code>node web/build.mjs</code>.</p>', toc: '', bytes: 0, sections: 0 });
    writeFileSync(out, html);
    return { path: out, bytes: Buffer.byteLength(html), mdBytes: 0, blocks: 0, sections: 0, commands: 0, missing: true, generatedLine: null };
  }
  const md = readFileSync(doc, 'utf8');
  const hit = secretHit(md);
  if (hit) throw new Error('handoff page: a secret pattern is in docs/HANDOFF.md (' + hit + '); regenerate it with node tools/handoff.mjs');
  const bs = blocks(md);
  if (!bs.length) throw new Error('handoff page: the document has no blocks');
  const h2 = bs.filter((b) => b.kind === 'h2');
  const toc = h2.map((b) => '<a href="#' + slug(b.text) + '">' + esc(b.text.toLowerCase()) + '</a>').join('\n');
  const html = page({ body: render(md), toc, bytes: Buffer.byteLength(md), sections: h2.length });
  if (html.includes(EM)) throw new Error('handoff page: an em dash reached the page');

  // every block is on the page
  const article = /<article id="doc">([\s\S]*?)<\/article>/.exec(html);
  if (!article) throw new Error('handoff page: the article is missing from the page');
  const shown = decode(article[1].replace(/<[^>]*>/g, '')).replace(/`/g, '').replace(/\s+/g, ' ');
  const pieces = [];
  for (const b of bs) {
    if (b.kind === 'pre') pieces.push(...b.lines.filter((l) => l.trim()));
    else if (b.kind === 'ul') pieces.push(...b.items);
    else pieces.push(b.text);
  }
  for (const t of pieces) if (!shown.includes(plain(t))) throw new Error('handoff page: a block did not reach the page: ' + plain(t).slice(0, 70));
  const commands = bs.filter((b) => b.kind === 'pre').reduce((a, b) => a + b.lines.filter((l) => l.trim()).length, 0);
  const generatedLine = md.trimEnd().split('\n').pop();

  writeFileSync(out, html);
  writeFileSync(path.join(outDir, 'HANDOFF.md'), md);
  return { path: out, bytes: Buffer.byteLength(html), mdBytes: Buffer.byteLength(md), blocks: bs.length, sections: h2.length, commands, missing: false, generatedLine };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = generateHandoff();
  console.log('wrote ' + path.relative(ROOT, r.path) + ' (' + r.bytes + ' bytes' + (r.missing ? ', docs/HANDOFF.md absent' : ', ' + r.sections + ' sections, ' + r.blocks + ' blocks, ' + r.commands + ' command lines from ' + r.mdBytes + ' bytes') + ')');
}
