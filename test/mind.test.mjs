// test/mind.test.mjs: the mind, graded. The tokenizer must be lossless, a token must be a
// quantum (its own vector and nobody else's), the learned arms must beat the null, the
// mixture must not be worse than the n gram baseline by more than a declared margin, and the
// language region must tick inside a real Brain and record what it got wrong.
//
// One model is trained once for the whole file, on a slice of the corpus rather than all of
// it, so this file stays a test and not a bench. bench/mind.mjs is where the full numbers
// come from.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from '../core/signal.mjs';
import { Brain } from '../core/brain.mjs';
import { Tokenizer, MIND_D } from '../mind/tokenizer.mjs';
import { split, commentsOf, ROOT } from '../mind/corpus.mjs';
import { MindModel, NgramBackoff, HvAssociative } from '../mind/model.mjs';
import { generate, shape } from '../mind/generate.mjs';
import { registerMind, unregisterMind, installLanguage, feed, getMind } from '../mind/index.mjs';

const EM_DASH = String.fromCharCode(0x2014);

// ---------------------------------------------------------------- one trained model, shared
const data = split();
const TRAIN = data.train.slice(0, 100_000);
const HELD = data.heldout.slice(0, 30_000);
let MODEL = null, LEARNED = null, EVAL = null, IDS = null;
function model() {
  if (!MODEL) {
    MODEL = new MindModel({ vocabSize: 384, order: 4, bits: 10, context: 4 });
    LEARNED = MODEL.train(TRAIN);
    EVAL = MODEL.evaluate(HELD);
  }
  return MODEL;
}
// The held out slice encoded once. Three of the tests below walk it, and encoding 30 KB
// per test is the difference between a fast file and a slow one.
// A STILL subject for the ladder claim: the live corpus is the repo prose, which grows every
// hour of a build night, and a bar on a moving corpus measures the docs, not the model (the
// bar fell from a bit to half a bit on 2026-09-17 and then failed again the same night at
// 0.36 bits). test/fixtures/mind-corpus.md is a frozen snapshot of five documents; the
// live corpus keeps every other test.
const FROZEN = readFileSync(path.join(ROOT, 'test', 'fixtures', 'mind-corpus.md'), 'utf8');
const FROZEN_CUT = Math.floor(FROZEN.length * 0.8);
let FMODEL = null, FIDS = null;
function frozenModel() {
  if (!FMODEL) { FMODEL = new MindModel({ vocabSize: 384, order: 4, bits: 10, context: 4 }); FMODEL.train(FROZEN.slice(0, FROZEN_CUT)); }
  return FMODEL;
}
function frozenHeldIds() {
  if (!FIDS) FIDS = frozenModel().tok.encode(Buffer.from(FROZEN.slice(FROZEN_CUT), 'utf8'));
  return FIDS;
}
function heldIds() {
  if (!IDS) IDS = model().tok.encode(Buffer.from(HELD, 'utf8'));
  return IDS;
}

// ---------------------------------------------------------------- corpus
test('corpus is ours, split by file, and both sides have bytes', () => {
  assert.ok(data.documents > 20, 'documents ' + data.documents);
  assert.ok(data.trainBytes > 50_000, 'train bytes ' + data.trainBytes);
  assert.ok(data.heldoutBytes > 5_000, 'held out bytes ' + data.heldoutBytes);
  const overlap = data.trainFiles.filter(f => data.heldoutFiles.includes(f));
  assert.deepEqual(overlap, [], 'no file may be on both sides');
  // MANUAL.md is HIS text and is never training data
  for (const f of [...data.trainFiles, ...data.heldoutFiles]) {
    assert.ok(!/MANUAL\.md$/.test(f), f + ' must not be in the corpus');
    assert.ok(!f.startsWith('organism/'), f + ' is generated, not written');
  }
  assert.ok(!data.train.includes('THE MANUAL'), 'the manual must not appear in the training text');
});

test('comment extraction keeps prose and drops code', () => {
  const src = 'const a = 1; // the tail of a line\n/* a block\n   over two lines */\nconst url = "http://not-a-comment";\n';
  const c = commentsOf(src);
  assert.ok(c.includes('the tail of a line'), c);
  assert.ok(c.includes('a block'), c);
  assert.ok(!c.includes('const a = 1'), c);
  assert.ok(!c.includes('not-a-comment'), 'a // inside a string literal is not a comment: ' + c);
});

// ---------------------------------------------------------------- tokenizer
test('tokenizer round trip is exact, byte for byte', () => {
  const tok = new Tokenizer({ vocabSize: 320 });
  tok.train(Buffer.from(TRAIN.slice(0, 40_000), 'utf8'));
  assert.ok(tok.merges.length > 0, 'merges learned ' + tok.merges.length);
  assert.equal(tok.size, 256 + tok.merges.length);
  const cases = [
    '', 'a', 'the cell is a persistent computational object',
    'primitive to cell to circuit to region to network to mind',
    'unicode: éè 你好 🧠 tabs\tand\nnewlines',
    TRAIN.slice(1000, 6000), HELD.slice(0, 5000),
  ];
  for (const s of cases) {
    const bytes = Buffer.from(s, 'utf8');
    const ids = tok.encode(bytes);
    const back = Buffer.from(tok.decode(ids));
    assert.equal(back.compare(bytes), 0, 'round trip failed for ' + JSON.stringify(s.slice(0, 40)));
  }
  // every byte value survives, including ones the corpus never contained
  const all = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
  assert.equal(Buffer.from(tok.decode(tok.encode(all))).compare(all), 0, 'all 256 byte values must round trip');
});

test('a token IS a hypervector: itself exactly, everyone else near zero', () => {
  const tok = new Tokenizer({ vocabSize: 300 });
  assert.equal(tok.d, MIND_D);
  for (const id of [0, 1, 65, 97, 200, 255]) {
    const q = tok.quantum(id);
    assert.equal(q.length, MIND_D);
    assert.equal(S.sim(q, q), 1, 'a token is exactly itself');
    assert.equal(S.sim(tok.quantum(id), tok.quantum(id)), 1, 'the quantum is stable across calls');
  }
  const ids = [0, 1, 32, 65, 97, 128, 200, 255];
  let worst = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const s = Math.abs(S.sim(tok.quantum(ids[i]), tok.quantum(ids[j])));
    if (s > worst) worst = s;
    assert.ok(s < 0.1, 'tokens ' + ids[i] + ' and ' + ids[j] + ' are not orthogonal enough: sim ' + s);
  }
  assert.ok(worst < 0.1, 'worst off diagonal similarity ' + worst);
});

test('a sequence is a bundle of permuted quanta, and order matters', () => {
  const tok = new Tokenizer({ vocabSize: 300 });
  const a = tok.sequenceVector([1, 2, 3], 3), b = tok.sequenceVector([3, 2, 1], 3);
  assert.equal(S.sim(a, a), 1);
  assert.ok(S.sim(a, b) < 0.5, 'a reversed sequence must not be the same vector: sim ' + S.sim(a, b));
  const shared = tok.sequenceVector([9, 2, 3], 3);
  assert.ok(S.sim(a, shared) > S.sim(a, b), 'sharing the recent tokens must be closer than sharing none in order');
});

// ---------------------------------------------------------------- the graded arms
test('n gram beats the uniform null, and every arm is finite', () => {
  model();
  const b = EVAL.bitsPerByte;
  for (const [k, v] of Object.entries(b)) assert.ok(Number.isFinite(v) && v > 0, k + ' is ' + v);
  assert.ok(b.ngram < b.uniform, 'ngram ' + b.ngram + ' must beat uniform ' + b.uniform);
  assert.ok(b.unigram < b.uniform, 'unigram ' + b.unigram + ' must beat uniform ' + b.uniform);
  assert.ok(b.hv < b.uniform, 'hv ' + b.hv + ' must beat uniform ' + b.uniform);
  // the null is exactly log2(V) per token, which is what a model that learned nothing pays
  assert.ok(Math.abs(EVAL.bitsPerToken.uniform - Math.log2(EVAL.vocab)) < 1e-9, 'uniform is log2(V)');
});

test('the mixture is at most the n gram bits per byte plus 0.05 on held out', () => {
  model();
  const b = EVAL.bitsPerByte;
  assert.ok(b.mixture <= b.ngram + 0.05, 'mixture ' + b.mixture + ' against ngram ' + b.ngram + ' plus 0.05');
});

test('nothing chose anything on held out', () => {
  model();
  const w = MODEL.weights;
  assert.ok(Math.abs(w.ngram + w.hv + w.uni - 1) < 1e-9, 'weights must be a convex combination: ' + JSON.stringify(w));
  for (const v of Object.values(w)) assert.ok(v >= 0 && v <= 1, JSON.stringify(w));
  assert.ok(LEARNED.devStart < LEARNED.trainTokens, 'the dev slice comes out of train');
  assert.ok(Number.isFinite(LEARNED.devBits.ngram) && LEARNED.devBits.ngram > 0);
  // the whole train stream was still seen once: the dev slice is training text too
  assert.equal(MODEL.ngram.tokens, LEARNED.trainTokens);
});

test('model size and throughput are measured, not asserted', () => {
  model();
  const size = MODEL.sizeBytes();
  assert.equal(size.total, size.tokenizer + size.codebook + size.ngram + size.hv);
  assert.ok(size.codebook === MODEL.V * MODEL.tok.d, 'codebook is V times d');
  assert.ok(size.hv > 0 && MODEL.hv.acc.size > 0, 'the associative memory holds buckets');
  assert.ok(EVAL.tokensPerSecond > 100, 'tokens per second ' + EVAL.tokensPerSecond);
});

// ---------------------------------------------------------------- sampling
test('sampling is reproducible from its seed, and decodes to text', () => {
  model();
  const a = generate(MODEL, 'The cell ', { maxTokens: 24, temperature: 0.8, topK: 20, seed: 'test' });
  const b = generate(MODEL, 'The cell ', { maxTokens: 24, temperature: 0.8, topK: 20, seed: 'test' });
  const c = generate(MODEL, 'The cell ', { maxTokens: 24, temperature: 0.8, topK: 20, seed: 'other' });
  assert.deepEqual(a.ids, b.ids, 'same seed, same continuation');
  assert.notDeepEqual(a.ids, c.ids, 'a different seed must move');
  assert.equal(a.tokens, 24);
  assert.ok(a.full.startsWith('The cell '), JSON.stringify(a.full));
  // temperature 0 is greedy: all the mass on one token
  const p = MODEL.dist(MODEL.tok.encode(Buffer.from('The cell ')), 3);
  const greedy = shape(p, { temperature: 0 });
  assert.equal(greedy.reduce((x, y) => x + y, 0), 1);
  assert.equal(greedy.filter(x => x > 0).length, 1);
  // top k keeps exactly k tokens alive
  const k5 = shape(p, { temperature: 1, topK: 5 });
  assert.equal(k5.filter(x => x > 0).length, 5);
});

// ---------------------------------------------------------------- inside a Brain
test('the language region ticks inside a Brain and records prediction error', () => {
  model();
  registerMind('test', MODEL);
  try {
    const brain = new Brain({ name: 'mind-test', ledger: 'full' });
    const ids = installLanguage(brain, { model: 'test', prefix: 'lt' });
    assert.ok(brain.regions.has('language'), 'the region exists');
    for (const c of ['tokenizer', 'context', 'memory', 'decode']) assert.ok(brain.circuits.has('language/' + c), 'circuit ' + c);
    assert.equal(brain.connectome.size(), 4, 'four wires');

    const text = 'the cell is a persistent computational object with inputs and outputs';
    const r = feed(brain, ids, text);
    assert.ok(r.tokens > 0, 'tokens scored ' + r.tokens);
    assert.equal(r.tokens, MODEL.tok.encode(Buffer.from(text, 'utf8')).length, 'every token fed reaches the memory');
    assert.ok(r.ticks < (Buffer.byteLength(text) + 16) * 2, 'the pipeline drains instead of running out its budget: ticks ' + r.ticks);
    assert.ok(Number.isFinite(r.meanBits) && r.meanBits > 0, 'mean surprise ' + r.meanBits);
    assert.ok(r.meanBits < Math.log2(MODEL.V), 'the region must beat the null in bits: ' + r.meanBits + ' against ' + Math.log2(MODEL.V));

    const assoc = brain.cell(ids.assoc);
    assert.ok(Number.isFinite(assoc.stats.surprise) && assoc.stats.surprise > 0, 'cell.stats.surprise is written: ' + assoc.stats.surprise);
    assert.ok(assoc.memory.working.length > 0, 'the cell keeps what it got wrong');
    assert.equal(brain.stats.errors, 0, 'no cell threw: ' + JSON.stringify(brain.lastError));
    assert.ok(r.predictions.length > 0, 'predictions leave at the output port');
    for (const p of r.predictions) {
      assert.ok(p.pObserved > 0 && p.pObserved <= 1, 'probability ' + p.pObserved);
      assert.ok(Math.abs(p.bits + Math.log2(p.pObserved)) < 1e-9, 'bits is minus log2 of the probability');
    }
    assert.ok(brain.ledger.seq > 0, 'the ledger recorded the region');
  } finally { unregisterMind('test'); }
});

test('growth cannot rewire the language region, and the gate says so', () => {
  model();
  registerMind('seal', MODEL);
  try {
    const brain = new Brain({ name: 'mind-seal', ledger: 'off' });
    const ids = installLanguage(brain, { model: 'seal', prefix: 'ls' });
    const before = brain.connectome.size();
    // long enough for the co-activation tracker to cross its threshold many times over
    feed(brain, ids, 'the cell is a persistent computational object. '.repeat(6));
    brain.tick(40);
    assert.equal(brain.connectome.size(), before, 'no edge may be grown inside a hand wired pipeline');
    assert.ok(brain.gate.stats.rejected > 0, 'the gate refused the proposals rather than never seeing any: ' + JSON.stringify(brain.gate.stats));
    assert.equal(brain.stats.grown, 0, 'nothing grew');
    // and perception refuses input that did not come from outside
    const tok = brain.cell(ids.tokenize);
    const queued = tok.state.queue.length;
    tok.mailbox[0].push({ sig: { kind: 'event', data: { text: 'smuggled' }, t: 0 }, w: 1, e: 7, from: 3 });
    brain.tick(1);
    assert.equal(tok.state.queue.length, Math.max(0, queued - 1), 'an event arriving over an edge is not perception');
  } finally { unregisterMind('seal'); }
});

test('the model registry names models and refuses unknown ones', () => {
  assert.throws(() => getMind('nobody-registered-this'), /no model registered/);
  registerMind('tmp', model());
  assert.equal(getMind('tmp'), MODEL);
  assert.equal(unregisterMind('tmp'), true);
});

// ---------------------------------------------------------------- prose
test('no em-dashes anywhere in mind/, its bench, its test or its note', () => {
  const files = [
    ...readdirSync(path.join(ROOT, 'mind')).map(f => path.join(ROOT, 'mind', f)),
    path.join(ROOT, 'bench', 'mind.mjs'),
    path.join(ROOT, 'test', 'mind.test.mjs'),
    path.join(ROOT, 'notes', 'mind.md'),
  ];
  const bad = files.filter(f => readFileSync(f, 'utf8').includes(EM_DASH));
  assert.deepEqual(bad, [], 'em-dashes in: ' + bad.join(', '));
  assert.ok(files.length >= 8, 'files scanned ' + files.length);
});

// ---------------------------------------------------------------- the rules the survivors named
// Every test below was written against a mutant that lived through the suite as it stood
// (bench/mutants.mjs, the mind sweep), and each one names the mutant it kills. A survivor is
// a hole in the grading, not a compliment.

test('tokenizer: a merge stands for its pair IN ORDER, and a tie goes to the lower pair', () => {
  // mn01: packPair(a, b) reversed. The corpus makes "ab" the only frequent pair, so the
  // first merge is exactly the two bytes 'a','b' in that order, never "ba".
  const one = new Tokenizer({ vocabSize: 258, minCount: 2 });
  one.train(Buffer.from('ab'.repeat(40) + 'xyz' + 'ab'.repeat(40), 'utf8'));
  const [a, b, id] = one.merges[0];
  assert.equal(a, 'a'.charCodeAt(0), 'the left byte of the first merge');
  assert.equal(b, 'b'.charCodeAt(0), 'the right byte of the first merge');
  assert.equal(id, 256, 'the first learned id sits straight above the byte range');
  assert.equal(Buffer.from(one.vocab[256]).toString('utf8'), 'ab', 'vocab[256] is the pair in reading order');

  // mn02: the tie break. In 'abcd' x 10 three pairs tie at 10 occurrences: "ab", "bc", "cd".
  // The rule is the LOWER packed key, which is "ab". Nothing but the rule decides it, so a
  // reversed comparison picks "cd" and this assertion is the only thing that says so.
  const tie = new Tokenizer({ vocabSize: 257, minCount: 2 });
  tie.train(Buffer.from('abcd'.repeat(10), 'utf8'));
  const counts = new Map();
  const seq = [...Buffer.from('abcd'.repeat(10), 'utf8')];
  for (let i = 0; i + 1 < seq.length; i++) {
    const k = seq[i] * 2 ** 21 + seq[i + 1];
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const top = Math.max(...counts.values());
  const tied = [...counts.entries()].filter(([, c]) => c === top).map(([k]) => k).sort((x, y) => x - y);
  assert.ok(tied.length >= 2, 'the corpus must really tie: tied pairs ' + tied.length);
  const won = tie.merges[0][0] * 2 ** 21 + tie.merges[0][1];
  assert.equal(won, tied[0], 'the tie goes to the LOWEST packed pair key');
  assert.equal(Buffer.from(tie.vocab[256]).toString('utf8'), 'ab');
  console.log('merge order  first merge "ab" id 256; ' + tied.length + ' pairs tied at ' + top
    + ' occurrences and the lowest key ' + tied[0] + ' won');
});

test('tokenizer: the merge floor is a floor, so a pair AT minCount is merged', () => {
  // mn03: `bestCount < this.minCount` turned into `<=`. "qz" occurs exactly 3 times.
  const corpus = Buffer.from('qz' + 'mnopr' + 'qz' + 'stuvw' + 'qz', 'utf8');
  const at = new Tokenizer({ vocabSize: 300, minCount: 3 });
  const atR = at.train(corpus);
  assert.equal(atR.merges, 1, 'a pair seen exactly minCount times is merged');
  assert.equal(Buffer.from(at.vocab[256]).toString('utf8'), 'qz');
  const over = new Tokenizer({ vocabSize: 300, minCount: 4 });
  assert.equal(over.train(corpus).merges, 0, 'a pair one short of the floor is refused');
  console.log('merge floor  "qz" seen 3 times: minCount 3 merges it, minCount 4 refuses it');
});

test('n gram: the context of a prediction never contains the token being predicted', () => {
  // mn09, the leak. Two id arrays that differ ONLY at the position being predicted must
  // produce the IDENTICAL context key at every order, or the model is reading its answer.
  const a = [7, 8, 9, 11, 12];
  const b = [7, 8, 9, 99, 12];
  for (let back = 1; back <= 4; back++) {
    assert.equal(NgramBackoff.key(a, 3, back), NgramBackoff.key(b, 3, back),
      'order ' + back + ': the key changed when only ids[3] changed, so the context leaks the target');
  }
  // and the same thing end to end: two contexts identical before i, different at i, share a
  // table entry, so the counts for the two targets live side by side under one key.
  const n = new NgramBackoff(128, { order: 3, alpha: 1 });
  for (let r = 0; r < 20; r++) { n.observe([1, 2, 3, 11], 3); n.observe([1, 2, 3, 22], 3); }
  const key = NgramBackoff.key([1, 2, 3, 11], 3, 2);
  const entry = n.tables[2].get(key);
  assert.ok(entry, 'the order 3 table has an entry under the shared context "' + key + '"');
  assert.equal(entry.counts.get(11), 20);
  assert.equal(entry.counts.get(22), 20, 'both targets are counted under ONE context key');
  assert.equal(entry.total, 40);
  console.log('context      ids[i] never enters the key; one context key holds both targets 20/20, total 40');
});

test('n gram: the backoff ladder is climbed, and the higher orders are worth real bits', () => {
  // mn10: probAt's default maxOrder cut to 1. Nothing in the suite compared the default
  // against an explicit order, so every probability could quietly be the unigram.
  const m = frozenModel();
  const ids = frozenHeldIds();
  const bits = (p) => -Math.log2(Math.max(p, 1e-12));
  let dflt = 0, one = 0, full = 0;
  for (let i = 0; i < ids.length; i++) {
    dflt += bits(m.ngram.probAt(ids, i));
    one += bits(m.ngram.probAt(ids, i, 1));
    full += bits(m.ngram.probAt(ids, i, m.ngram.order));
  }
  const n = ids.length;
  const bptD = dflt / n, bpt1 = one / n, bptF = full / n;
  assert.equal(bptD, bptF, 'the default maxOrder IS the declared order');
  // The bar was a full bit until 2026-09-17, when the docs grew (NUMBERS.md at 1683 rows of
  // digits, PORTFOLIO.md, ARCHITECTURE.md sections 12 and 13) and the measured gap on the
  // held-out slice was 0.9368 (7.1428 against 6.2060). mn10 gives exactly 0, so half a bit
  // still kills it, and the bar no longer moves with the corpus.
  assert.ok(bptD < bpt1 - 0.5, 'the ladder must be worth more than half a bit per token: default '
    + bptD.toFixed(4) + ' against order 1 ' + bpt1.toFixed(4));
  assert.ok(m.ngram.order >= 3, 'order ' + m.ngram.order);
  console.log('backoff      ' + n + ' held out tokens: order 1 ' + bpt1.toFixed(4) + ', default ('
    + m.ngram.order + ') ' + bptD.toFixed(4) + ' bits per token, gap ' + (bpt1 - bptD).toFixed(4));
});

test('hv memory: an address is exactly bits wide, and a similarity of zero is a one', () => {
  // mn13: the address shifted two bits per probe, so it runs past its own capacity.
  // mn12: the >= 0 boundary flipped to > 0, which only a sim of EXACTLY zero can see.
  const m = model();
  const hv = m.hv;
  const ids = heldIds();
  const cap = 2 ** hv.bits;
  let maxAddr = -1, n = 0;
  for (let i = hv.context; i < Math.min(ids.length, 800); i++) {
    const addr = hv.address(m.tok.sequenceVector(ids, i, hv.context));
    assert.ok(Number.isInteger(addr) && addr >= 0 && addr < cap, 'address ' + addr + ' is outside [0, ' + cap + ')');
    if (addr > maxAddr) maxAddr = addr;
    n++;
  }
  assert.ok(maxAddr > cap / 2, 'the addresses must actually spread: max ' + maxAddr + ' of ' + cap);

  // A vector exactly orthogonal to the first probe: the probe with every other entry
  // flipped. Half agree and half disagree, so the similarity is exactly zero, and the rule
  // says a zero is a one bit.
  const p0 = hv.probes[0];
  const v = Int8Array.from(p0);
  for (let i = 0; i < v.length; i += 2) v[i] = -v[i];
  assert.equal(S.sim(p0, v), 0, 'the probe vector must be exactly orthogonal');
  assert.equal((hv.address(v) >> (hv.bits - 1)) & 1, 1, 'a similarity of exactly zero is a ONE bit');
  console.log('addressing   ' + n + ' contexts, max address ' + maxAddr + ' inside 2^' + hv.bits + ' = ' + cap
    + '; sim exactly 0 against probe 0 gives the top bit 1');
});

test('hv memory: a bucket is a superposition, so two tokens at one address are both recalled', () => {
  // mn14: the accumulator assigned instead of added, which is last write wins and is not a
  // memory at all. Nothing compared the SECOND best token of a bucket, so nobody noticed.
  const m = model();
  const ids = heldIds();
  const ctx = m.tok.sequenceVector(ids, 10, 2);
  const h = new HvAssociative(m.tok, { bits: 6, context: 2, seed: 'test:mind:bundle' });
  h.observe(ctx, 5);
  h.observe(ctx, 9);
  assert.equal(h.hits.get(h.address(ctx)), 2, 'both writes landed in one bucket');
  const s = h.scores(h.address(ctx));
  let best = -Infinity;
  for (let t = 0; t < s.length; t++) if (t !== 5 && t !== 9) best = Math.max(best, s[t]);
  assert.ok(s[5] > 5, 'the FIRST token written is still recalled: ' + s[5].toFixed(3));
  assert.ok(s[9] > 5, 'the second token written is recalled: ' + s[9].toFixed(3));
  assert.ok(best < Math.min(s[5], s[9]) / 2, 'and nothing else is close: best other ' + best.toFixed(3));
  console.log('superposition  one bucket, two tokens: score(5) ' + s[5].toFixed(3) + ', score(9) '
    + s[9].toFixed(3) + ', best other ' + best.toFixed(3));
});

test('hv memory: the floored distribution is still a distribution, and the floor is a floor', () => {
  // mn16: the floor added without making room for it, so the mass sums past one.
  // mn15: the floor dropped, so the mass sums to 1 - floor and an unseen token loses its
  // background share. Both are invisible unless something adds the probabilities up.
  const m = model();
  const hv = m.hv, bg = m.background();
  const ids = heldIds();
  const seen = new Set();
  let worstSum = 0, worstRatio = Infinity, buckets = 0;
  for (let i = hv.context; i < Math.min(ids.length, 800); i++) {
    const v = m.tok.sequenceVector(ids, i, hv.context);
    const b = hv.address(v);
    if (seen.has(b)) continue;
    seen.add(b); buckets++;
    const d = hv.dist(v, bg);
    let sum = 0;
    for (let t = 0; t < d.length; t++) sum += d[t];
    worstSum = Math.max(worstSum, Math.abs(sum - 1));
    for (let t = 0; t < d.length; t++) if (bg[t] > 0) worstRatio = Math.min(worstRatio, d[t] / bg[t]);
  }
  assert.ok(buckets > 20, 'buckets checked ' + buckets);
  assert.ok(worstSum < 1e-5, 'every bucket distribution must sum to one: worst |sum - 1| ' + worstSum);
  assert.ok(worstRatio >= hv.floor * 0.9, 'the floor must really floor: worst dist/background ratio '
    + worstRatio.toFixed(6) + ' against floor ' + hv.floor);
  console.log('floor        ' + buckets + ' buckets, worst |sum - 1| ' + worstSum.toExponential(2)
    + ', worst dist/background ' + worstRatio.toFixed(6) + ' >= floor ' + hv.floor);
});
