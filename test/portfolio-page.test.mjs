// test/portfolio-page.test.mjs: the portfolio page is docs/PORTFOLIO.md, whole, current, copyable.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generatePortfolio, blocks, render, inline, DOC, TEMPLATE } from '../tools/portfolio-page.mjs';
import { write as buildSite } from '../web/build.mjs';
import { after } from 'node:test';
import { rmSync, copyFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { injectPortfolio, injectLadder, webVisionVerdict, blockText, MARKS } from '../web/build.mjs';
import { generateLadder } from '../web/ladder.mjs';
import { countVision, countLine, STATUS_WORDS } from '../tools/vision-count.mjs';

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
  assert.match(page, /generated \d{4}-\d\d-\d\dT[^<]* from docs\/PORTFOLIO\.md; gate as the document quotes it: GREEN on [\d,]+ test files with [\d,]+ assertions/, 'the footer says when it was generated and the gate the document quotes (never the host gate)');
  assert.ok(!/gate RED/.test(page), 'no host gate verdict on the portfolio page');
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

// ------------------------------------------------ board 24b, item web-vision: "The vision, counted" and "Live"
// The two blocks web/build.mjs puts on the portfolio page from bench/verdicts at build time. Every case builds the
// page into a temp dir from verdict files the test plants (or copies read-only from bench/verdicts), and reads the
// page back from disk. The expected counter line is the test's own call of countLine(countVision(docs/VISION.md)).
const temps = [];
after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true }); });
const EMDASH = String.fromCharCode(0x2014);
const VERDICTS = path.join(path.dirname(DOC), '..', 'bench', 'verdicts');
const VISION_MD = path.join(path.dirname(DOC), 'VISION.md');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const digits = (s) => (String(s).match(/\d/g) || []).length;

/** A temp dir holding a copy of docs/VISION.md (so a concurrent edit cannot race the test) and a verdicts dir. */
function world() {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-web-vision-'));
  temps.push(dir);
  const verdicts = path.join(dir, 'verdicts');
  mkdirSync(verdicts);
  const visionDoc = path.join(dir, 'VISION.md');
  copyFileSync(VISION_MD, visionDoc);
  const md = readFileSync(visionDoc, 'utf8');
  return { dir, verdicts, visionDoc, md, line: countLine(countVision(md)) };
}
/** The count as tools/vision-count.mjs --json writes it, made here from the document. */
function freshCount(md, extra = {}) {
  const c = countVision(md);
  return { at: '2026-09-27T12:34:56.789Z', command: 'node tools/vision-count.mjs --json', node: process.version, isTheBar: true, barMet: c.total > 0 && c.counts.MET === c.total,
    total: c.total, counts: { ...c.counts }, unstated: c.unstated, line: countLine(c), typedAgrees: true, source: 'docs/VISION.md', sourceSha256: sha(md), ...extra };
}
/** A planted live verdict with numbers no real run printed, so the block is checked against the file, not the day. */
const plantedLive = (extra = {}) => ({
  at: '2026-09-27T11:11:11.111Z', command: 'node bench/site-ask.mjs --url https://example.test/ask', node: 'v0.0.0', isTheBar: true, barMet: true,
  url: 'https://example.test/ask', browser: 'planted browser', modelCalls: 0, met: { a: true, b: false },
  rows: [
    { prompt: 'what is 17 times 23', answer: '391', route: 'exact', nsPerAsk: 4321, requests: [] },
    { prompt: 'subtract 3 from 10', answer: '7', route: 'exact', nsPerAsk: 98765, requests: [] },
    { prompt: 'write a poem', answer: null, route: 'refused', nsPerAsk: null, requests: [{}], server: { route: 'direct', provider: 'null', serverUs: 606, rttMs: 70.5 } },
  ],
  serverRows: { exact: { status: 200, rttMs: 147.25, json: { route: 'direct', from: 'exact', host: 'zz9', serverUs: 777 } },
    rapid: { n: 5, statuses: { 200: 5 }, serverUs: { min: 11, median: 22, max: 33, n: 5 }, rttMs: { min: 44, median: 55, max: 66 } } },
  ...extra,
});
const put = (dir, name, obj) => writeFileSync(path.join(dir, name), typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
/** Build the portfolio page into the world and inject the blocks; returns the page as written. */
function built(w) {
  const r = generatePortfolio({ outDir: path.join(w.dir, 'out') });
  const m = injectPortfolio({ pagePath: r.path, verdictsDir: w.verdicts, visionDoc: w.visionDoc });
  return { page: readFileSync(r.path, 'utf8'), m, path: r.path };
}
const section = (page, id) => { const i = page.indexOf('<section class="block" id="' + id + '"'); return i < 0 ? null : page.slice(i, page.indexOf('</section>', i) + 10); };

test('web-vision: a fresh count puts the counter line on the page byte for byte, each status word with its count, its at, and the rule', () => {
  const w = world();
  const v = freshCount(w.md);
  put(w.verdicts, 'vision-count.json', v);
  put(w.verdicts, 'site-ask.json', plantedLive());
  const { page, m } = built(w);
  assert.equal(v.line, w.line, 'the planted count is the document');
  assert.ok(page.includes('<p class="count-line" id="vision-line">' + w.line + '</p>'), 'the counter line, byte for byte: ' + w.line);
  const vis = section(page, 'vision');
  for (const word of STATUS_WORDS) assert.ok(vis.includes('<li><b>' + v.counts[word] + '</b><span class="k">' + word + '</span>'), word + ' with its count ' + v.counts[word]);
  assert.ok(vis.includes(v.at), 'the verdict at is printed');
  assert.match(blockText(vis), /The project is over when MET equals the total and not before: MET is \d+ of \d+, so (by his rule )?it is (not )?over\./);
  assert.ok(blockText(vis).includes('MET is ' + v.counts.MET + ' of ' + v.total + (v.counts.MET === v.total ? ', so by his rule it is over.' : ', so it is not over.')), 'the rule quotes the counts of the file');
  assert.ok(vis.includes('byte for byte the document that was counted'), 'the sha in the verdict matches the document');
  assert.ok(!vis.includes('stale:'), 'a fresh count is not called stale');
  assert.equal(m.vision.measured, true);
  assert.equal(m.vision.fresh, true);
  assert.ok(!page.includes(EMDASH), 'no em dash on the page');
  assert.ok(m.bytes < 160000 && Buffer.byteLength(page) < 160000, 'the size cap of the portfolio test holds with both blocks: ' + m.bytes);
  // the article the portfolio test has always checked is still whole after the blocks went in
  assert.ok(page.includes('<article id="doc">') && page.includes('<textarea id="md"'));
  assert.ok(!page.includes(MARKS.vision) && !page.includes(MARKS.live), 'both markers were replaced');
});

test('web-vision: the live block prints the url, the tab nanoseconds, the server microseconds, the round trip, the at, and the run id only when the file carries one', () => {
  const w = world();
  put(w.verdicts, 'vision-count.json', freshCount(w.md));
  put(w.verdicts, 'site-ask.json', plantedLive());
  const t1 = blockText(section(built(w).page, 'live'));
  assert.ok(t1.includes('https://example.test/ask asked at 2026-09-27T11:11:11.111Z'), 'url and at: ' + t1.slice(0, 200));
  assert.ok(t1.includes('4321 to 98765 ns'), 'the tab nanoseconds per ask, min to max over the rows with no request');
  assert.ok(t1.includes('over 2 prompts answered in the page'), 'the refused row is not counted as a tab answer');
  assert.ok(t1.includes('777 µs'), 'the server microseconds');
  assert.ok(t1.includes('147.25 ms'), 'the round trip');
  assert.ok(t1.includes('606 µs') && t1.includes('70.5 ms'), 'the refused prompt went to the server and its numbers are printed');
  assert.ok(t1.includes('1 of 2 checks true'), 'the checks are counted from the file');
  assert.ok(t1.includes('The file carries no GitHub run id.'), 'no run id printed when the file has none');
  assert.ok(!/GitHub run id \d/.test(t1));
  // the same file with a run id: printed with its field
  put(w.verdicts, 'site-ask.json', plantedLive({ githubRunId: 18123456789 }));
  const t2 = blockText(section(built(w).page, 'live'));
  assert.ok(t2.includes('GitHub run id 18123456789 (field githubRunId).'), t2.slice(-300));
  put(w.verdicts, 'site-ask.json', plantedLive({ github: { runId: '777000111' } }));
  assert.ok(blockText(section(built(w).page, 'live')).includes('GitHub run id 777000111 (field github.runId).'));
  // a field the file lacks is "not recorded", never a number
  const bare = plantedLive(); delete bare.serverRows;
  put(w.verdicts, 'site-ask.json', bare);
  const t3 = blockText(section(built(w).page, 'live'));
  assert.ok(t3.includes('on the server not recorded'), t3.slice(0, 300));
  // an em dash planted in the file never reaches the page
  put(w.verdicts, 'site-ask.json', plantedLive({ browser: 'planted' + EMDASH + 'browser', command: 'node x' + EMDASH + 'y' }));
  put(w.verdicts, 'vision-count.json', freshCount(w.md, { command: 'node tools/vision-count.mjs' + EMDASH + '--json' }));
  const { page } = built(w);
  assert.ok(!page.includes(EMDASH), 'the em dashes planted in both files did not ship');
  assert.ok(blockText(section(page, 'live')).includes('planted, browser'));
});

test('web-vision: a planted missing verdict file prints "not measured" in its block and no digit', () => {
  const w = world();
  // both missing
  let page = built(w).page;
  for (const id of ['vision', 'live']) {
    const t = blockText(section(page, id));
    assert.ok(t.includes('not measured'), id + ': ' + t);
    assert.equal(digits(t), 0, id + ' prints no digit when its file is missing: ' + t);
  }
  assert.ok(blockText(section(page, 'vision')).includes('bench/verdicts/vision-count.json is not on disk'));
  assert.ok(blockText(section(page, 'live')).includes('bench/verdicts/site-ask.json is not on disk'));
  // the control: the same builder with the file present prints digits, so the zero above is a measurement of the missing file
  put(w.verdicts, 'vision-count.json', freshCount(w.md));
  page = built(w).page;
  assert.ok(digits(blockText(section(page, 'vision'))) > 0, 'the vision block has digits once its file is there');
  const lt = blockText(section(page, 'live'));
  assert.ok(lt.includes('not measured') && digits(lt) === 0, 'site-ask.json still missing: the live block alone says not measured');
  // unreadable and wrong-shaped files are not numbers either
  put(w.verdicts, 'site-ask.json', '{ not json');
  put(w.verdicts, 'vision-count.json', '[1, 2, 3]');
  page = built(w).page;
  const vt = blockText(section(page, 'vision')), lt2 = blockText(section(page, 'live'));
  assert.ok(vt.includes('not measured') && vt.includes('holds no verdict object') && digits(vt) === 0, vt);
  assert.ok(lt2.includes('not measured') && lt2.includes('does not parse as JSON') && digits(lt2) === 0, lt2);
});

test('web-vision: a count that is not the document is named stale, and a count that is not its own line is not measured', () => {
  const w = world();
  const v = freshCount(w.md);
  // stale: one order moved from PARTIAL to MET in the file only (the document still counts its own line)
  const moved = { ...v, counts: { ...v.counts, MET: v.counts.MET + 1, PARTIAL: v.counts.PARTIAL - 1 } };
  moved.line = countLine({ total: moved.total, counts: moved.counts, unstated: moved.unstated });
  put(w.verdicts, 'vision-count.json', moved);
  let page = built(w).page;
  const vt = blockText(section(page, 'vision'));
  assert.ok(page.includes('<p class="count-line" id="vision-line">' + moved.line + '</p>'), 'the file line is shown as the file line');
  assert.ok(vt.includes('stale: docs/VISION.md now counts ' + w.line), 'and the document line beside it, named stale: ' + vt.slice(-250));
  assert.notEqual(moved.line, w.line);
  // a line the counts do not make
  put(w.verdicts, 'vision-count.json', { ...v, line: v.line.replace('MET: ' + v.counts.MET + '.', 'MET: ' + (v.counts.MET + 5) + '.') });
  page = built(w).page;
  assert.match(blockText(section(page, 'vision')), /not measured the line in bench\/verdicts\/vision-count\.json is not the line its counts make/);
  // counts that do not sum to the total
  put(w.verdicts, 'vision-count.json', { ...v, total: v.total + 1 });
  assert.match(blockText(section(built(w).page, 'vision')), /not measured the counts in bench\/verdicts\/vision-count\.json do not sum to its total/);
  // the same bytes counted, the document edited since, same line: said in words
  put(w.verdicts, 'vision-count.json', { ...v, sourceSha256: sha(w.md + ' ') });
  assert.ok(blockText(section(built(w).page, 'vision')).includes('has been edited since this count and still counts this line'));
  // the other kind of count: every order MET. The rule then says over, and only then (the document itself is not, so stale too)
  const all = { ...v, counts: { MET: v.total, PARTIAL: 0, OPEN: 0, FROZEN: 0, UNSTATED: 0 }, unstated: [] };
  all.line = countLine({ total: all.total, counts: all.counts, unstated: [] });
  put(w.verdicts, 'vision-count.json', all);
  const at = blockText(section(built(w).page, 'vision'));
  assert.ok(at.includes('MET is ' + v.total + ' of ' + v.total + ', so by his rule it is over.'), at);
  if (v.counts.MET !== v.total) assert.ok(at.includes('stale: docs/VISION.md now counts ' + w.line), 'a count of all MET that the document does not make is named stale');
});

test('web-vision: the page built from bench/verdicts on disk carries the counter line when the count is fresh, and says stale when it is not', { skip: !existsSync(path.join(VERDICTS, 'vision-count.json')) }, () => {
  const w = world();
  for (const n of ['vision-count.json', 'site-ask.json']) if (existsSync(path.join(VERDICTS, n))) copyFileSync(path.join(VERDICTS, n), path.join(w.verdicts, n));
  const real = JSON.parse(readFileSync(path.join(w.verdicts, 'vision-count.json'), 'utf8'));
  const { page } = built(w);
  const vis = section(page, 'vision');
  if (real.line === w.line) {
    assert.ok(page.includes('<p class="count-line" id="vision-line">' + w.line + '</p>'), 'fresh on disk: the page carries countLine(countVision(docs/VISION.md)) byte for byte: ' + w.line);
    assert.ok(!vis.includes('stale:'));
  } else {
    assert.ok(blockText(vis).includes('stale: docs/VISION.md now counts ' + w.line), 'stale on disk: the page names the document line');
  }
  assert.ok(!page.includes(EMDASH));
  assert.ok(Buffer.byteLength(page) < 160000, 'size cap: ' + Buffer.byteLength(page));
});

test('web-vision: the verdict of the bar is true on a fresh world and names the check that fails on a stale one', () => {
  const w = world();
  put(w.verdicts, 'vision-count.json', freshCount(w.md));
  put(w.verdicts, 'site-ask.json', plantedLive());
  put(w.verdicts, 'gate.json', { verdict: 'GREEN', testsPassed: 3, testsTotal: 3, assertionsPassed: 12, assertionsFailed: 0, at: '2026-09-27T10:00:00.000Z' });
  const p = built(w).path;
  const l = generateLadder({ verdictsDir: w.verdicts, outDir: path.join(w.dir, 'ladder') });
  injectLadder({ pagePath: l.path, verdictsDir: w.verdicts, visionDoc: w.visionDoc });
  const v = webVisionVerdict({ portfolioPath: p, ladderPath: l.path, verdictsDir: w.verdicts, visionDoc: w.visionDoc, command: 'test' });
  assert.deepEqual(v.failed, [], 'every check holds: ' + JSON.stringify(v.met));
  assert.equal(v.barMet, true);
  assert.equal(v.isTheBar, true);
  assert.equal(v.split.heldOut, 'none');
  assert.equal(v.control.digits, 0);
  assert.equal(v.portfolio.visionLine, w.line);
  assert.ok(!JSON.stringify(v).includes(EMDASH));
  // the same checks on the other kind of world: a stale count, rebuilt, must fail the byte-for-byte check and only the checks it breaks
  const c = freshCount(w.md);
  const moved = { ...c, counts: { ...c.counts, MET: c.counts.MET + 1, PARTIAL: c.counts.PARTIAL - 1 } };
  moved.line = countLine({ total: moved.total, counts: moved.counts, unstated: moved.unstated });
  put(w.verdicts, 'vision-count.json', moved);
  const p2 = built(w).path;
  const l2 = generateLadder({ verdictsDir: w.verdicts, outDir: path.join(w.dir, 'ladder2') });
  injectLadder({ pagePath: l2.path, verdictsDir: w.verdicts, visionDoc: w.visionDoc });
  const v2 = webVisionVerdict({ portfolioPath: p2, ladderPath: l2.path, verdictsDir: w.verdicts, visionDoc: w.visionDoc, command: 'test' });
  assert.equal(v2.barMet, false);
  assert.deepEqual(v2.failed.sort(), ['ladderHeaderLine', 'lineIsTheDocumentByteForByte'].sort(), 'a stale count fails exactly the document checks: ' + v2.failed.join(', '));
  // and a page with no blocks at all fails the block checks
  const bare = path.join(w.dir, 'bare.html');
  writeFileSync(bare, '<html><body>nothing</body></html>');
  const v3 = webVisionVerdict({ portfolioPath: bare, ladderPath: l.path, verdictsDir: w.verdicts, visionDoc: w.visionDoc, command: 'test' });
  for (const k of ['visionBlockOnPage', 'liveBlockOnPage', 'lineIsTheDocumentByteForByte', 'overSentence', 'liveUrl']) assert.ok(v3.failed.includes(k), k + ' fails on a page without the blocks');
});
