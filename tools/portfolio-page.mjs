// tools/portfolio-page.mjs: the portfolio page of the site, generated from docs/PORTFOLIO.md at
// every build so that what dilation.dev/portfolio/ shows is the current file (his 2026-09-23
// 18:33 line: put the portfolio on dilation.dev, always copyable, always up to date).
//
// The document is plain paragraphs under one title with inline code spans and nothing else
// (counted 2026-09-23: 0 bold, 0 links, 0 lists, 0 tables, 0 fences), so the renderer handles
// exactly that and leaves any other markup as literal text rather than guessing. The page
// carries the markdown itself in a textarea (entity escaped, so the browser hands back the
// exact bytes) and a copy control; the raw file is written next to the page as PORTFOLIO.md.
//
// Every block of the document must reach the page verbatim or the build throws: a portfolio
// page that silently dropped a paragraph would be the same defect as a findings card that
// dropped a number.
//
// Run: node tools/portfolio-page.mjs   (writes web/dist/portfolio/index.html and PORTFOLIO.md)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DOC = path.join(ROOT, 'docs', 'PORTFOLIO.md');
export const TEMPLATE = path.join(ROOT, 'web', 'src', 'portfolio.html');
export const OUT_DIR = path.join(ROOT, 'web', 'dist', 'portfolio');
const GATE = path.join(ROOT, 'bench', 'verdicts', 'gate.json');

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/** Inline code spans, and nothing else. An odd number of backticks means the text is not using
 *  spans and every backtick stays literal. */
export function inline(text) {
  const parts = String(text).split('`');
  if (parts.length % 2 === 0) return esc(text);
  return parts.map((p, i) => (i % 2 ? '<code>' + esc(p) + '</code>' : esc(p))).join('');
}

/** The document as blocks: a heading (one line, "# ", "## " or "### ") or a paragraph (lines
 *  joined with single spaces). Blank lines separate blocks. */
export function blocks(md) {
  const out = [];
  for (const chunk of String(md).replace(/\r\n/g, '\n').split(/\n[ \t]*\n+/)) {
    const t = chunk.trim();
    if (!t) continue;
    const m = /^(#{1,3}) (.+)$/.exec(t);
    if (m && !t.includes('\n')) out.push({ kind: 'h' + m[1].length, text: m[2].trim() });
    else out.push({ kind: 'p', text: t.replace(/[ \t]*\n[ \t]*/g, ' ') });
  }
  return out;
}

export function render(md) {
  return blocks(md).map((b) => '<' + b.kind + '>' + inline(b.text) + '</' + b.kind + '>').join('\n');
}

/** The visible words of a block, the way the page shows them: spans unwrapped, spaces folded. */
const plain = (text) => text.replace(/`/g, '').replace(/\s+/g, ' ').trim();

export function generatePortfolio({ doc = DOC, template = TEMPLATE, outDir = OUT_DIR, gateFile = GATE } = {}) {
  const md = readFileSync(doc, 'utf8');
  const bs = blocks(md);
  if (!bs.length) throw new Error('portfolio: the document has no blocks');
  const paragraphs = bs.filter((b) => b.kind === 'p').length;
  const gate = existsSync(gateFile) ? JSON.parse(readFileSync(gateFile, 'utf8')) : null;
  const generatedAt = new Date().toISOString();

  const fill = (s, key, value) => {
    if (!s.includes(key)) throw new Error('portfolio: the template has no ' + key);
    return s.replace(key, () => value);
  };
  let page = readFileSync(template, 'utf8');
  page = fill(page, '{{BODY}}', render(md));
  page = fill(page, '{{MD}}', esc(md));
  page = fill(page, '{{BYTES}}', String(Buffer.byteLength(md)));
  page = fill(page, '{{PARAGRAPHS}}', String(paragraphs));
  page = fill(page, '{{GENERATED}}', esc(generatedAt));
  // The footer quotes the gate the DOCUMENT quotes (tools/portfolio-gate.mjs rewrites that sentence only from a
  // green gate), never the host's gate.json: a fresh Linux clone's red gate is the host's, not the organism's
  // (his 2026-09-26 20:52 EDT order: the red thing off the portfolio page). The host gate stays on the handoff page.
  const quoted = /gate is (GREEN) on ([\d,]+) test files with ([\d,]+) assertions/.exec(md);
  page = fill(page, '{{GATE}}', quoted ? esc('as the document quotes it: ' + quoted[1] + ' on ' + quoted[2] + ' test files with ' + quoted[3] + ' assertions') : 'the document quotes no gate');
  if (page.includes('{{')) throw new Error('portfolio: a template placeholder was left unfilled');
  if (page.includes(String.fromCharCode(0x2014))) throw new Error('portfolio: an em dash reached the page');

  // every block is on the page, as words, exactly once at least
  const article = /<article id="doc">([\s\S]*?)<\/article>/.exec(page);
  if (!article) throw new Error('portfolio: the article is missing from the page');
  // tags strip to nothing, not to a space: an inline span is followed by its punctuation
  // ("<code>x</code>,") and the blocks are already separated by newlines
  const shown = decode(article[1].replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ');
  for (const b of bs) {
    if (!shown.includes(plain(b.text))) throw new Error('portfolio: a block did not reach the page: ' + plain(b.text).slice(0, 70));
  }
  // and the textarea hands back the exact file
  const ta = /<textarea id="md"[^>]*>([\s\S]*?)<\/textarea>/.exec(page);
  if (!ta || decode(ta[1]) !== md) throw new Error('portfolio: the textarea does not carry the exact markdown');

  mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'index.html');
  const mdOut = path.join(outDir, 'PORTFOLIO.md');
  writeFileSync(out, page);
  writeFileSync(mdOut, md);
  return { path: out, mdPath: mdOut, bytes: Buffer.byteLength(page), mdBytes: Buffer.byteLength(md), blocks: bs.length, paragraphs, generatedAt, gateAt: gate ? gate.at : null, gateVerdict: gate ? gate.verdict : null };
}

if (process.argv[1] && process.argv[1].endsWith('portfolio-page.mjs')) {
  const r = generatePortfolio();
  console.log('wrote ' + path.relative(ROOT, r.path) + ' (' + r.bytes + ' bytes, ' + r.paragraphs + ' paragraphs of ' + r.blocks + ' blocks) and ' + path.relative(ROOT, r.mdPath) + ' (' + r.mdBytes + ' bytes); gate ' + (r.gateVerdict || 'none') + ' at ' + (r.gateAt || 'none'));
}
