// test/solved.test.mjs: Board 15, item ns (author: board 15 builder). The solved-program memory
// (reason/solved.mjs) and the solved region of act/prompt.mjs ask(), with no Ollama anywhere: the
// only model is a replacement math region function and a mock cell, and every file is written
// under a temp directory.
//   1. number abstraction round-trips (digits, thousands commas, decimals, number words, hyphens)
//   2. the one-pass scanner gives the reference keys and the regex's numbers, on crafted texts and
//      on every GSM8K question (plain, with the ALONE_PROMPT instruction, and shouted)
//   3. a planted template answers a RE-NUMBERED question through ask() in under 1 ms with
//      provenance solved, and the same question exactly
//   4. a template that fails its verification is skipped and the ask falls through: a fixed number
//      changed (constraint), an integer answer turned fractional (shape), a division by zero
//      (nonfinite), two templates that disagree
//   5. a program that is not straight line answers through the sandbox
//   6. learning: a model+exact region answer becomes a template (and refusals), through ask()
//   7. ANSWER_PROVENANCE holds solved right after direct, and the region is off by default
//   8. a templates file saves and loads
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { attachMemory } from '../memory/index.mjs';
import { ANSWER_PROVENANCE, ask } from '../act/prompt.mjs';
import {
  KEY, SolvedMemory, abstractNumbers, hashKey, keyOf, makeTemplate, normText, renderForm, scannedValues, solvedFor,
} from '../reason/solved.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-solved-'));
after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const ALONE = '\n\nAnswer with the final number.';
const JANET = "Janet's ducks lay 16 eggs per day. She eats three for breakfast every morning and bakes muffins for her friends every day with four. She sells the remainder at the farmers' market daily for $2 per fresh duck egg. How much in dollars does she make every day at the farmers' market?";
const JANET_PROGRAM = 'function solve() {\n  const eggs = 16; // per day\n  const eaten = 3;\n  const baked = 4;\n  const price = 2;\n  return (eggs - eaten - baked) * price;\n}';
// the same question with other numbers: 20 eggs, five eaten, six baked, $3
const JANET_2 = "Janet's ducks lay 20 eggs per day. She eats five for breakfast every morning and bakes muffins for her friends every day with six. She sells the remainder at the farmers' market daily for $3 per fresh duck egg. How much in dollars does she make every day at the farmers' market?";

function newBrain(name) {
  const brain = new Brain({ name, ledger: 'runs', pruneEvery: 0 });
  attachMemory(brain, { name });
  return brain;
}
// ask() with every other path that could answer turned off, and no model anywhere
const QUIET = { provider: 'null', route: 'direct', regions: false, knowledge: false, direct: false, spawn: false };

async function planted(question, program, answer) {
  const made = await makeTemplate({ question, program, answer, source: { test: 'test/solved.test.mjs' } });
  assert.equal(made.ok, true, made.reason);
  return made.template;
}

test('1. number abstraction round-trips', () => {
  const texts = [
    normText(JANET),
    'a shop sold 1,234 pens at $2.50 each and 12,345.75 grams of tea; twenty-one of them were blue.',
    'ninety-nine bottles, seventeen cans, zero cups, 0.05 litres and 007 agents.',
    'no numbers here at all?',
    'twenty-seventeen is not a number word but twenty is; someone has one-third.',
  ];
  for (const t of texts) {
    const abs = abstractNumbers(t);
    assert.equal(renderForm(abs, abs.values), t, 'renders back: ' + t);
    const doubled = abs.values.map((v) => v * 2);
    const again = renderForm(abs, doubled);
    if (again === null) continue; // a word slot past ninety-nine cannot be spelled
    const abs2 = abstractNumbers(again);
    assert.equal(abs2.form, abs.form, 'a re-numbered text keeps its slot form: ' + again);
    assert.deepEqual(abs2.values, doubled);
  }
  const j = abstractNumbers(normText(JANET));
  assert.deepEqual(j.values, [16, 3, 4, 2]);
  assert.deepEqual(j.styles, ['d0', 'w', 'w', 'd0']);
  assert.equal(normText(JANET + ALONE), normText(JANET), 'the ALONE_PROMPT instruction is not part of the question');
});

function sameKeys(raw) {
  const norm = normText(raw);
  const ref = hashKey(norm);
  const n = keyOf(raw);
  assert.deepEqual([...KEY], [...ref], 'keys of ' + JSON.stringify(raw.slice(0, 80)));
  assert.deepEqual(scannedValues(n), abstractNumbers(norm).values, 'numbers of ' + JSON.stringify(raw.slice(0, 80)));
}

test('2. the one-pass scanner gives the reference keys and numbers', () => {
  const crafted = [
    JANET, JANET + ALONE, '   ' + JANET.toUpperCase() + '\t\n answer   WITH the final\r\nnumber.  ',
    '1,2345 and 12,34 and 1234,567 and 3. and .5 and 3.5.2', 'Twenty-One twenty-seventeen twentyone twenty-one5 _one 2one one2 ONE',
    'café costs 3 euros ’twelve’ “four”', 'reanswer with the final number.', 'answer with the final number.', '',
    '99999999999999999999.5 and 0.50 and 007', 'sixty-ten eighty-eight forty-',
  ];
  for (const raw of crafted) sameKeys(raw);
  // a text key and a form key never compare equal (the low bit of the verifying hash is the kind)
  keyOf(JANET);
  assert.equal(KEY[2] & 1, 0);
  assert.equal(KEY[5] & 1, 1);
  // the same question with other numbers: same form key, other text key
  keyOf(JANET); const k1 = [...KEY];
  keyOf(JANET_2); const k2 = [...KEY];
  assert.deepEqual(k2.slice(3), k1.slice(3));
  assert.notDeepEqual(k2.slice(0, 3), k1.slice(0, 3));
  // every GSM8K question, when the public set is on disk
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bench', 'fixtures', 'public', 'gsm8k', 'test.jsonl');
  if (!fs.existsSync(file)) return;
  let n = 0;
  for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!l.trim()) continue;
    const q = JSON.parse(l).question;
    sameKeys(q); sameKeys(q + ALONE); sameKeys('  ' + q.toUpperCase() + ALONE.toUpperCase());
    n++;
  }
  assert.ok(n > 1000, 'read ' + n + ' GSM8K questions');
});

test('3. a planted template answers a re-numbered question in under 1 ms with provenance solved', async () => {
  const mem = new SolvedMemory();
  const t = await planted(JANET, JANET_PROGRAM, 18);
  assert.equal(t.fast, true, t.fastWhy);
  assert.equal(mem.add(t), true);
  const brain = newBrain('solved-3');
  // the same question, exactly
  const same = await ask(brain, JANET + ALONE, { ...QUIET, solved: mem });
  assert.equal(same.provenance.answer, 'solved');
  assert.equal(same.provenance.solved.via, 'text');
  assert.equal(same.text.split('\n').pop(), '18');
  // re-numbered: (20 - 5 - 6) * 3 = 27
  const times = [];
  let a = null;
  for (let i = 0; i < 101; i++) {
    const t0 = process.hrtime.bigint();
    a = await ask(brain, JANET_2 + ALONE, { ...QUIET, solved: mem });
    times.push(Number(process.hrtime.bigint() - t0));
  }
  assert.equal(a.provenance.answer, 'solved');
  assert.equal(a.from, 'solved');
  assert.equal(a.provenance.solved.via, 'form');
  assert.equal(a.provenance.solved.run, 'compiled');
  assert.equal(a.provenance.llm.ok, false);
  assert.equal(a.text.split('\n').pop(), '27');
  assert.deepEqual(a.solved.values, [20, 5, 6, 3]);
  times.sort((x, y) => x - y);
  const median = times[50];
  assert.ok(median < 1e6, 'the median ask took ' + median + ' ns');
  assert.ok(a.provenance.solved.ns < 1e6, 'the match took ' + a.provenance.solved.ns + ' ns');
});

test('4. a template that fails its verification is skipped and the ask falls through', async () => {
  const brain = newBrain('solved-4');
  // constraint: the program folded the 50% into 0.5, so the 50 is FIXED
  const q = 'A coat costs 80 dollars and is sold at 50% off. How many dollars does it cost now?';
  const mem = new SolvedMemory();
  mem.add(await planted(q, 'function solve() { const price = 80; return price * 0.5; }', 40));
  assert.equal(mem.match('A coat costs 60 dollars and is sold at 50% off. How many dollars does it cost now?').answer, '30');
  const off = 'A coat costs 80 dollars and is sold at 25% off. How many dollars does it cost now?';
  assert.equal(mem.match(off).hit, false);
  assert.equal(mem.stats.skipped.constraint, 1);
  const fell = await ask(brain, off, { ...QUIET, solved: mem });
  assert.notEqual(fell.provenance.answer, 'solved', 'the ask fell through to the next region');
  assert.equal(mem.stats.skipped.constraint, 2);

  // shape: 12 / 4 = 3 is an integer; 13 / 4 is not
  const q2 = 'There are 12 apples shared by 4 kids. How many apples does each kid get?';
  const m2 = new SolvedMemory();
  m2.add(await planted(q2, 'function solve() { return 12 / 4; }', 3));
  const r2 = m2.match('There are 13 apples shared by 4 kids. How many apples does each kid get?');
  assert.equal(r2.hit, false);
  assert.equal(r2.skipped.shape, 1);
  assert.equal(m2.match('There are 20 apples shared by 4 kids. How many apples does each kid get?').answer, '5');
  // nonfinite: a division by zero
  const r3 = m2.match('There are 12 apples shared by 0 kids. How many apples does each kid get?');
  assert.equal(r3.hit, false);
  assert.equal(r3.skipped.nonfinite, 1);
  const fell2 = await ask(brain, 'There are 12 apples shared by 0 kids. How many apples does each kid get?', { ...QUIET, solved: m2 });
  assert.notEqual(fell2.provenance.answer, 'solved');

  // disagree: two programs of one form that agree on 4 and 2 (4 + 2 = 6 = 4 * 2 - 2) and not on 5 and 3
  const q4 = 'Tom has 4 marbles and gets 2 more. How many marbles does he have?';
  const m4 = new SolvedMemory();
  m4.add(await planted(q4, 'function solve() { return 4 + 2; }', 6));
  m4.add(await planted(q4, 'function solve() { return 4 * 2 - 2; }', 6));
  const r4 = m4.match('Tom has 5 marbles and gets 3 more. How many marbles does he have?');
  assert.equal(r4.hit, false);
  assert.equal(r4.why, 'templates disagree');
  // a wording no template holds is a plain miss
  assert.equal(m4.match('Tom has 5 marbles and gets 3 more of them. How many marbles does he have?').why, 'no template');
});

test('5. a program that is not straight line answers through the sandbox', async () => {
  const q = 'A ladder has 5 steps and each step is 2 feet apart. How many feet tall is the ladder?';
  const t = await planted(q, 'function solve() { let h = 0; for (let i = 0; i < 5; i++) h += 2; return h; }', 10);
  assert.equal(t.fast, false);
  const mem = new SolvedMemory();
  mem.add(t);
  const m = mem.match('A ladder has 7 steps and each step is 3 feet apart. How many feet tall is the ladder?');
  assert.equal(m.hit, false);
  assert.ok(m.pending && m.pending.length === 1);
  const r = await mem.resolve(m);
  assert.equal(r.hit, true);
  assert.equal(r.run, 'sandbox');
  assert.equal(r.answer, '21');
  const a = await ask(newBrain('solved-5'), 'A ladder has 4 steps and each step is 3 feet apart. How many feet tall is the ladder?', { ...QUIET, solved: mem });
  assert.equal(a.provenance.answer, 'solved');
  assert.equal(a.provenance.solved.run, 'sandbox');
  assert.equal(a.text.split('\n').pop(), '12');
});

test('6. a verified model+exact answer becomes a template (and what is refused)', async () => {
  const file = path.join(TMP, 'learned.jsonl');
  const mem = new SolvedMemory({ file, learn: true });
  const region = (over = {}) => ({ provenance: 'model+exact', answer: '18', program: JANET_PROGRAM, vote: { count: 3, of: 5, tie: false }, verified: null, ...over });
  assert.equal((await mem.learnFrom(JANET, region({ provenance: 'model' }))).reason, 'not a model+exact answer');
  assert.equal((await mem.learnFrom(JANET, region({ vote: { count: 2, of: 5 } }))).kept, false);
  assert.equal((await mem.learnFrom(JANET, region({ vote: { count: 2, tie: true } }))).reason, 'a tied vote');
  assert.equal((await mem.learnFrom(JANET, region({ verified: { verdict: 'reject' } }))).reason, 'the checker rejected it');
  assert.equal((await mem.learnFrom(JANET, region({ answer: '19' }))).kept, false, 'the sandbox must reproduce the answer');
  assert.equal(mem.size, 0);

  // through ask(): the math region (a replacement function, with a mock cell) answers once, the
  // memory learns, and the re-numbered question never reaches the region again
  let regionCalls = 0;
  const math = async () => {
    regionCalls++;
    return { provenance: 'model+exact', answer: 18, program: JANET_PROGRAM, samples: [{ stage: 'exec', ok: true }], vote: { key: '18', count: 3, valid: 3, of: 3, tie: false }, calls: 3 };
  };
  const opts = { solved: mem, regions: { math, code: false }, cell: async () => ({ ok: true, text: '' }), knowledge: false, direct: false, spawn: false, route: 'direct' };
  const brain = newBrain('solved-6');
  const first = await ask(brain, JANET + ALONE, opts);
  assert.equal(first.provenance.answer, 'model+exact');
  assert.equal(regionCalls, 1);
  assert.equal(mem.size, 1);
  assert.equal(mem.stats.learned, 1);
  assert.equal(fs.readFileSync(file, 'utf8').trim().split('\n').length, 1, 'the template was appended to its file');
  const second = await ask(brain, JANET_2 + ALONE, opts);
  assert.equal(second.provenance.answer, 'solved');
  assert.equal(second.text.split('\n').pop(), '27');
  assert.equal(regionCalls, 1, 'the region was not asked again');
  // a memory that does not learn keeps nothing
  const still = new SolvedMemory();
  await ask(newBrain('solved-6b'), JANET + ALONE, { ...opts, solved: still });
  assert.equal(still.size, 0);
});

test('7. ANSWER_PROVENANCE holds solved right after direct; the region is off by default', () => {
  assert.ok(ANSWER_PROVENANCE.includes('solved'));
  assert.equal(ANSWER_PROVENANCE.indexOf('solved'), ANSWER_PROVENANCE.indexOf('direct') + 1);
  for (const p of ['direct', 'exact', 'memory', 'model+exact', 'model+memory', 'model']) assert.ok(ANSWER_PROVENANCE.includes(p), p);
  const saved = process.env.BRAIN_SOLVED;
  delete process.env.BRAIN_SOLVED;
  try {
    assert.equal(solvedFor({}), null);
    assert.equal(solvedFor({ solved: false }), null);
    const mem = new SolvedMemory();
    assert.equal(solvedFor({ solved: mem }), mem);
  } finally { if (saved !== undefined) process.env.BRAIN_SOLVED = saved; }
});

test('8. a templates file saves and loads', async () => {
  const mem = new SolvedMemory();
  mem.add(await planted(JANET, JANET_PROGRAM, 18));
  const file = path.join(TMP, 'saved.jsonl');
  assert.equal(mem.save(file).templates, 1);
  const back = SolvedMemory.load(file);
  assert.equal(back.size, 1);
  const r = back.match(JANET_2);
  assert.equal(r.hit, true);
  assert.equal(r.answer, '27');
  assert.equal(SolvedMemory.load(path.join(TMP, 'missing.jsonl')).size, 0);
});
