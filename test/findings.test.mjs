// test/findings.test.mjs: the findings page is generated, and everything on it traces back.
//
// The claim under test is the one the page makes about itself: a number that no command
// printed does not exist, so no number on the page may fail to resolve to a field of a
// verdict file, to the soak state, or to a count the generator printed in this run. The
// generator asserts that on itself; this file asserts it again from the outside, parsing
// the written page and re-reading the verdicts on its own rather than trusting the
// generator's bookkeeping. The control for "the page traces" is a page with one digit
// changed: the same parse must reject it, otherwise the check is true of anything.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, trace, at, fmt, qnorm, soakSources, verdictValues } from '../tools/findings.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.join(ROOT, 'web', 'dist', 'findings', 'index.html');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const EM_DASH = String.fromCharCode(0x2014);

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&middot;/g, '.').replace(/&amp;/g, '&');
const textOf = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Read the verdicts the way a reader would, independently of the generator. */
function verdicts() {
  const out = new Map();
  for (const f of readdirSync(VERDICTS).filter(n => n.endsWith('.json'))) {
    let json;
    try { json = JSON.parse(readFileSync(path.join(VERDICTS, f), 'utf8')); } catch { continue; /* skipped by the generator too */ }
    // a narrow run (isTheBar false) is a bench keeping its own scratch beside the bar, not a
    // finding; the generator counts it as skipped and this reader does the same
    if (json && json.isTheBar === false) continue;
    out.set(f.replace(/\.json$/, ''), json);
  }
  return out;
}

/** Every element on the page that carries a value, with the source it claims. */
function tagged(html, attr) {
  const body = html.replace(/<head[\s\S]*?<\/head>/i, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const re = new RegExp('<([a-z0-9]+)[^>]*?' + attr + '="([^"]+)"[^>]*>([\\s\\S]*?)<\\/\\1>', 'g');
  const out = [];
  let m;
  // the attribute value is HTML encoded, like the text: a quoted path segment carries &quot;
  while ((m = re.exec(body))) out.push({ src: decode(m[2]), text: textOf(m[3]) });
  return out;
}

const gen = generate();
const page = readFileSync(PAGE, 'utf8');

test('the generator runs and writes the page it says it wrote', () => {
  assert.ok(existsSync(PAGE), 'no page at ' + PAGE);
  assert.equal(statSync(PAGE).size, gen.bytes);
  assert.ok(gen.verdicts > 0, 'no verdict was read');
  // not "skipped is zero": another builder may be mid write on a verdict of their own, and
  // the claim here is that the page accounts for every file, not that every file parses
  const onDisk = readdirSync(VERDICTS).filter(n => n.endsWith('.json')).length;
  assert.equal(gen.verdicts + gen.skipped, onDisk, 'the page lost a verdict file');
  assert.equal(gen.measured + gen.nulls, gen.verdicts, 'a verdict landed in neither section');
  assert.ok(page.includes('DILATION'), 'the page lost its title');
  console.log('generator  verdicts ' + gen.verdicts + '  measured ' + gen.measured + '  nulls ' + gen.nulls
    + '  values ' + gen.values + '  bytes ' + gen.bytes);
});

test('every verdict file on disk has a card, and every card names a verdict file', () => {
  const readable = [...verdicts().keys()].map(n => n + '.json').sort();
  const cards = tagged(page, 'data-name').map(t => t.src).sort();
  assert.deepEqual(cards, readable, 'the cards and the readable verdict files disagree');
  for (const t of tagged(page, 'data-name')) assert.equal(t.src, t.text + '.json');
  console.log('cards      ' + cards.length + ' cards for ' + readable.length + ' readable verdict files');
});

test('every number on the page traces to a verdict field, the soak or a printed count', () => {
  const v = verdicts();
  const soakMeta = path.join(ROOT, 'state', 'soak', 'meta.json');
  const soak = existsSync(soakMeta) ? JSON.parse(readFileSync(soakMeta, 'utf8')) : {};
  const soakField = { ticks: soak.t, cells: soak.cells, edges: soak.edges, live_edges: soak.liveEdges, savedAt: soak.savedAt };
  let fromVerdict = 0, fromSoak = 0, fromRun = 0;
  for (const t of tagged(page, 'data-src')) {
    const i = t.src.indexOf(':');
    const owner = t.src.slice(0, i), p = t.src.slice(i + 1);
    if (owner === 'gen') {
      assert.ok(Object.prototype.hasOwnProperty.call(gen, p), 'the page claims a count the generator never printed: ' + p);
      assert.equal(t.text, fmt(gen[p]), t.src);
      fromRun++;
      continue;
    }
    if (owner === 'soak') {
      // the soak numbers this test can re-read are the meta fields; the file sizes are
      // read by the generator and checked by its own tracer, not invented here
      if (Object.prototype.hasOwnProperty.call(soakField, p) && soakField[p] !== undefined) {
        assert.equal(t.text, fmt(soakField[p]), t.src);
        fromSoak++;
      }
      continue;
    }
    assert.ok(v.has(owner), 'the page reads a verdict that is not on disk: ' + owner);
    const value = at(v.get(owner), p);
    assert.notEqual(value, undefined, 'nothing at ' + t.src);
    assert.equal(t.text, fmt(value), t.src + ' does not match its verdict');
    fromVerdict++;
  }
  assert.ok(fromVerdict > 100, 'only ' + fromVerdict + ' values came from verdicts');
  console.log('traced     ' + fromVerdict + ' values from verdict fields, ' + fromSoak
    + ' from the soak state, ' + fromRun + ' printed by the run');
});

test('every measure name resolves, and nothing else on the page carries a digit', () => {
  const v = verdicts();
  for (const t of tagged(page, 'data-path')) {
    const i = t.src.indexOf(':');
    const owner = t.src.slice(0, i), p = t.src.slice(i + 1);
    assert.ok(v.has(owner), 'a measure name belongs to no verdict: ' + t.src);
    assert.notEqual(at(v.get(owner), p), undefined, 'a measure name resolves to nothing: ' + t.src);
    assert.equal(t.text, p);
  }
  // strip everything that declared a source, then no digit may be left in the prose
  let rest = page.replace(/<head[\s\S]*?<\/head>/i, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  for (const attr of ['data-quoted', 'data-src', 'data-cmd', 'data-path', 'data-name']) {
    rest = rest.replace(new RegExp('<([a-z0-9]+)[^>]*?' + attr + '="[^"]+"[^>]*>[\\s\\S]*?<\\/\\1>', 'g'), ' ');
  }
  const stray = textOf(rest).match(/\d[\d.,]*/g);
  assert.equal(stray, null, 'free prose carries digits: ' + (stray || []).slice(0, 8).join(' '));
  console.log('prose      0 untraced digits outside a sourced element');
});

test('quoted text is verbatim, and every command names a file that exists', () => {
  let quoted = 0;
  for (const t of tagged(page, 'data-quoted')) {
    const p = path.join(ROOT, t.src);
    assert.ok(existsSync(p), 'quoted from a file that does not exist: ' + t.src);
    assert.ok(qnorm(readFileSync(p, 'utf8')).includes(qnorm(t.text)),
      'not verbatim in ' + t.src + ': ' + t.text.slice(0, 60));
    quoted++;
  }
  let fromFile = 0, fromField = 0;
  for (const t of tagged(page, 'data-cmd')) {
    const bar = t.src.indexOf('|');
    const kind = t.src.slice(0, bar), ref = t.src.slice(bar + 1);
    if (kind === 'file') {
      assert.ok(existsSync(path.join(ROOT, ref)), 'the command names a missing file: ' + ref);
      assert.ok(t.text.endsWith(ref), t.text + ' does not name ' + ref);
      fromFile++;
    } else {
      assert.equal(kind, 'field', 'unknown command kind ' + kind);
      const j = ref.indexOf(':');
      assert.equal(t.text, String(at(verdicts().get(ref.slice(0, j)), ref.slice(j + 1))).replace(/\s+/g, ' ').trim(), ref);
      fromField++;
    }
  }
  assert.ok(quoted > 0 && fromFile > 0, 'nothing was quoted or commanded');
  console.log('quotes     ' + quoted + ' verbatim quotations, ' + fromFile + ' commands naming a file on disk, '
    + fromField + ' quoted from a command field');
});

test('the tracer is not true of anything: one edited digit fails it', () => {
  const v = verdicts();
  const sk = soakSources();
  const sources = { verdicts: v, soak: sk, gen, files: new Map() };
  // the page as written passes
  assert.equal(trace(page, sources), true);
  // one value moved by one digit fails, and so does one word added to a quotation
  const m = /(<span class="v" data-src="[^"]+">)(\d+)(<\/span>)/.exec(page);
  assert.ok(m, 'no integer value to perturb');
  const bent = page.replace(m[0], m[1] + (Number(m[2]) + 1) + m[3]);
  assert.throws(() => trace(bent, { verdicts: v, soak: sk, gen, files: new Map() }), /does not trace back/);
  const q = /(<q data-quoted="[^"]+">)/.exec(page);
  assert.ok(q, 'no quotation to perturb');
  const lied = page.replace(q[0], q[1] + 'a sentence nobody wrote ');
  assert.throws(() => trace(lied, { verdicts: v, soak: sk, gen, files: new Map() }), /does not trace back/);
  // and a digit dropped into the prose fails, which is what keeps the rule honest
  const loose = page.replace('<h2>the soak</h2>', '<h2>the soak, up 7 days</h2>');
  assert.throws(() => trace(loose, { verdicts: v, soak: sk, gen, files: new Map() }), /does not trace back/);
  console.log('control    3 perturbations rejected: a bent number, a false quotation, a loose digit');
});

test('every note on a card quotes a value of the verdict it sits under', () => {
  const v = verdicts();
  // the control is the rule this replaced. Scoring a paragraph by its digit count let an
  // ISO timestamp win, so cards carried provenance lines whose only numbers were the clock.
  // The claim now is stronger and checkable: the note quotes this verdict's own measurement.
  const cards = page.split('<article').slice(1);
  let withNote = 0, withoutNote = 0, stamps = 0;
  for (const c of cards) {
    const name = /id="v-([^"]+)"/.exec(c)[1];
    const q = /<q data-quoted="([^"]+)">([\s\S]*?)<\/q>/.exec(c);
    if (!q) { withoutNote++; continue; }
    withNote++;
    const text = textOf(q[2]);
    const vals = verdictValues(v.get(name));
    const toks = new Set(text.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, ' ').match(/\d[\d.,]*\d/g) || []);
    const quoted = [...toks].filter(t => vals.has(t) || vals.has(t.replace(/,/g, '')));
    assert.ok(quoted.length > 0,
      'the note on ' + name + ' quotes none of its values: ' + text.slice(0, 90));
    if (/^Verdict .*written at/.test(text)) stamps++;
  }
  assert.equal(stamps, 0, stamps + ' cards still show a provenance line as their note');
  assert.ok(withNote > cards.length / 2, 'only ' + withNote + ' of ' + cards.length + ' cards carry a note');
  console.log('notes      ' + withNote + ' cards quote their own verdict, ' + withoutNote
    + ' carry none rather than an unrelated paragraph');
});

test('the intro says what the brain is, not how its document was written', () => {
  const rel = 'docs/PORTFOLIO.md';
  const doc = readFileSync(path.join(ROOT, rel), 'utf8');
  const paras = doc.split(/\n{2,}/).map(s => s.trim()).filter(Boolean).filter(p => !p.startsWith('#'));
  const quotes = tagged(page, 'data-quoted').filter(t => t.src === rel);
  assert.ok(quotes.length >= 2, 'the page carries no intro from ' + rel);
  // the control is the paragraph this rule replaced. Reading "the first paragraphs"
  // literally put the document's own provenance note at the top of the page, which names
  // internal files and an unexplained "he" and says nothing about the brain.
  assert.match(paras[0], /^Written /, 'that document no longer opens with a provenance note; re-check the intro rule');
  for (const q of quotes) {
    assert.ok(!qnorm(paras[0]).includes(qnorm(q.text)), 'the intro leads with how the document was written');
  }
  const subject = /^#\s+([A-Za-z]+)/m.exec(doc)[1];
  assert.ok(quotes[0].text.startsWith(subject + ' is'),
    'the intro opens on "' + quotes[0].text.slice(0, 40) + '" rather than saying what ' + subject + ' is');
  console.log('intro      ' + quotes.length + ' paragraphs of ' + rel + ', opening on what ' + subject + ' is');
});

test('the HUD link exists in dist and the page it points at is there', () => {
  const index = readFileSync(path.join(ROOT, 'web', 'dist', 'index.html'), 'utf8');
  assert.match(index, /id="findings"[^>]*href="findings\/"/, 'the HUD carries no findings link');
  assert.match(index, />findings</, 'the link has no label');
  assert.ok(existsSync(PAGE), 'the link points at a page that was not built');
  assert.match(page, /href="\.\.\/"/, 'the findings page cannot get back to the organism');
  console.log('link       dist/index.html to findings/, and back');
});

test('no em dash on the page, the template or the generator', () => {
  for (const rel of ['web/dist/findings/index.html', 'web/src/findings.html', 'tools/findings.mjs', 'web/src/index.html', 'web/build.mjs']) {
    assert.ok(!readFileSync(path.join(ROOT, rel), 'utf8').includes(EM_DASH), 'em dash in ' + rel);
  }
  console.log('discipline 5 files checked, 0 em dashes');
});

test('a card shows the last row of a size table, a camel cased headline, and the sentence a verdict carries, verbatim', () => {
  const v = verdicts();
  const paths = new Set(tagged(page, 'data-path').map(t => t.src));
  // scale.json: results[] is ordered by size; the card must carry the last row's majors and lines
  const scale = v.get('scale');
  if (scale && Array.isArray(scale.results) && scale.results.length > 1) {
    const last = scale.results.length - 1;
    assert.ok(paths.has('scale:results[' + last + '].majors'), 'the scale card does not show its last row');
    assert.ok(paths.has('scale:results[' + last + '].linesWritten'), 'the scale card cuts the line count of its last row');
  }
  // planes.json: simulatedYears is spelled camel case and must still headline
  const planes = v.get('planes');
  if (planes && typeof planes.simulatedYears === 'number') {
    assert.ok(paths.has('planes:simulatedYears'), 'the planes card does not show its years');
  }
  // answer.json: its statement is on the card, quoted from the file it came from
  const answer = v.get('answer');
  if (answer && typeof answer.statement === 'string') {
    const q = tagged(page, 'data-quoted').find(t => t.src === 'bench/verdicts/answer.json');
    assert.ok(q, 'the answer card carries no quote from its own file');
    assert.equal(qnorm(q.text), qnorm(answer.statement));
  }
  console.log('cards      last row, camel cased headline and own sentence checked');
});
