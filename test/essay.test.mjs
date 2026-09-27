// test/essay.test.mjs: the essay bar's judge, rubric-v1, its arms and its split (board 26, item essay-bar).
// Author: board 26 builder.
//
// The judge is graded on every kind of text it will meet, not on one: a planted essay that meets every
// rule, the planted template (the control), the prompt echoed (the null arm), the organism's memory miss
// (the model off arm), an empty text, one line texts, mutations of the planted essay (a fact removed, a
// sentence repeated, the paragraphs merged) and an over long text. Nothing here opens a socket: the one
// ask() below runs with provider 'null'.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  judge, unmet, RUBRIC, WEIGHT_TOTAL, JUDGE, LENGTH_BAND, normalize, usesFact, paragraphsOf, sentencesOf,
  templateEssay, echoEssay, promptText, splitIds, loadPrompts, planArms, barFrom, args, run, ARMS, CONTROL,
} from '../bench/essay.mjs';

const SET = loadPrompts();
const byId = (id) => SET.prompts.find((p) => p.id === id);
const VACCINES = byId('essay.vaccines');

// A planted essay for a DEVELOPMENT prompt, written by hand to meet every rule of rubric-v1.
const PLANTED = [
  'Vaccination is the greatest achievement of public health. Vaccination has prevented more illness than any drug, any hospital or any surgeon, because vaccination stops disease before it starts. The case rests on the history of vaccination and on the way vaccination works in the body.',
  'The history of vaccination begins with smallpox. Edward Jenner tested a smallpox vaccine in 1796, using material from cowpox to protect a boy from the far deadlier disease. Smallpox had killed and scarred people for thousands of years, and no cure for smallpox existed. Over the next two centuries smallpox vaccination spread from country to country, and the World Health Organization declared smallpox eradicated in 1980. Smallpox is the only human disease that has been wiped out completely, and vaccination is the reason.',
  'Polio tells the same story in a single lifetime. Polio paralysed children every summer in the first half of the twentieth century, and parents kept children away from pools in fear of polio. Jonas Salk developed an injected polio vaccine in the 1950s, and polio cases fell quickly wherever the vaccine was given. Today polio survives in only a few places, and those places are the ones the vaccine has not yet reached.',
  'The reason vaccination works so well lies in the body itself. Vaccines train the immune system to recognise a pathogen, so the body is ready before the real infection arrives. That readiness also protects others, because a person who cannot catch a disease cannot pass that disease on. Herd immunity protects people who cannot be vaccinated, such as newborn babies and patients whose immune system is weak. In this way the vaccination of one person becomes a shield for a whole community, and the community in turn shields the person.',
  'Medicine offers many cures, but a cure comes after the suffering has begun. Vaccination prevents the suffering, which is why vaccination remains the greatest achievement of public health.',
].join('\n\n');

test('rubric-v1 is named and prints seven rules whose weights sum to 100', () => {
  assert.equal(JUDGE, 'rubric-v1');
  assert.deepEqual(RUBRIC.map((r) => r.id), ['thesis', 'paragraphs', 'facts', 'noRepeat', 'length', 'closing', 'coherence']);
  assert.equal(WEIGHT_TOTAL, 100);
  for (const r of RUBRIC) {
    assert.ok(r.weight > 0, r.id + ' has a weight');
    assert.ok(typeof r.rule === 'string' && r.rule.length > 20, r.id + ' says what it asks');
  }
});

test('the planted essay that meets every rule scores 100, on a development prompt', () => {
  assert.equal(VACCINES.split, 'development', 'the planted essay is written for a development prompt, never a held out one');
  const j = judge(PLANTED, VACCINES);
  console.log('planted essay: ' + j.score + ', words ' + j.stats.words + ', paragraphs ' + j.stats.paragraphs + ', coherence share ' + j.rules.coherence.share);
  assert.deepEqual(unmet(j), [], 'every rule met: ' + JSON.stringify(j.rules));
  assert.equal(j.score, 100);
});

test('the planted template (the control) scores below 100 by the rules a fixed skeleton cannot meet: noRepeat and length', () => {
  const j = judge(templateEssay(VACCINES), VACCINES);
  console.log('planted template: ' + j.score + ', unmet ' + unmet(j).join(', ') + ', points ' + JSON.stringify(Object.fromEntries(RUBRIC.map((r) => [r.id, j.rules[r.id].points]))));
  assert.ok(j.score < 100);
  assert.equal(j.rules.noRepeat.fraction, 0, 'the boilerplate sentence repeats');
  assert.ok(j.rules.noRepeat.repeated > 0);
  assert.ok(j.rules.length.fraction < 1 && j.stats.words < LENGTH_BAND.min, 'the skeleton is shorter than the band');
  // and it games every rule a skeleton CAN meet, on every one of the forty prompts: that is what makes it the control
  for (const p of SET.prompts) {
    const t = judge(templateEssay(p), p);
    assert.ok(t.score < 100, p.id);
    assert.equal(t.rules.noRepeat.fraction, 0, p.id + ' noRepeat');
    assert.ok(t.rules.length.fraction < 1, p.id + ' length');
    for (const id of ['thesis', 'paragraphs', 'facts', 'closing']) assert.equal(t.rules[id].fraction, 1, p.id + ' ' + id + ' is gamed by the skeleton');
  }
});

test('an empty text scores 0, and so does whitespace: no rule is true of nothing', () => {
  for (const t of ['', '   ', '\n\n\n', '.  !  ?']) {
    const j = judge(t, VACCINES);
    assert.equal(j.score, 0, JSON.stringify(t));
    for (const r of RUBRIC) assert.equal(j.rules[r.id].points, 0, JSON.stringify(t) + ' ' + r.id);
  }
  assert.equal(judge(null, VACCINES).score, 0);
});

test('vacuous rules earn nothing: one sentence gets no noRepeat and no coherence; one paragraph gets no closing', () => {
  const one = judge('Vaccination is the greatest achievement of public health.', VACCINES);
  assert.equal(one.rules.noRepeat.points, 0);
  assert.equal(one.rules.coherence.points, 0);
  assert.equal(one.rules.thesis.points, 20, 'the one sentence does state the stance');
  assert.equal(one.rules.closing.points, 0, 'a first paragraph is not also a closing one');
  const merged = judge(PLANTED.replace(/\n\n/g, ' '), VACCINES);
  assert.equal(merged.stats.paragraphs, 1);
  assert.equal(merged.rules.closing.points, 0);
  assert.equal(merged.rules.paragraphs.points, 2.5);
  assert.ok(merged.score < 100);
});

test('facts: a removed fact costs exactly its share, a fact never matches inside a word, and every fact matches its own text', () => {
  const fact = VACCINES.facts[0];
  assert.ok(PLANTED.includes(fact));
  const j = judge(PLANTED.replace(fact, 'Edward Jenner ran a test'), VACCINES);
  assert.equal(j.rules.facts.used, VACCINES.facts.length - 1);
  assert.deepEqual(j.rules.facts.missing, [fact]);
  assert.equal(j.score, 100 - 25 / VACCINES.facts.length);
  assert.equal(usesFact(normalize('a concatenated word'), 'cat'), false);
  assert.equal(usesFact(normalize('The Cat, sat.'), 'the cat sat'), true);
  for (const p of SET.prompts) for (const f of p.facts) assert.ok(usesFact(normalize('So: ' + f + '!'), f), p.id + ': ' + f);
});

test('a repeated sentence zeroes noRepeat, and an over long text is paid by the band', () => {
  const rep = judge(PLANTED + '\n\n' + 'Polio tells the same story in a single lifetime.', VACCINES);
  assert.equal(rep.rules.noRepeat.points, 0);
  assert.equal(rep.rules.noRepeat.repeated, 1);
  const long = judge(PLANTED + '\n\n' + Array.from({ length: 1500 }, (_, i) => 'w' + i).join(' ') + '.', VACCINES);
  assert.ok(long.stats.words > LENGTH_BAND.max);
  assert.equal(long.rules.length.fraction, Math.round((LENGTH_BAND.max / long.stats.words) * 10000) / 10000);
});

test('the null arm (the prompt echoed) is one paragraph with no close, and it collects the facts it copies', () => {
  const j = judge(echoEssay(VACCINES), VACCINES);
  console.log('prompt echoed: ' + j.score + ', unmet ' + unmet(j).join(', '));
  assert.equal(echoEssay(VACCINES), promptText(VACCINES));
  assert.equal(paragraphsOf(echoEssay(VACCINES)).length, 1);
  assert.equal(j.rules.closing.points, 0);
  assert.equal(j.rules.facts.fraction, 1, 'the echo carries every fact: the facts rule is paid by copying');
  assert.ok(j.score < 100);
});

test('the organism with the model off (provider null) answers with its memory miss; the judge scores that text, below the control', async () => {
  const { Brain } = await import('../core/brain.mjs');
  const { attachMemory } = await import('../memory/index.mjs');
  const { ask } = await import('../act/prompt.mjs');
  const brain = new Brain({ name: 'essay-test', ledger: 'full', pruneEvery: 0 });
  attachMemory(brain, { name: 'essay-test' });
  const a = await ask(brain, promptText(VACCINES), { provider: 'null', knowledge: false });
  assert.equal(a.from, 'memory');
  assert.equal(a.provenance.memoryHits, 0);
  assert.equal(a.provenance.llm.provider, 'null');
  assert.match(a.text, /^nothing in memory matches/m);
  const j = judge(a.text, VACCINES);
  const t = judge(templateEssay(VACCINES), VACCINES);
  console.log('memory miss: ' + j.score + ', unmet ' + unmet(j).join(', ') + '; thesis points ' + j.rules.thesis.points + ' (the keyword line holds the stance words)');
  assert.equal(j.rules.facts.points, 0, 'the memory miss uses no fact');
  assert.ok(j.score < t.score, 'the abstention scores below the control');
});

test('the split: 20 development, 20 held out, disjoint, unique ids, and the seed reproduces it', () => {
  const ids = SET.prompts.map((p) => p.id);
  assert.equal(ids.length, 40);
  assert.equal(new Set(ids).size, 40);
  const dev = SET.prompts.filter((p) => p.split === 'development').map((p) => p.id);
  const held = SET.prompts.filter((p) => p.split === 'heldOut').map((p) => p.id);
  assert.equal(dev.length, 20);
  assert.equal(held.length, 20);
  assert.equal(dev.length + held.length, 40, 'every prompt is in one half');
  for (const id of dev) assert.ok(!held.includes(id), id + ' is in both halves');
  const again = splitIds(ids, SET.splitSeed);
  assert.deepEqual(again.development, [...dev].sort());
  assert.deepEqual(again.heldOut, [...held].sort());
  assert.notDeepEqual(splitIds(ids, 'another-seed').heldOut, again.heldOut, 'the seed decides the split');
});

test('every prompt has a topic, a stance and 4 to 6 distinct facts, all ASCII', () => {
  const counts = new Set();
  for (const p of SET.prompts) {
    assert.ok(p.topic && p.stance, p.id);
    assert.ok(p.facts.length >= 4 && p.facts.length <= 6, p.id + ' has ' + p.facts.length + ' facts');
    assert.equal(new Set(p.facts.map(normalize)).size, p.facts.length, p.id + ' facts are distinct');
    assert.ok(/^[\x20-\x7e]*$/.test(JSON.stringify(p)), p.id + ' is ASCII');
    counts.add(p.facts.length);
  }
  assert.ok(counts.size >= 2, 'more than one fact count is in the set');
});

test('a run without the organism grades only held out ids, never writes the bar, and a deterministic arm has no seed spread', async () => {
  const v = await run({ arms: 'template,null', seeds: 3, write: false, quiet: true });
  const held = new Set(SET.prompts.filter((p) => p.split === 'heldOut').map((p) => p.id));
  const dev = new Set(SET.prompts.filter((p) => p.split === 'development').map((p) => p.id));
  assert.equal(v.isTheBar, false);
  assert.equal(v.barMet, false);
  assert.ok(v.wroteTo.endsWith('-partial.json'));
  assert.ok(v.rows.heldOut.length > 0 && v.rows.heldOut.every((r) => held.has(r.id)));
  assert.ok(v.rows.development.every((r) => dev.has(r.id)));
  assert.equal(v.checks.barRowsAreHeldOutOnly, true);
  assert.equal(v.arms.template.heldOut.seedSpread, 0);
  assert.equal(v.arms.organism.heldOut.seedMean, null, 'an unselected arm has no number');
  assert.equal(v.gap, null);
  assert.equal(v.control.arm, CONTROL);
  assert.equal(v.judge.name, 'rubric-v1');
});

test('the bar, the arm plan and the flags', () => {
  assert.equal(barFrom({ organism: 80, template: 70, band: 5 }).met, true);
  assert.equal(barFrom({ organism: 75, template: 70, band: 5 }).met, false, 'equal to the band is not more than it');
  assert.equal(barFrom({ organism: 40, template: 70, band: 0 }).met, false);
  assert.equal(barFrom({ organism: null, template: 70, band: 0 }).met, false);
  const plan = planArms(6);
  assert.deepEqual(plan[0], [...ARMS]);
  assert.notEqual(plan[1][0], plan[0][0]);
  assert.deepEqual(args(['--provider', 'ollama', '--seeds', '3']).bad, []);
  assert.equal(args(['--provider', 'ollama']).opts.provider, 'ollama');
  assert.equal(args(['--provider', 'bogus']).bad.length, 1);
  assert.ok(args(['--sedes', '3']).bad.includes('unknown flag --sedes'), 'a typo runs nothing');
  assert.equal(args(['--seeds', 'x']).bad.length, 1);
  assert.equal(args(['stray']).bad.length, 1);
});

test('sentences split after end marks and at line breaks, paragraphs at blank lines', () => {
  assert.deepEqual(sentencesOf('One two. Three four! Five?\nSix'), ['One two.', 'Three four!', 'Five?', 'Six']);
  assert.equal(paragraphsOf('a\n\nb\r\n\r\nc\n \nd').length, 4);
  assert.equal(paragraphsOf('a\nb').length, 1);
});
