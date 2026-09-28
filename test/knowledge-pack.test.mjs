// test/knowledge-pack.test.mjs. tools/knowledge-pack.mjs on a 20 article store built with
// KnowledgeWriter itself (two first sentences held out, lead and section sentences, categories):
// a pack under a cap above the store's size is the store, byte for byte (meta.json aside); a pack
// under a smaller cap is opened by the act/prompt.mjs reader, answers every fact it kept, and its
// bytes are what the plan predicted, under the cap, with the next unit over it. Every directory it
// writes it removes, and every store it opens it closes, so the file exits on its own.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.BRAIN_HV_HEAP_MB = process.env.BRAIN_HV_HEAP_MB || '32';

const K = await import('../memory/knowledge.mjs');
const P = await import('../tools/knowledge-pack.mjs');
const { knowledgeReady, knowledgeStore, closeKnowledge } = await import('../act/prompt.mjs');
const { drawHeldout, gradeDraw } = await import('../bench/knowledge.mjs');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-pack-test-'));
after(() => { closeKnowledge(); fs.rmSync(TMP, { recursive: true, force: true }); });

const PLACES = ['Arden', 'Belmor', 'Corvale', 'Dunmere', 'Elstow', 'Farrow', 'Glenhurst', 'Harwick', 'Ivybridge', 'Jorvik'];
const THINGS = [['river', 'Rivers of Norland'], ['mountain', 'Mountains of Norland'], ['town', 'Towns in Norland'], ['lake', 'Lakes of Norland']];
/**
 * Twenty articles: a defining first sentence, lead sentences, sections of different length, categories;
 * articles 5 and 12 are held out, article 17 has no categories and article 18 has no lead section at
 * all (no first sentence that is not held out either), so the packer meets every kind of article the
 * full store holds: with and without a first sentence, with and without a categories fact.
 */
function fixture() {
  const out = [];
  for (let a = 0; a < 20; a++) {
    const place = PLACES[a % PLACES.length] + (a >= 10 ? ' North' : '');
    const [noun, cat] = THINGS[a % THINGS.length];
    const title = place + ' ' + noun[0].toUpperCase() + noun.slice(1);
    const first = `${title} is a ${noun} in the ${a % 2 ? 'east' : 'west'} of Norland.`;
    const lead = [first];
    for (let k = 0; k < 1 + (a % 4); k++) lead.push(`${title} was first mapped in ${1700 + a * 7 + k} by surveyor number ${a * 10 + k}.`);
    const sections = [{ heading: '', sentences: a === 18 ? [] : lead }];
    for (let s = 0; s < a % 3; s++) sections.push({ heading: 'Part ' + s, sentences: [`The ${noun} of ${place} has feature ${s} measured at ${a * 3 + s} metres.`, `Visitors reach ${title} by road number ${a + s}.`] });
    const categories = a === 17 ? [] : [cat, a % 2 ? 'Eastern Norland' : 'Western Norland'];
    let hide = null;
    if (a === 5 || a === 12) { const kp = K.heldAnswer(title, first); hide = { title, sentence: first, np: kp.np, head: kp.head }; }
    out.push({ title, pageId: 1000 + a, sections, categories, hide });
  }
  return out;
}
const SRC = path.join(TMP, 'src');
{
  const w = new K.KnowledgeWriter(SRC, { source: 'knowledge-pack test fixture' });
  for (const a of fixture()) w.addArticle(a);
  w.finish({ complete: true });
}
const srcFiles = P.dirBytes(SRC);
// the title bands are 8 x 65537 words whatever the size, so a fraction of the store is a fraction of the rest
const VARIABLE = srcFiles.bytes - srcFiles.files['tbands.bin'] - srcFiles.files['meta.json'];
const capFor = (keep) => srcFiles.bytes - srcFiles.files['meta.json'] + P.META_RESERVE - Math.floor((1 - keep) * VARIABLE);

test('the fixture: 20 articles, two held out, a finished ingest the act/prompt.mjs reader opens', () => {
  assert.equal(knowledgeReady(SRC).ok, true);
  const meta = JSON.parse(fs.readFileSync(path.join(SRC, 'meta.json'), 'utf8'));
  assert.equal(meta.articles, 20);
  assert.equal(meta.stats.heldout, 2);
  assert.ok(meta.stats.categoriesWithPrior > 0);
  // the population: an article with no categories fact and one with no first sentence (beside the two held out)
  const st = knowledgeStore(SRC);
  const kinds = (a) => st.itemsOf(a).map((i) => st.kindOf(i));
  const noCats = [], noFirst = [];
  for (let a = 0; a < st.A; a++) { if (!kinds(a).includes(K.KIND.categories)) noCats.push(a); if (!kinds(a).includes(K.KIND.first)) noFirst.push(a); }
  assert.deepEqual(noCats, [17]);
  assert.deepEqual(noFirst, [5, 12, 18]);
  closeKnowledge();
});

test('a cap above the store: every file but meta.json is byte-identical to the source, and the plan predicted it exactly', () => {
  const out = path.join(TMP, 'pack-all');
  const r = P.pack({ from: SRC, out, capMB: 50 });
  assert.equal(r.plan.all, true);
  assert.equal(r.underCap, true);
  assert.equal(r.exact, true, 'predicted ' + r.plan.predicted + ', written ' + (r.write.bytes - r.write.metaBytes));
  for (const f of Object.keys(srcFiles.files)) {
    if (f === 'meta.json') continue;
    assert.ok(fs.readFileSync(path.join(SRC, f)).equals(fs.readFileSync(path.join(out, f))), f + ' differs');
  }
  assert.equal(knowledgeReady(out).ok, true);
  closeKnowledge();
});

for (const rule of P.RULES) for (const keep of [0.6, 0.2]) {
  test(`rule ${rule} under a cap that keeps about ${keep * 100} percent of the store beyond its fixed title bands: the reader opens it, every kept fact is recalled and answered, the cap arithmetic holds`, () => {
    const capMB = capFor(keep) / P.MB;
    const out = path.join(TMP, 'pack-' + rule + '-' + keep);
    const r = P.pack({ from: SRC, out, capMB, rule });
    const capBytes = Math.round(capMB * P.MB);
    // the cap arithmetic: every file counted from disk, under the cap, the plan exact, the next unit over the budget
    const onDisk = P.dirBytes(out);
    assert.equal(onDisk.bytes, r.write.bytes);
    assert.ok(onDisk.bytes <= capBytes, onDisk.bytes + ' > ' + capBytes);
    assert.equal(r.exact, true, 'predicted ' + r.plan.predicted + ', written ' + (onDisk.bytes - onDisk.files['meta.json']));
    assert.ok(onDisk.files['meta.json'] <= P.META_RESERVE);
    assert.equal(r.plan.all, false, 'the cap kept everything, so it tests nothing');
    assert.ok(r.plan.next > r.plan.budget, 'the next unit (' + r.plan.next + ') would have fit under ' + r.plan.budget);
    assert.ok(r.plan.articles > 0 && r.plan.articles <= 20);
    // the reader of act/prompt.mjs opens it
    assert.equal(knowledgeReady(out).ok, true, knowledgeReady(out).reason);
    const pk = knowledgeStore(out), full = knowledgeStore(SRC);
    assert.ok(pk && full);
    assert.equal(pk.A, r.write.meta.articles);
    // every kept fact: its text, kind and section are the source's, and a question about its article recalls it
    const byTitle = new Map(); for (let a = 0; a < full.A; a++) byTitle.set(full.title(a), a);
    let kept = 0, answered = 0, defs = 0;
    for (let a = 0; a < pk.A; a++) {
      const title = pk.title(a), sa = byTitle.get(title);
      assert.ok(sa !== undefined, title + ' is not a source article');
      const srcFacts = new Map(full.itemsOf(sa).map((i) => [full.text(i), [full.kindOf(i), full.sectionOf(i)]]));
      const rec = pk.recall('What is ' + title + '?', { k: pk.n, rescore: pk.n });
      const got = new Set(rec.facts.filter((f) => f.article === a).map((f) => f.text));
      for (const i of pk.itemsOf(a)) {
        const t = pk.text(i);
        assert.deepEqual([pk.kindOf(i), pk.sectionOf(i)], srcFacts.get(t), 'kept fact ' + JSON.stringify(t) + ' is not the source fact');
        assert.ok(got.has(t), 'kept fact ' + JSON.stringify(t) + ' was not recalled for its own title');
        kept++;
        if (pk.kindOf(i) === K.KIND.first) {
          const kp = K.heldAnswer(title, t);
          if (!kp) continue;
          defs++;
          const ans = pk.answer('What is ' + title + '?').answers;
          if (ans.some((x) => K.fold(x.head) === K.fold(kp.head))) answered++;
        }
      }
    }
    assert.equal(kept, r.write.meta.facts);
    // a cap that keeps 60 percent keeps first sentences under every rule; a tight cap under a rule that keeps categories before first sentences may keep none
    if (keep === 0.6 || !rule.startsWith('cats-')) assert.ok(defs > 0, 'no kept first sentence to answer');
    assert.ok(defs <= r.write.meta.stats.byKind[K.KIND.first]);
    assert.equal(answered, defs, answered + ' of ' + defs + ' kept first sentences answered');
    // heldout.jsonl is copied whole: the same draw as the source
    assert.deepEqual(drawHeldout(out, 2).drawn.map((h) => h.title), drawHeldout(SRC, 2).drawn.map((h) => h.title));
    // a core rule keeps every article's core before any other fact: with articles left out, only cores are in
    if (rule !== 'dump' && r.plan.articles < 20) assert.ok(r.plan.facts <= 2 * r.plan.articles, 'a fact beyond the core went in before every core');
    if (rule.startsWith('core-') && keep === 0.2) assert.ok(r.plan.articles < 20, 'the tight cap kept every article');
    closeKnowledge();
  });
}

test('the byte arithmetic: the prior of the kept articles is the catdir.bin and catheads.txt the writer wrote', () => {
  const src = P.openSource(SRC);
  const scan = P.scanStore(src);
  const plan = P.planPack(scan, { capBytes: capFor(0.5), rule: 'core-rank' });
  const out = path.join(TMP, 'pack-prior');
  const wr = P.writePack(src, scan, plan, out, { sourceDir: SRC, heldout: fs.readFileSync(path.join(SRC, 'heldout.jsonl')) });
  assert.equal(wr.files['catdir.bin'] + wr.files['catheads.txt'], plan.prior.bytes);
  assert.equal(wr.files['ttable.bin'], 4 * P.tableSlots(plan.articles));
  assert.equal(wr.files['tbands.bin'], 4 * K.BANDS * (65537 + plan.articles));
  assert.equal(P.tableSlots(0), 2);
  assert.equal(P.tableSlots(3), 8);
  closeKnowledge();
});

test('cats-prior: the pack carries the source category prior byte for byte, under a cap that drops articles, and the plan predicted it', () => {
  const out = path.join(TMP, 'pack-cats-prior');
  const r = P.pack({ from: SRC, out, capMB: capFor(0.3) / P.MB, rule: 'cats-prior' });
  assert.equal(r.plan.all, false);
  assert.equal(r.exact, true);
  assert.ok(r.write.bytes <= r.capBytes);
  for (const f of ['catdir.bin', 'catheads.txt']) assert.ok(fs.readFileSync(path.join(SRC, f)).equals(fs.readFileSync(path.join(out, f))), f + ' differs from the source');
  assert.equal(r.write.meta.stats.categoriesWithPrior, JSON.parse(fs.readFileSync(path.join(SRC, 'meta.json'), 'utf8')).stats.categoriesWithPrior);
  // cats-first at the same cap counts its prior from the kept first sentences only, so it cannot carry more of it
  const out2 = path.join(TMP, 'pack-cats-first-same-cap');
  const r2 = P.pack({ from: SRC, out: out2, capMB: capFor(0.3) / P.MB, rule: 'cats-first' });
  assert.ok(r2.plan.prior.bytes <= r.plan.prior.bytes);
  assert.equal(knowledgeReady(out).ok, true);
  closeKnowledge();
});

test('an impossible cap is refused, and an unknown rule is refused', () => {
  assert.throws(() => P.pack({ from: SRC, out: path.join(TMP, 'pack-tiny'), capMB: 0.01 }), /does not fit/);
  assert.throws(() => P.pack({ from: SRC, out: path.join(TMP, 'pack-bad'), capMB: 50, rule: 'nope' }), /rule must be one of/);
  closeKnowledge();
});

test('the verdict: barMet only when every cap is packed under its bytes, measured on the full store draw, with no leak', () => {
  const vis = (extra = {}) => ({ n: 200, seed: P.VISIBLE_SEED, drawHash: 'v', recallFirst: 70, recallTop5: 80, ...extra });
  // every row carries the lines its command printed, as mainCap records them (the statement may quote only those numbers)
  const printedOf = (r) => [
    'knowledge pack: node tools/knowledge-pack.mjs --cap ' + r.capMB,
    'bytes: ' + r.bytes + ' on disk under the cap ' + r.capBytes,
    'written (its meta.json): ' + r.articles + ' articles, ' + r.facts + ' facts',
    'measured on 200 drawn held-out questions: recall first ' + r.recallFirst + ', top five ' + r.recallTop5 + ', ' + r.msPerQuery + ' ms per query',
    'visible draw: recall first ' + (r.visible ? r.visible.recallFirst : null) + ', top five ' + (r.visible ? r.visible.recallTop5 : null),
  ];
  const row = (capMB, extra = {}) => { const r = { capMB, capBytes: capMB * P.MB, bytes: capMB * P.MB - 1, ready: true, recallFirst: 50, recallTop5: 60, msPerQuery: 1.25, leaks: 0, drawHash: 'h', articles: 1017, facts: 3041, visible: vis(), ...extra }; if (!('printed' in extra)) r.printed = printedOf(r); return r; };
  const fullPrinted = ['full store bench/fixtures/wiki/store (its meta.json): 2034 articles, 9087 facts, 5 items; 30517 bytes over its 13 files',
    'full store 30517 bytes, measured on 200 drawn held-out questions: recall first 62.5, top five 78.5 (null 9 / 13); knowledge.json recorded 62.5 / 78.5 at 4.1 ms',
    'visible draw (200 articles with a first sentence, seed ' + P.VISIBLE_SEED + '): recall first 90, top five 80 (null 15.5)'];
  const base = { rule: 'core-rank', split: { development: { chosen: 'core-rank' } }, full: { articles: 2034, facts: 9087, bytes: 30517, recallFirst: 62.5, recallTop5: 78.5, printed: fullPrinted, control: { n: 200, recallFirst: 62.5, recallTop5: 78.5, nullFirst: 9, nullTop5: 13, drawHash: 'h', visible: vis({ recallFirst: 90 }) } } };
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50)] }).barMet, true);
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100)] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50, { bytes: 50 * P.MB + 1 })] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50, { drawHash: 'other' })] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50, { leaks: 1 })] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50, { recallFirst: null })] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, full: { ...base.full, control: null }, caps: [row(200), row(100), row(50)] }).barMet, false);
  assert.match(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50)] }).statement, /is met/);
  // a rule that is not the one chosen outside the draw is not the bar, and a verdict with no development record is not either
  assert.equal(P.finishVerdict({ ...base, split: { development: { chosen: 'dump' } }, caps: [row(200), row(100), row(50)] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, split: undefined, caps: [row(200), row(100), row(50)] }).barMet, false);
  // the second population: a row not measured on the visible draw, or measured on another visible draw, or a control without one
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50, { visible: null })] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50, { visible: vis({ drawHash: 'w' }) })] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50, { visible: vis({ recallFirst: null }) })] }).barMet, false);
  assert.equal(P.finishVerdict({ ...base, full: { ...base.full, control: { ...base.full.control, visible: null } }, caps: [row(200), row(100), row(50)] }).barMet, false);
  assert.match(P.finishVerdict({ ...base, caps: [row(200), row(100), row(50)] }).statement, /visible recall first 70/);
  // the rule --dev chose outside the draw, as the bar file records it in split.development (knowledge-pack-dev-partial.json
  // is the --dev run's own working file: written on 2026-09-27, it was not on disk at the 2026-09-28 gate, and the bar file is)
  assert.equal(P.DEFAULT_RULE, JSON.parse(fs.readFileSync(P.VERDICT, 'utf8')).split.development.chosen, 'the default rule is not the one --dev chose outside the draw');
});

test('the statement quotes only numbers the bar commands printed: a number no command printed (a store count read from meta.json, a limit typed into the code) fails the bar', () => {
  // the tokenizer: names are not numbers (p50, v24.15.0, pack-v2), a sentence end is not a decimal, a thousands comma splits
  assert.deepEqual(P.numbersIn('p50 2.338, v24.15.0, recall 62.5. 121/200 seed x-2026-09-27: 9 / 13 pack-v2 3,291'), ['2.338', '62.5', '121', '200', '2026', '09', '27', '9', '13', '3', '291']);
  assert.deepEqual(P.unprintedNumbers('a 250 MB limit and 62.5 recall', ['recall first 62.5']), ['250']);
  assert.deepEqual(P.unprintedNumbers('recall 62.5 on 200', ['recall first 62.5 (n 200)']), []);
  const vis = { n: 200, seed: P.VISIBLE_SEED, drawHash: 'v', recallFirst: 70, recallTop5: 80 };
  const row = (capMB, extra = {}) => { const r = { capMB, capBytes: capMB * P.MB, bytes: capMB * P.MB - 7, ready: true, recallFirst: 50.5, recallTop5: 60.5, msPerQuery: 2.125, leaks: 0, drawHash: 'h', articles: 1017, facts: 3041 + capMB, visible: vis, ...extra };
    r.printed = r.printed || ['knowledge pack: node tools/knowledge-pack.mjs --cap ' + capMB, 'bytes: ' + r.bytes, 'written: ' + r.articles + ' articles, ' + r.facts + ' facts', 'measured on 200: recall first ' + r.recallFirst + ', top five ' + r.recallTop5 + ', ' + r.msPerQuery + ' ms per query', 'visible draw: recall first 70, top five 80']; return r; };
  const full = { articles: 2034, facts: 9087, bytes: 30517, recallFirst: 62.5, recallTop5: 78.5,
    printed: ['full store (its meta.json): 2034 articles, 9087 facts; 30517 bytes', 'measured on 200 drawn held-out questions: recall first 61.5, top five 77.5 (null 9 / 13); knowledge.json recorded 62.5 / 78.5', 'visible draw (200 articles, seed ' + P.VISIBLE_SEED + '): recall first 90, top five 95'],
    control: { n: 200, recallFirst: 61.5, recallTop5: 77.5, nullFirst: 9, nullTop5: 13, drawHash: 'h', visible: { ...vis, recallFirst: 90, recallTop5: 95 } } };
  const base = { rule: 'core-rank', split: { development: { chosen: 'core-rank' } }, full };
  const ok = P.finishVerdict({ ...base, caps: [row(200), row(100), row(50)] });
  assert.equal(ok.checks.statementNumbersPrinted, true, 'unprinted: ' + ok.unprintedNumbers);
  assert.deepEqual(ok.unprintedNumbers, []);
  assert.equal(ok.barMet, true);
  // not true of nothing: the statement quotes many numbers, each of them on a printed line
  const quoted = new Set(P.numbersIn(ok.statement));
  for (const n of ['2034', '9087', '30517', '200', '100', '50', '61.5', '77.5', '62.5', '78.5', '9', '13', '90', '95', '3241', '3141', '3091', '2.125', '50.5', '60.5']) assert.ok(quoted.has(n), n + ' is not in the statement');
  const printed = new Set(P.printedLinesOf(ok).flatMap(P.numbersIn));
  for (const n of quoted) assert.ok(printed.has(n), n + ' quoted, never printed');
  // the defect the verify plane found: the full store's facts read from meta.json, never printed
  const noFacts = P.finishVerdict({ ...base, full: { ...full, printed: full.printed.slice(1) }, caps: [row(200), row(100), row(50)] });
  assert.equal(noFacts.checks.statementNumbersPrinted, false);
  assert.ok(noFacts.unprintedNumbers.includes('9087') && noFacts.unprintedNumbers.includes('2034'), 'unprinted: ' + noFacts.unprintedNumbers);
  assert.equal(noFacts.barMet, false);
  assert.match(noFacts.statement, /is not met/);
  // the check is over the union of the printed lines: a row that never printed its ms per query passes when another command printed the same value,
  // and fails when the value is its own
  const noMs = P.finishVerdict({ ...base, caps: [row(200), row(100), row(50, { printed: ['knowledge pack: node tools/knowledge-pack.mjs --cap 50', 'bytes: ' + (50 * P.MB - 7), 'written: 1017 articles, 3091 facts', 'measured on 200: recall first 50.5, top five 60.5'] })] });
  assert.deepEqual(noMs.unprintedNumbers, []);
  const noMs2 = P.finishVerdict({ ...base, caps: [row(200, { msPerQuery: 3.375 }), row(100), row(50, { msPerQuery: 4.625, printed: ['knowledge pack: node tools/knowledge-pack.mjs --cap 50', 'bytes: ' + (50 * P.MB - 7), 'written: 1017 articles, 3091 facts', 'measured on 200: recall first 50.5, top five 60.5'] })] });
  assert.deepEqual(noMs2.unprintedNumbers, ['4.625']);
  assert.equal(noMs2.barMet, false);
  // rows with no printed lines at all (a verdict written before this check): the caps and every row number are unprinted
  const bare = P.finishVerdict({ ...base, full: { ...full, printed: undefined }, caps: [row(200, { printed: [] }), row(100, { printed: [] }), row(50, { printed: [] })] });
  assert.equal(bare.barMet, false);
  assert.ok(bare.unprintedNumbers.length > 10, 'unprinted: ' + bare.unprintedNumbers);
});

test('the visible draw: only articles with a first sentence of their own (never a held-out one), each graded on its own sentence head; the source answers them, a pack without first sentences answers fewer', () => {
  const src = knowledgeStore(SRC);
  const vis = P.visibleDraw(src, 50);
  const titles = new Set(vis.map((h) => h.title));
  assert.equal(vis.length, 17, 'twenty articles less the two held out and the one with no lead');
  for (const a of [5, 12, 18]) assert.ok(!titles.has(src.title(a)), src.title(a) + ' has no first sentence in the store, it cannot be in the visible draw');
  assert.deepEqual(P.visibleDraw(src, 50).map((h) => h.title), vis.map((h) => h.title), 'the draw is a pure function of the store and the seed');
  assert.deepEqual(P.visibleDraw(src, 5).map((h) => h.title), vis.slice(0, 5).map((h) => h.title));
  const gFull = gradeDraw(src, vis);
  assert.equal(gFull.n, 17);
  assert.equal(gFull.recall1, 1, 'the source store answers every visible article from its own first sentence');
  // a cats-first pack whose cap keeps titles and categories only: no first sentence, so no answer from one
  const out = path.join(TMP, 'pack-visible');
  const r = P.pack({ from: SRC, out, capMB: capFor(0.05) / P.MB, rule: 'cats-first' });
  const pk = knowledgeStore(out);
  let firsts = 0; for (let a = 0; a < pk.A; a++) for (const i of pk.itemsOf(a)) if (pk.kindOf(i) === K.KIND.first) firsts++;
  assert.equal(firsts, 0, 'the tight cap kept a first sentence, so it tests nothing');
  assert.ok(r.plan.articles > 0);
  const gPack = gradeDraw(pk, vis);
  assert.ok(gPack.recall1 < gFull.recall1, 'a pack with no first sentence scored ' + gPack.recall1 + ' on the visible draw, as high as the source');
  closeKnowledge();
});
