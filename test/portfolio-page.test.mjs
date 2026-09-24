// test/portfolio-page.test.mjs: the portfolio page is docs/PORTFOLIO.md, whole, current, copyable.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generatePortfolio, blocks, render, inline, DOC, TEMPLATE } from '../tools/portfolio-page.mjs';
import { write as buildSite } from '../web/build.mjs';

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('portfolio: inline handles code spans only, escapes markup, and leaves odd backticks literal', () => {
  assert.equal(inline('a `b` c'), 'a <code>b</code> c');
  assert.equal(inline('x < y & `z`'), 'x &lt; y &amp; <code>z</code>');
  assert.equal(inline('one ` lonely'), 'one ` lonely');
  assert.equal(inline('**not bold** [not](a link)'), '**not bold** [not](a link)');
});

test('portfolio: blocks splits on blank lines, reads one line headings, joins wrapped paragraphs', () => {
  const b = blocks('# Title\r\n\r\nfirst line\r\nsecond line\r\n\r\n\r\n## Sub\n\nlast');
  assert.deepEqual(b, [
    { kind: 'h1', text: 'Title' }, { kind: 'p', text: 'first line second line' },
    { kind: 'h2', text: 'Sub' }, { kind: 'p', text: 'last' },
  ]);
  assert.equal(render('# T\n\na `b`'), '<h1>T</h1>\n<p>a <code>b</code></p>');
});

test('portfolio: the real document renders whole, with every block on the page and the exact markdown in the textarea', () => {
  const md = readFileSync(DOC, 'utf8');
  const bs = blocks(md);
  assert.ok(bs.length >= 20, 'the portfolio has its paragraphs: ' + bs.length);
  assert.equal(bs[0].kind, 'h1');
  const outDir = mkdtempSync(path.join(tmpdir(), 'brain-portfolio-'));
  const r = generatePortfolio({ outDir });
  assert.equal(r.blocks, bs.length);
  assert.equal(r.paragraphs, bs.filter((b) => b.kind === 'p').length);
  const page = readFileSync(r.path, 'utf8');
  assert.equal(readFileSync(r.mdPath, 'utf8'), md, 'the raw file next to the page is the document, byte for byte');
  assert.ok(!page.includes(String.fromCharCode(0x2014)), 'no em dash on the page');
  assert.ok(r.bytes < 160000, 'page size ' + r.bytes);
  const article = /<article id="doc">([\s\S]*?)<\/article>/.exec(page)[1];
  const shown = decode(article.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ');
  for (const b of bs) assert.ok(shown.includes(b.text.replace(/`/g, '').replace(/\s+/g, ' ').trim()), 'block on the page: ' + b.text.slice(0, 50));
  const ta = /<textarea id="md"[^>]*>([\s\S]*?)<\/textarea>/.exec(page);
  assert.equal(decode(ta[1]), md, 'the textarea carries the exact markdown');
  for (const id of ['copy-md', 'copy-text', 'said']) assert.ok(page.includes('id="' + id + '"'), 'control ' + id);
  assert.ok(page.includes('href="PORTFOLIO.md"'), 'the raw file is linked');
  assert.ok(page.includes('href="../findings/"') && page.includes('href="../"'), 'the page links back to the site');
  assert.match(page, /generated \d{4}-\d\d-\d\dT[^<]* from docs\/PORTFOLIO\.md; gate (GREEN|RED) at \d{4}/, 'the footer says when it was generated and what the gate said');
});

test('portfolio: a dropped block fails the build rather than shipping', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-portfolio-broken-'));
  const brokenTemplate = path.join(dir, 'portfolio.html');
  // a template whose article is not where the body goes: the self check must throw
  writeFileSync(brokenTemplate, readFileSync(TEMPLATE, 'utf8').replace('<article id="doc">\n{{BODY}}\n</article>', '<article id="doc"></article>\n<div>{{BODY}}</div>'));
  assert.throws(() => generatePortfolio({ template: brokenTemplate, outDir: path.join(dir, 'out') }), /a block did not reach the page/);
  assert.ok(!existsSync(path.join(dir, 'out', 'index.html')), 'nothing was written');
});

test('portfolio: the site build writes the page and reports it', () => {
  const r = buildSite({ minify: false });
  assert.ok(r.portfolio && r.portfolio.bytes > 10000, 'build reports the portfolio: ' + JSON.stringify(r.portfolio));
  assert.ok(existsSync(r.portfolio.path) && existsSync(r.portfolio.mdPath));
  const index = readFileSync(r.htmlPath, 'utf8');
  assert.ok(index.includes('href="portfolio/"'), 'the organism page links to the portfolio');
});
