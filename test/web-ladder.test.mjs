// test/web-ladder.test.mjs: the ladder page (/ladder), rendered two ways and walked back to its files.
//
// 1. From the verdicts on disk now (bench/verdicts), without writing the page.
// 2. From a fixture directory in which one public set has NO verdict (HumanEval) and one has only
//    a -partial verdict (GSM8K), with the ARC verdict whole, and no native.json or years.json.
// Plus a directory with no ladder.json at all, one with a verdict that does not parse, and one
// with a verdict that is partial only because isTheBar is false.
//
// Every page is walked by web/ladder-walk.mjs, which shares no code with the generator: every run
// of digits in the page text must sit in a span naming a verdict file and a field, and the span
// must show exactly that field. A number with no field fails. So do the controls at the bottom,
// which bend one number, drop one loose digit and point one span at a field that is not there,
// and prove the walker says so; a walker that passes everything would pass them too.
//
// No network, no model, no server; the fixture directories are removed in after().
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateLadder } from '../web/ladder.mjs';
import { walkLadder, pageText, cardHtml } from '../web/ladder-walk.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const EMDASH = String.fromCharCode(0x2014);
const DIGIT = /[0-9]/;

const temps = [];
after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true }); });
function fixture(files, extra = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'web-ladder-'));
  temps.push(dir);
  for (const f of files) copyFileSync(path.join(VERDICTS, f), path.join(dir, f));
  for (const [f, body] of Object.entries(extra)) writeFileSync(path.join(dir, f), body);
  return dir;
}
const onDisk = (f) => existsSync(path.join(VERDICTS, f));

/** Render, walk, and hold the page to the rules every rendering shares. */
function renderAndWalk(t, dir, label) {
  const g = generateLadder({ verdictsDir: dir, write: false });
  const w = walkLadder(g.html, dir);
  assert.deepEqual(w.bad, [], label + ': every number must walk back to a field of a verdict file');
  assert.equal(g.html.includes(EMDASH), false, label + ': no em dash on the page');
  assert.equal(w.spans, g.spans, label + ': the walker saw every span the generator emitted');
  t.diagnostic(label + ': ' + g.bytes + ' bytes, ' + w.numbers + ' numbers traced in ' + w.spans + ' spans (' + w.valueNumbers + ' in '
    + w.valueSpans + ' field values, ' + w.pathNumbers + ' in ' + w.pathSpans + ' field-path labels, ' + w.fileNumbers + ' in ' + w.fileSpans
    + ' file names) from ' + w.files.size + ' verdict files');
  return { g, w, text: pageText(g.html) };
}

let current = null;

test('the ladder from the verdicts on disk now: every number walks back to a field', (t) => {
  current = renderAndWalk(t, VERDICTS, 'current verdicts');
  const { g, w, text } = current;
  assert.ok(w.valueSpans > 0 && w.valueNumbers > 0, 'the page shows numbers read from fields');
  for (const s of g.sets) {
    const card = cardHtml(g.html, 'set-' + s.key);
    assert.ok(card, 'a card for ' + s.key);
    if (s.status === 'not measured') assert.match(card, /not measured/);
    if (s.status === 'partial') {
      assert.match(card, /class="pill st partial">partial</, s.key + ' carries the partial pill');
      assert.match(pageText(card), /sample size [0-9]+ of [0-9]+/, s.key + ' shows its sample size');
    }
  }
  for (const [base, v] of [['native', g.native], ['years', g.years]]) {
    const card = cardHtml(g.html, 'v-' + base);
    assert.ok(card, 'a card for ' + base);
    const want = !onDisk(base + '.json') && !onDisk(base + '-partial.json') ? 'not measured' : v.status;
    assert.equal(v.status, want, base + ' status follows the files on disk');
    if (want === 'not measured') assert.match(card, /not measured/);
  }
  assert.match(text, /The ladder/);
  // hover and tap: every value names its file and field in the title and in data-src
  const spans = g.html.match(/<span class="t[^"]*" data-src="[^"]+" data-fmt="[^"]+" title="[^"]+">/g) || [];
  assert.equal(spans.length, w.valueSpans + w.pathSpans, 'every traced value carries a title naming file and field');
});

test('a fixture with one set missing and one -partial renders "not measured" and "partial", never zero', (t) => {
  const need = ['ladder.json', 'public-gsm8k-partial.json'];
  const arc = onDisk('grid-evaluation.json') ? 'grid-evaluation.json' : 'public-arc.json';
  for (const f of [...need, arc]) assert.ok(onDisk(f), 'the fixture needs bench/verdicts/' + f);
  const dir = fixture([...need, arc]);
  const { g, w, text } = renderAndWalk(t, dir, 'fixture (humaneval missing, gsm8k partial)');

  const byKey = Object.fromEntries(g.sets.map((s) => [s.key, s]));
  assert.equal(byKey.humaneval.status, 'not measured');
  assert.equal(byKey.gsm8k.status, 'partial');
  assert.equal(byKey.arc.status, 'whole');

  // the missing set: the words, the pill, and not one digit anywhere in its card
  const he = cardHtml(g.html, 'set-humaneval');
  assert.match(he, /class="pill st none">not measured</);
  assert.match(pageText(he), /not measured: no verdict file for this set is on disk/);
  assert.equal(DIGIT.test(pageText(he)), false, 'a missing set shows no number at all: ' + pageText(he));
  assert.doesNotMatch(pageText(he), /(^|\s)(0|0\.00|-|n\/a)(\s|$)/, 'never zero, never a dash');

  // the partial set: the pill and its sample size, both sides traced to n and of in its own file
  const gs = cardHtml(g.html, 'set-gsm8k');
  assert.match(gs, /class="pill st partial">partial</);
  const v = JSON.parse(readFileSync(path.join(dir, 'public-gsm8k-partial.json'), 'utf8'));
  const n = '<span class="t" data-src="bench/verdicts/public-gsm8k-partial.json:n" data-fmt="raw"';
  const of = '<span class="t" data-src="bench/verdicts/public-gsm8k-partial.json:of" data-fmt="raw"';
  assert.ok(gs.includes('sample size ' + n), 'the sample size is the field n');
  assert.ok(gs.includes(of), 'out of the field of');
  assert.match(pageText(gs), new RegExp('sample size ' + v.n + ' of ' + v.of + '\\b'));
  assert.ok(w.fields.has('bench/verdicts/public-gsm8k-partial.json:n'));

  // the whole set carries no partial pill
  const ac = cardHtml(g.html, 'set-arc');
  assert.match(ac, /class="pill st whole">whole</);
  assert.doesNotMatch(ac.slice(0, ac.indexOf('</div>')), /partial/);

  // native and years are not in the fixture: not measured, and no digit in their cards
  for (const id of ['v-native', 'v-years']) {
    const c = cardHtml(g.html, id);
    assert.match(c, /not measured/);
    assert.equal(DIGIT.test(pageText(c)), false, id + ' shows no number');
  }
  assert.equal(g.native.status, 'not measured');
  assert.equal(g.years.status, 'not measured');
  assert.match(text, /partial/);
  assert.match(text, /not measured/);
});

test('no ladder.json, an unreadable verdict, and a verdict partial only by isTheBar false', (t) => {
  const he = onDisk('public-humaneval-partial.json') ? 'public-humaneval-partial.json' : null;
  const arcSrc = JSON.parse(readFileSync(path.join(VERDICTS, onDisk('grid-evaluation.json') ? 'grid-evaluation.json' : 'public-arc.json'), 'utf8'));
  arcSrc.isTheBar = false; // the name says nothing; the field alone makes it partial
  const dir = fixture(he ? [he] : [], {
    'public-gsm8k.json': '{ "at": "this file does not parse',
    'grid-evaluation.json': JSON.stringify(arcSrc),
  });
  const { g } = renderAndWalk(t, dir, 'fixture (no ladder.json)');
  const byKey = Object.fromEntries(g.sets.map((s) => [s.key, s]));
  assert.equal(byKey.gsm8k.status, 'not measured', 'a verdict that does not parse is not a measurement');
  assert.match(pageText(cardHtml(g.html, 'set-gsm8k')), /unreadable, not parsed as JSON/);
  assert.equal(byKey.arc.status, 'partial', 'isTheBar false makes a verdict partial whatever its name');
  assert.match(pageText(cardHtml(g.html, 'set-arc')), /isTheBar is false/);
  if (he) assert.equal(byKey.humaneval.status, 'partial');
  assert.match(pageText(cardHtml(g.html, 'p15')), /not measured: no ladder\.json is on disk/);
  for (const s of g.sets) if (s.status !== 'not measured') assert.match(pageText(cardHtml(g.html, 'set-' + s.key)), /not measured: the ladder board has no row for this set \(no ladder\.json on disk\)/);
});

test('controls: the walker rejects a bent number, a loose digit, a bad path and a missing file', () => {
  assert.ok(current, 'the current page rendered');
  const html = current.g.html;
  // a bent number: the first value span showing digits, with its last digit changed
  const re = /(<span class="t[^"]*" data-src="[^"]+" data-fmt="(?:raw|pct|pts)"[^>]*>)([^<]*[0-9][^<]*)(<\/span>)/;
  const m = re.exec(html);
  assert.ok(m, 'a value span with digits exists');
  const bentText = m[2].replace(/([0-9])(?=[^0-9]*$)/, (d) => String((Number(d) + 1) % 10));
  const bent = html.replace(re, (all, a, x, c) => a + bentText + c);
  const wb = walkLadder(bent, VERDICTS);
  assert.equal(wb.bad.length, 1, 'one bent number, one defect');
  assert.match(wb.bad[0], /shows .* but the field under/);

  const loose = html.replace('</footer>', ' <p>seven builders, 42 of them</p></footer>');
  const wl = walkLadder(loose, VERDICTS);
  assert.ok(wl.bad.some((b) => /a digit outside every traced span: "42"/.test(b)), 'a loose digit is caught');

  const badPath = html.replace(/data-src="bench\/verdicts\/([^":]+):([^"]+)" data-fmt="raw"/, 'data-src="bench/verdicts/$1:$2.nowhere" data-fmt="raw"');
  const wp = walkLadder(badPath, VERDICTS);
  assert.ok(wp.bad.some((b) => /no such field|the field is an object/.test(b)), 'a span pointing at no field is caught');

  const gone = html.replace(/data-file="bench\/verdicts\/([^"]+)"/, 'data-file="bench/verdicts/not-on-disk.json"');
  const wg = walkLadder(gone, VERDICTS);
  assert.ok(wg.bad.some((b) => /not on disk|shows/.test(b)), 'a file span naming no file is caught');

  const markup = html.replace(re, (all, a, x, c) => a + '<b>' + x + '</b>' + c);
  assert.ok(walkLadder(markup, VERDICTS).bad.some((b) => /markup inside a traced span/.test(b)), 'markup inside a traced span is caught');

  // an entity is decoded before the digit test, so &#8212; style references are not numbers, and an
  // em dash written as a reference would still be found on the page text
  assert.equal(pageText('<p>a&#8212;b</p>').includes(EMDASH), true);
  assert.equal(pageText(html).includes(EMDASH), false, 'no em dash in the page text, decoded');
});
