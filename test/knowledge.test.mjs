// test/knowledge.test.mjs. The knowledge tier on a synthetic 50 article dump
// (test/fixtures/knowledge/wiki50.*): the bz2 reader, the wikitext stripper, ingest, recall, the
// held-out rule, the on-disk round trip, the key space against core/signal.mjs, and promotion into
// the semantic tier. Every handle it opens it closes, so the file exits on its own.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// the wasm hypervector heap is sized on first use; a small one is plenty for these checks
process.env.BRAIN_HV_HEAP_MB = process.env.BRAIN_HV_HEAP_MB || '32';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(HERE, 'fixtures', 'knowledge');
const BZ = path.join(FIX, 'wiki50.xml.bz2');
const { wiki50Xml, wiki50Articles, NOUNS } = await import('./fixtures/knowledge/wiki50.mjs');
const W = await import('../tools/ingest-wiki.mjs');
const K = await import('../memory/knowledge.mjs');
const { drawHeldout, gradeDraw, nullAnswers } = await import('../bench/knowledge.mjs');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-test-'));
after(() => fs.rmSync(TMP, { recursive: true, force: true }));
const HELD = { seed: 'knowledge-test', every: 3 };
let ingested = null;
async function store() {
  if (!ingested) ingested = await W.ingest({ dump: BZ, store: path.join(TMP, 'store'), workers: 2, heldout: HELD });
  return ingested;
}

test('bz2: two streams decode to the generator text, in one thread and in workers; a flipped byte is caught', async () => {
  const buf = fs.readFileSync(BZ), want = Buffer.from(wiki50Xml(), 'utf8');
  assert.equal(W.streamStarts(buf).length, 2);
  assert.ok(W.bunzip2(buf).equals(want));
  const parts = [];
  const st = await W.bz2File(BZ, (b) => { parts.push(Buffer.from(b)); }, { workers: 2 });
  assert.ok(Buffer.concat(parts).equals(want));
  assert.equal(st.streams, 2);
  assert.equal(st.bytesOut, want.length);
  const bad = Buffer.from(buf); bad[200] ^= 0x10;
  assert.throws(() => W.bunzip2(bad), W.Bz2Error);
});

test('wikitext: markup, references, files and templates go; categories are collected; skipped sections stay out', () => {
  const a = wiki50Articles()[3];
  const doc = W.stripWikitext(a.wikitext);
  const all = doc.sections.flatMap((s) => s.sentences).join(' ');
  assert.equal(doc.sections[0].sentences[0], `${a.title} is a ${a.adj} ${a.noun} in ${a.place}.`);
  assert.doesNotMatch(all, /[[\]{}<>|]|'''|ref|Pic3|thumb|cite|reflist/);
  assert.match(all, /the land of /);
  assert.ok(!doc.sections.some((s) => /references/i.test(s.heading || '')));
  assert.deepEqual(doc.categories.map((c) => c.replace(/_/g, ' ')), [`Birds of ${a.place}`, `${a.adj[0].toUpperCase() + a.adj.slice(1)} things`]);
});

test('ingest: 50 articles held, the redirect and the talk page skipped, facts and bytes printed', async () => {
  const r = await store();
  assert.equal(r.counts.articles, 50);
  assert.equal(r.counts.held, 50);
  assert.equal(r.counts.redirects, 1);
  assert.equal(r.counts.pages, 52);
  assert.equal(r.titles, 50);
  assert.ok(r.complete);
  assert.ok(r.facts >= 50 * 5, 'facts ' + r.facts);
  assert.ok(r.disk.bytesPerArticle > 0 && r.memory.bytesPerArticle > 0);
  console.log(`# wiki50: ${r.facts} facts, ${r.disk.bytesPerArticle.toFixed(0)} disk and ${r.memory.bytesPerArticle.toFixed(0)} memory bytes/article, ${r.counts.heldout} held out`);
});

test('held-out rule: the seeded mark picks the same titles every time, and a hidden sentence is nowhere in the store', async () => {
  const r = await store();
  const arts = wiki50Articles();
  const marked = arts.filter((a) => K.heldMark(a.title, HELD));
  assert.ok(marked.length > 5 && marked.length < 30, 'marked ' + marked.length);
  assert.deepEqual(arts.filter((a) => K.heldMark(a.title, HELD)).map((a) => a.title), marked.map((a) => a.title));
  assert.equal(r.counts.heldout + r.counts.heldoutIneligible, marked.length);
  const held = fs.readFileSync(path.join(r.store, 'heldout.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(held.length, r.counts.heldout);
  for (const h of held) {
    const a = arts.find((x) => x.title === h.title);
    assert.equal(h.sentence, `${a.title} is a ${a.adj} ${a.noun} in ${a.place}.`);
    assert.equal(h.head, a.noun);
  }
  const ks = K.KnowledgeStore.open(r.store);
  try {
    const hidden = new Set(held.map((h) => K.normText(h.sentence)));
    for (let i = 0; i < ks.n; i++) assert.ok(!hidden.has(K.normText(ks.text(i))), 'hidden sentence stored at item ' + i);
    // the answer rule on its own
    assert.equal(K.keyNounPhrase('Paris is the capital city of France.').np, 'capital city');
    assert.equal(K.keyNounPhrase('An apple is a type of fruit that grows on trees.').np, 'fruit');
    assert.equal(K.keyNounPhrase('Mercury is one of the planets in the Solar System.').head, 'planets');
    assert.equal(K.keyNounPhrase('A chemical cell converts energy.'), null);
    assert.equal(K.keyNounPhrase('The Killers Are Our Guests is a 1959 movie.').np, 'our guests');
    assert.equal(K.keyNounPhrase('The Killers Are Our Guests is a 1959 movie.', 'The Killers Are Our Guests').np, '1959 movie');
    assert.equal(K.heldAnswer('Paris', 'Rome is the capital of Italy.'), null);
    assert.equal(K.heldAnswer('Paris', 'It is the capital of France.').head, 'capital');
    assert.deepEqual(nullAnswers('Alabama River').map((a) => a.np), ['river', 'alabama']);
    // the category prior counts the visible first sentences of a category's members, never a hidden one
    const heldSet = new Set(held.map((h) => h.title)), want = new Map();
    for (const a of arts) { const c = NOUNS.find((x) => x[0] === a.noun)[1] + ' of ' + a.place; const w = want.get(c) || { n: 0, noun: a.noun }; if (!heldSet.has(a.title)) w.n++; want.set(c, w); }
    for (const [c, w] of want) {
      const p = ks.categoryPrior(c);
      if (w.n === 0) { assert.equal(p, null, c); continue; }
      assert.equal(p.total, w.n, c);
      assert.deepEqual(p.heads, [[K.fold(w.noun), w.n]], c);
    }
    const h0 = held[0], q0 = 'What is ' + h0.title + '?';
    assert.ok(ks.answer(q0).answers.some((x) => x.kind === 'category.prior' && x.provenance === 'memory'));
    assert.ok(!ks.answer(q0, { prior: false }).answers.some((x) => x.kind === 'category.prior'));
    // graded as the bench grades: the tier finds the hidden head from what it still holds
    const { drawn } = drawHeldout(r.store, 200);
    const g = gradeDraw(ks, drawn);
    assert.equal(g.n, held.length);
    assert.equal(g.leaks, 0);
    assert.deepEqual(g.provenance, ['memory']);
    assert.ok(g.recall1 > g.null1 && g.recall5 >= g.recall1, JSON.stringify({ r1: g.recall1, n1: g.null1, r5: g.recall5 }));
    console.log(`# wiki50 held-out: recall@1 ${g.recall1.toFixed(3)} vs null ${g.null1.toFixed(3)}, recall@5 ${g.recall5.toFixed(3)} vs null ${g.null5.toFixed(3)}, ${g.meanMs.toFixed(2)} ms/query`);
  } finally { ks.close(); }
});

test('recall: "What is <title>?" brings that article first, provenance memory, with its title', async () => {
  const r = await store();
  const ks = K.KnowledgeStore.open(r.store);
  try {
    for (const a of wiki50Articles().filter((x) => !K.heldMark(x.title, HELD)).slice(0, 10)) {
      const res = ks.recall('What is ' + a.title + '?');
      assert.equal(res.facts[0].title, a.title);
      assert.equal(res.facts[0].provenance, 'memory');
      assert.equal(res.titles[0].title, a.title);
      assert.ok(res.facts.length === 5 && res.facts.every((f) => typeof f.text === 'string' && f.text.length > 0));
      const ans = ks.answer('What is ' + a.title + '?');
      assert.ok(K.answerMatches(ans.answers[0].words, a.noun), a.title + ': ' + ans.answers[0].np);
    }
    // the text index: a word only the sections hold finds the article without its title
    const a = wiki50Articles()[7];
    const res = ks.recall(`${1200 + 7 * 7}`);
    assert.ok(res.facts.some((f) => f.title === a.title && f.via === 'text.index'));
    // an exact title lookup is one probe of a table
    assert.deepEqual(ks.titleLookup(a.title.toLowerCase()).map((i) => ks.title(i)), [a.title]);
  } finally { ks.close(); }
});

test('on disk: records.bin is self-describing, and a reopened store answers exactly as before', async () => {
  const r = await store();
  const ks = K.KnowledgeStore.open(r.store);
  const qs = wiki50Articles().slice(0, 8).map((a) => 'What is ' + a.title + '?');
  const before = qs.map((q) => ks.recall(q).facts.map((f) => [f.item, f.text, f.sim]));
  // walk the frames of records.bin and check each against the fixed width index
  const rec = fs.readFileSync(path.join(r.store, 'records.bin'));
  let pos = 0, i = 0;
  while (pos < rec.length) {
    const len = rec.readUInt32LE(pos), kind = rec.readUInt8(pos + 4), art = rec.readUInt32LE(pos + 8);
    assert.equal(ks.itemOff[2 * i], pos + 12);
    assert.equal(ks.kindOf(i), kind);
    assert.equal(ks.articleOf(i), art);
    assert.equal(ks.text(i), rec.toString('utf8', pos + 12, pos + 12 + len));
    pos += 12 + len; i++;
  }
  assert.equal(i, ks.n);
  ks.close();
  assert.equal(ks.fdRec, null);
  assert.equal(ks.fdPost, null);
  const again = K.KnowledgeStore.open(r.store);
  try {
    assert.deepEqual(qs.map((q) => again.recall(q).facts.map((f) => [f.item, f.text, f.sim])), before);
    const meta = JSON.parse(fs.readFileSync(path.join(r.store, 'meta.json'), 'utf8'));
    assert.equal(meta.articles, 50);
    assert.equal(meta.items, again.n);
  } finally { again.close(); }
});

test('key space: the tier builds the same lanes core/signal.mjs does, and the signature is those lanes\' signs', async () => {
  const S = await import('../core/signal.mjs');
  for (const words of [['alpha', 'beta', 'gamma'], ['river', 'norland'], ['kalomi', 'kalomi', 'small', 'river', 'norland', 'visitors']]) {
    const vs = words.map((w) => S.hvFromSeed('word:' + w));
    const ref = S.bundle(vs);
    const mine = K.keyVector(words);
    assert.equal(mine.length, S.D);
    for (let i = 0; i < S.D; i++) if (mine[i] !== ref[i]) assert.fail(`lane ${i} of [${words}] differs: ${mine[i]} vs ${ref[i]}`);
    assert.deepEqual([...K.sigOf(words)], [...K.sigOfVector(mine)]);
    assert.ok(Math.abs(K.simOf(mine, ref) - 1) < 1e-12);
  }
});

test('promote: the heaviest title keys enter a SemanticMemory through learn(), and it recognises them', async () => {
  const r = await store();
  const { SemanticMemory } = await import('../memory/semantic.mjs');
  const ks = K.KnowledgeStore.open(r.store);
  try {
    const sm = new SemanticMemory();
    assert.equal(ks.promote(sm, { n: 10 }), 10);
    assert.equal(sm.size(), 10);
    const name = sm.names[0];
    const title = name.slice('knowledge:'.length);
    assert.equal(sm.recognize(K.keyVector(K.titleWords(title))).name, name);
  } finally { ks.close(); }
});
