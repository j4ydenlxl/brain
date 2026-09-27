// test/ladder-page.test.mjs (board 20 builder): the "organism-years per wall hour" line of the ladder page.
//
// The page types no number: the per-hour figures are fields of bench/verdicts/spread-rate.json, and at
// build time web/ladder.mjs does the arithmetic again over years.json and spread.json and shows a figure
// only when the record holds exactly that arithmetic. This file proves, with arithmetic of its own:
//   1. a page built from the two verdict files on disk (copied into a temp dir, the record written by
//      the bench's own rateRecord) carries a span "organism-years per wall hour" whose number equals
//      organism-years / wall seconds x 3600 over those two files, and every number walks back to a field;
//   2. a planted years.json or spread.json without its field makes the build throw;
//   3. a record that no longer matches its source (the source re-run, or a bent figure) shows no figure;
//   4. the page built from bench/verdicts itself shows a figure only where it equals that arithmetic.
// node:test, no network, no model, no write to the real tree (temp dirs removed in after()).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateLadder, rateRecord, RATE } from '../web/ladder.mjs';
import { walkLadder, cardHtml, pageText } from '../web/ladder-walk.mjs';
import { injectLadder } from '../web/build.mjs';
import { countVision, countLine } from '../tools/vision-count.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const temps = [];
after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true }); });
const readJson = (dir, n) => JSON.parse(readFileSync(path.join(dir, n), 'utf8'));
const onDisk = (n) => existsSync(path.join(VERDICTS, n));

/** The test's own arithmetic, written apart from web/ladder.mjs: the longest grid run of years.json; spread.json's organismYears over wallS. */
function expected(years, spread) {
  const out = {};
  if (years) {
    const grid = years.runs.map((r, i) => ({ r, i })).filter(({ r }) => r.plane === 'grid').sort((a, b) => b.r.budgetS - a.r.budgetS)[0];
    out.years = { src: 'runs.' + grid.i + '.years.organismYears', perHour: Math.round(grid.r.years.organismYears / (grid.r.years.wallMs / 1000) * 3600) };
  }
  if (spread) out.spread = { src: 'organismYears', perHour: Math.round(spread.organismYears / spread.wallS * 3600) };
  return out;
}

/** A temp verdicts dir with years.json and spread.json from disk (optionally bent) and the rate record. */
function fixture({ bendYears = null, bendSpread = null, record = true, bendRecord = null } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'ladder-page-'));
  temps.push(dir);
  const years = readJson(VERDICTS, 'years.json'), spread = readJson(VERDICTS, 'spread.json');
  if (record) {
    const rec = rateRecord({ years, spread }, { command: 'test/ladder-page.test.mjs' });
    if (bendRecord) bendRecord(rec);
    writeFileSync(path.join(dir, RATE), JSON.stringify(rec, null, 2));
  }
  if (bendYears) bendYears(years);
  if (bendSpread) bendSpread(spread);
  writeFileSync(path.join(dir, 'years.json'), JSON.stringify(years, null, 2));
  writeFileSync(path.join(dir, 'spread.json'), JSON.stringify(spread, null, 2));
  return { dir, years, spread };
}

/** Every per-hour figure the page shows: its record field and its text. */
function figures(html) {
  const out = [];
  const re = /<span class="t[^"]*" data-src="bench\/verdicts\/spread-rate\.json:sources\.(\d+)\.perWallHour" data-fmt="raw"[^>]*>([^<]*)<\/span>/g;
  let m;
  while ((m = re.exec(html))) out.push({ i: Number(m[1]), text: m[2] });
  return out;
}

test('the ladder page carries organism-years per wall hour, equal to the arithmetic over years.json and spread.json', { skip: !onDisk('years.json') || !onDisk('spread.json') }, () => {
  const { dir, years, spread } = fixture();
  const g = generateLadder({ verdictsDir: dir, write: false });
  const card = cardHtml(g.html, 'per-hour');
  assert.ok(card, 'a card for the line');
  assert.match(pageText(card), /organism-years per wall hour: /, 'the words of the line');
  const want = expected(years, spread);
  const rec = readJson(dir, RATE);
  const figs = figures(card);
  assert.equal(figs.length, 2, 'one figure per source verdict');
  for (const f of figs) {
    const key = rec.sources[f.i].key;
    assert.equal(Number(f.text), want[key].perHour, key + ': the page shows ' + f.text + ', the arithmetic gives ' + want[key].perHour);
    // the inputs sit beside it, traced to the source verdict's own fields
    assert.ok(card.includes('data-src="bench/verdicts/' + key + '.json:' + want[key].src + '"'), key + ': its organism-years field is on the line');
  }
  const w = walkLadder(g.html, dir);
  assert.deepEqual(w.bad, [], 'every number on the page walks back to a field');
  assert.ok(w.fields.has('bench/verdicts/spread-rate.json:sources.0.perWallHour') && w.fields.has('bench/verdicts/spread-rate.json:sources.1.perWallHour'));
});

test('a planted verdict without its field makes the build throw', { skip: !onDisk('years.json') || !onDisk('spread.json') }, () => {
  const noYears = fixture({ record: false, bendYears: (y) => { for (const r of y.runs) if (r.plane === 'grid') delete r.years.organismYears; } });
  assert.throws(() => generateLadder({ verdictsDir: noYears.dir, write: false }), /years\.json has no organism-years/);
  const noWall = fixture({ record: false, bendYears: (y) => { for (const r of y.runs) if (r.plane === 'grid') delete r.years.wallMs; } });
  assert.throws(() => generateLadder({ verdictsDir: noWall.dir, write: false }), /years\.json has no wall/);
  const noGrid = fixture({ record: false, bendYears: (y) => { y.runs = y.runs.filter((r) => r.plane !== 'grid'); } });
  assert.throws(() => generateLadder({ verdictsDir: noGrid.dir, write: false }), /years\.json has no grid run/);
  const noSpread = fixture({ record: false, bendSpread: (s) => { delete s.organismYears; } });
  assert.throws(() => generateLadder({ verdictsDir: noSpread.dir, write: false }), /spread\.json has no organism-years/);
  // the control: the same files unbent build
  const ok = fixture();
  assert.ok(generateLadder({ verdictsDir: ok.dir, write: false }).html.includes('id="per-hour"'));
});

test('a record that no longer matches its source shows no figure', { skip: !onDisk('years.json') || !onDisk('spread.json') }, () => {
  // years.json re-run since the record was written
  const rerun = fixture({ bendYears: (y) => { for (const r of y.runs) if (r.plane === 'grid') r.years.organismYears += 1; } });
  const g1 = generateLadder({ verdictsDir: rerun.dir, write: false });
  const figs1 = figures(cardHtml(g1.html, 'per-hour'));
  assert.equal(figs1.length, 1, 'only spread.json still matches its record');
  assert.equal(readJson(rerun.dir, RATE).sources[figs1[0].i].key, 'spread');
  assert.match(pageText(cardHtml(g1.html, 'per-hour')), /not measured, bench\/verdicts\/spread-rate\.json was not computed from bench\/verdicts\/years\.json/);
  assert.deepEqual(walkLadder(g1.html, rerun.dir).bad, []);
  // a bent figure in the record is never shown
  const bent = fixture({ bendRecord: (rec) => { rec.sources[1].perWallHour += 1; } });
  const g2 = generateLadder({ verdictsDir: bent.dir, write: false });
  assert.deepEqual(figures(cardHtml(g2.html, 'per-hour')).map((f) => f.i), [0]);
  // no record at all: named, no figure
  const none = fixture({ record: false });
  const g3 = generateLadder({ verdictsDir: none.dir, write: false });
  assert.equal(figures(g3.html).length, 0);
  assert.match(pageText(cardHtml(g3.html, 'per-hour')), /spread-rate\.json is absent/);
  // no source verdict at all: not measured
  const empty = mkdtempSync(path.join(os.tmpdir(), 'ladder-page-empty-'));
  temps.push(empty);
  assert.match(pageText(cardHtml(generateLadder({ verdictsDir: empty, write: false }).html, 'per-hour')), /organism-years per wall hour: not measured/);
});

test('the page from bench/verdicts itself shows a figure only where it equals the arithmetic', () => {
  const g = generateLadder({ verdictsDir: VERDICTS, write: false });
  const card = cardHtml(g.html, 'per-hour');
  assert.ok(card, 'the line is on the page');
  const want = expected(onDisk('years.json') ? readJson(VERDICTS, 'years.json') : null, onDisk('spread.json') ? readJson(VERDICTS, 'spread.json') : null);
  const rec = onDisk(RATE) ? readJson(VERDICTS, RATE) : null;
  for (const f of figures(card)) {
    const key = rec.sources[f.i].key;
    assert.equal(Number(f.text), want[key].perHour, key + ' on the page equals the arithmetic over the file on disk');
  }
});

// ------------------------------------------------ board 24b, item web-vision: the header line
// web/build.mjs puts one line in the ladder header after web/ladder.mjs writes the page: the gate (gate.json) and the
// vision counter line (vision-count.json), every value a traced span. These cases build the page into a temp dir from
// planted files, read it back from disk, and walk it with web/ladder-walk.mjs (the second walker, not the build's guard).
const EMDASH = String.fromCharCode(0x2014);
const VISION_MD = path.join(ROOT, 'docs', 'VISION.md');
const digitCount = (s) => (String(s).match(/\d/g) || []).length;
const plantedGate = (extra = {}) => ({ verdict: 'GREEN', testsPassed: 7, testsTotal: 8, assertionsPassed: 91, assertionsFailed: 1, at: '2026-09-27T09:08:07.000Z', ...extra });
function visionWorld() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'ladder-hdr-'));
  temps.push(dir);
  const visionDoc = path.join(dir, 'VISION.md');
  copyFileSync(VISION_MD, visionDoc);
  const md = readFileSync(visionDoc, 'utf8');
  const c = countVision(md);
  const count = { at: '2026-09-27T12:00:00.000Z', command: 'node tools/vision-count.mjs --json', isTheBar: true, barMet: false, total: c.total, counts: { ...c.counts }, unstated: c.unstated, line: countLine(c) };
  return { dir, visionDoc, line: countLine(c), count };
}
function ladderBuilt(w, tag = 'out') {
  const g = generateLadder({ verdictsDir: w.dir, outDir: path.join(w.dir, tag) });
  const h = injectLadder({ pagePath: g.path, verdictsDir: w.dir, visionDoc: w.visionDoc });
  const page = readFileSync(g.path, 'utf8');
  const m = /<div class="hdr-line" id="hdr-line">[\s\S]*?<\/div>/.exec(page);
  return { page, hdr: m ? m[0] : null, h, path: g.path };
}

test('web-vision: the ladder header prints the counter line beside the gate line, every number a field of its file', () => {
  const w = visionWorld();
  writeFileSync(path.join(w.dir, 'gate.json'), JSON.stringify(plantedGate()));
  writeFileSync(path.join(w.dir, 'vision-count.json'), JSON.stringify(w.count));
  const { page, hdr, h } = ladderBuilt(w);
  assert.ok(hdr, 'the header line is on the page');
  assert.ok(page.indexOf(hdr) < page.indexOf('</header>') && page.indexOf(hdr) > page.indexOf('<header class="top">'), 'inside the header');
  const t = pageText(hdr).trim();
  assert.ok(t.startsWith('gate on the build host GREEN, 7 of 8 test files, 91 assertions pass and 1 fail at 2026-09-27 09:08 UTC'), t);
  assert.ok(t.includes('/ vision ' + w.line + ' at 2026-09-27 12:00 UTC'), 'the counter line beside the gate line: ' + t);
  assert.ok(hdr.includes('data-src="bench/verdicts/vision-count.json:line" data-fmt="raw"'), 'the line is a traced span of the count');
  assert.ok(hdr.includes('>' + w.line + '</span>'), 'byte for byte countLine(countVision(docs/VISION.md))');
  const walk = walkLadder(page, w.dir);
  assert.deepEqual(walk.bad, [], 'every number on the page walks back to a field');
  assert.ok(walk.fields.has('bench/verdicts/vision-count.json:line') && walk.fields.has('bench/verdicts/gate.json:testsPassed'), 'the walker saw the header spans');
  assert.equal(h.vision.fresh, true);
  assert.ok(!page.includes(EMDASH));
  assert.ok(!page.includes('<!-- header-line -->'), 'the marker was replaced');
  // the walker is live on the header: bend the count after the build and the same page no longer walks
  writeFileSync(path.join(w.dir, 'vision-count.json'), JSON.stringify({ ...w.count, line: w.count.line.replace('orders listed', 'orders counted') }));
  assert.ok(walkLadder(page, w.dir).bad.some((b) => b.includes('vision-count.json:line')), 'a count that changed after the build is caught by the walker');
});

test('web-vision: a missing verdict file prints "not measured" in the ladder header line, never a number', () => {
  const w = visionWorld();
  let r = ladderBuilt(w, 'none');
  let t = pageText(r.hdr).trim();
  assert.equal(t, 'gate not measured / vision not measured', t);
  assert.equal(digitCount(t), 0);
  assert.deepEqual(walkLadder(r.page, w.dir).bad, []);
  // only the gate on disk: the vision half alone says not measured
  writeFileSync(path.join(w.dir, 'gate.json'), JSON.stringify(plantedGate()));
  r = ladderBuilt(w, 'gate-only');
  t = pageText(r.hdr).trim();
  assert.ok(t.endsWith('/ vision not measured') && t.startsWith('gate on the build host GREEN'), t);
  // the control: both files on disk and the header carries digits, so the zero above measured the missing files
  writeFileSync(path.join(w.dir, 'vision-count.json'), JSON.stringify(w.count));
  r = ladderBuilt(w, 'both');
  assert.ok(digitCount(pageText(r.hdr)) > 0);
  // a count whose line is not its counts is not measured, not printed
  writeFileSync(path.join(w.dir, 'vision-count.json'), JSON.stringify({ ...w.count, total: w.count.total + 3 }));
  r = ladderBuilt(w, 'bent');
  assert.ok(pageText(r.hdr).trim().endsWith('/ vision not measured'), pageText(r.hdr));
});

test('web-vision: a stale count is named in the header line, and an em dash in a verdict never reaches the page', () => {
  const w = visionWorld();
  const moved = { ...w.count, counts: { ...w.count.counts, MET: w.count.counts.MET + 1, PARTIAL: w.count.counts.PARTIAL - 1 } };
  moved.line = countLine({ total: moved.total, counts: moved.counts, unstated: moved.unstated });
  writeFileSync(path.join(w.dir, 'vision-count.json'), JSON.stringify(moved));
  writeFileSync(path.join(w.dir, 'gate.json'), JSON.stringify(plantedGate({ verdict: 'RED' + EMDASH + 'two files' })));
  const { page, hdr, h } = ladderBuilt(w);
  const t = pageText(hdr);
  assert.ok(t.includes('vision ' + moved.line) && t.includes('stale: docs/VISION.md now counts another line'), t);
  assert.equal(h.vision.fresh, false);
  assert.ok(t.includes('gate on the build host RED, two files'), 'the em dash printed as a comma: ' + t);
  assert.ok(!page.includes(EMDASH), 'no em dash on the page');
  assert.deepEqual(walkLadder(page, w.dir).bad, [], 'the comma form is the field under raw, so it still walks');
});

test('web-vision: the ladder built from bench/verdicts on disk carries the counter line when the count is fresh', { skip: !onDisk('vision-count.json') }, () => {
  const w = visionWorld();
  const g = generateLadder({ verdictsDir: VERDICTS, outDir: path.join(w.dir, 'real') });
  injectLadder({ pagePath: g.path, verdictsDir: VERDICTS, visionDoc: w.visionDoc });
  const page = readFileSync(g.path, 'utf8');
  const hdr = /<div class="hdr-line" id="hdr-line">[\s\S]*?<\/div>/.exec(page)[0];
  const real = readJson(VERDICTS, 'vision-count.json');
  if (real.line === w.line) assert.ok(pageText(hdr).includes('vision ' + w.line) && !pageText(hdr).includes('stale'), 'fresh: ' + pageText(hdr));
  else assert.ok(pageText(hdr).includes('stale: docs/VISION.md now counts another line'), 'stale: ' + pageText(hdr));
  assert.deepEqual(walkLadder(page, VERDICTS).bad, [], 'every number on the real page walks back to a field');
  assert.ok(!page.includes(EMDASH));
});

test('web-vision: a ladder template without the header marker fails the build rather than shipping without the line', () => {
  const w = visionWorld();
  const tpl = path.join(w.dir, 'ladder.html');
  writeFileSync(tpl, readFileSync(path.join(ROOT, 'web', 'src', 'ladder.html'), 'utf8').replace('<!-- header-line -->', ''));
  const g = generateLadder({ verdictsDir: w.dir, template: tpl, outDir: path.join(w.dir, 'nomark') });
  assert.throws(() => injectLadder({ pagePath: g.path, verdictsDir: w.dir, visionDoc: w.visionDoc }), /no <!-- header-line --> marker/);
});
