// test/answer.test.mjs: bench/answer.mjs, the three claims it makes about itself.
//
// Nothing here reaches the real ollama on this machine. The one end to end test points the
// bench at a port nothing listens on, which is the point of that test: the two model arms
// must come back ABSENT with a reason, while the third arm, running in the same process on
// the same questions, answers all of them. Absent and zero are different numbers, and a run
// where the model was never reached must not be readable as a run the model lost.
//
// The grading tests are the ones worth reading. Each one grades a claim against the thing it
// would replace: a right answer against a near miss (391 against 392), a value written two
// ways against a value that is genuinely different (7/8 against 0.875 against
// 0.30000000000000004), and the exact ruler against its own looser twin, so that "exact
// means exact" is a measured difference and not a comment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import {
  ARMS, buildBrain, buildQuestions, extractAnswer, gradeAnswer, nFor95, planArms, run, stride, summarizeArm, wilson,
} from '../bench/answer.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(HERE, '..', 'bench', 'fixtures', 'answer-questions.json');
const DEAD = 'http://127.0.0.1:1';
const B = String.raw;

// ---------------------------------------------------------------- grading is exact
test('number grading is by value, and a near miss is wrong', () => {
  const item = { a: '391', grade: 'number' };
  assert.equal(gradeAnswer('391', item).ok, true);
  assert.equal(gradeAnswer('The answer is 391.', item).ok, true);
  assert.equal(gradeAnswer(B`\boxed{391}`, item).ok, true);
  assert.equal(gradeAnswer('6,912', { a: '6912', grade: 'number' }).ok, true);
  // The control: one digit different is a different answer, and the grader must say so.
  assert.equal(gradeAnswer('392', item).ok, false);
  assert.equal(gradeAnswer('3910', item).ok, false);
  assert.equal(gradeAnswer('I am not sure.', item).ok, false);
});

test('a value written two ways is one answer, and a value that differs is not', () => {
  assert.equal(gradeAnswer('0.875', { a: '7/8', grade: 'number' }).ok, true);
  assert.equal(gradeAnswer('7/8', { a: '0.875', grade: 'number' }).ok, true);
  assert.equal(gradeAnswer(B`\boxed{\frac{7}{8}}`, { a: '7/8', grade: 'number' }).ok, true);
  // The float sum is not 0.3, and a grader that rounded would call this correct.
  assert.equal(gradeAnswer('0.30000000000000004', { a: '0.3', grade: 'number' }).ok, false);
  assert.equal(gradeAnswer('0.3', { a: '0.3', grade: 'number' }).ok, true);
  assert.equal(gradeAnswer('6/8', { a: '7/8', grade: 'number' }).ok, false);
});

test('exact grading compares characters, and the looser ruler is reported beside it', () => {
  const item = { a: 'Sunday', grade: 'exact' };
  assert.equal(gradeAnswer('Sunday', item).ok, true);
  assert.equal(gradeAnswer('The weekday is Sunday.', item).ok, true);
  assert.equal(gradeAnswer('Monday', item).ok, false);
  // The measured difference between the two rulers: exact says no, loose says yes. If both
  // agreed here, the verdict's second column would be reporting nothing.
  const wrongCase = gradeAnswer('sunday', item);
  assert.equal(wrongCase.ok, false);
  assert.equal(wrongCase.loose, true);
  const upper = gradeAnswer('dilation', { a: 'DILATION', grade: 'exact' });
  assert.equal(upper.ok, false);
  assert.equal(upper.loose, true);
});

test('the generous edge is a second ruler, not the graded one', () => {
  // The answer is in the text but not where the one candidate is read from.
  const g = gradeAnswer('Candidates were 391 and 392, and I will go with 392.', { a: '391', grade: 'number' });
  assert.equal(g.ok, false);
  assert.equal(g.anywhere, true);
  // A text that does not hold the answer at all fails both.
  const h = gradeAnswer('I cannot compute that.', { a: '391', grade: 'number' });
  assert.equal(h.ok, false);
  assert.equal(h.anywhere, false);
});

test('the extractor reads one candidate out of a model shaped answer', () => {
  const real = ['17 x 23 can be split up:', '', '- 17 * 20 = 340', '- 17 * 3 = 51', '', '340 + 51 = 391', '', '---', '', '**Final Answer:**', B`$$\boxed{391}$$`].join('\n');
  assert.equal(extractAnswer(real, 'number').candidate, '391');
  // With no boxed value, the last line that is not a delimiter is the candidate.
  assert.equal(extractAnswer('working...\n\n12:35\n\n---', 'exact').candidate, '12:35');
});

// ---------------------------------------------------------------- the fixture
test('every fixture item is graded by a rule the grader implements', () => {
  const fix = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  assert.equal(fix.items.length, 40);
  const families = {};
  for (const it of fix.items) {
    assert.ok(it.q && it.a !== undefined, 'every item has a question and an answer');
    assert.ok(it.grade === 'exact' || it.grade === 'number', 'grade is exact or number: ' + it.grade);
    // The answer the file states must grade itself correct. An item whose own answer does
    // not pass the grader is a question nothing could ever get right.
    assert.equal(gradeAnswer(String(it.a), it).ok, true, 'self grades: ' + it.q);
    families[it.family] = (families[it.family] || 0) + 1;
  }
  assert.deepEqual(families, { arithmetic: 10, unit: 10, string: 10, date: 10 });
  assert.equal(new Set(fix.items.map((i) => i.q)).size, 40, 'no duplicate questions');
});

// ---------------------------------------------------------------- arms interleave
test('arms interleave: every question gets all three, and the first arm rotates', () => {
  const plan = planArms(9);
  assert.equal(plan.length, 9);
  for (const p of plan) assert.deepEqual([...p].sort(), [...ARMS].sort(), 'all three arms on every question');
  const firsts = plan.map((p) => p[0]);
  assert.deepEqual(firsts.slice(0, 4), ['organism', 'alone', 'null', 'organism']);
  // The control this is graded against: an arm by arm plan would run every question of one
  // arm before the next, so the first n/3 entries would all name the same arm.
  const armByArm = ARMS.flatMap((a) => Array.from({ length: 3 }, () => a));
  assert.notDeepEqual(firsts, armByArm);
  assert.equal(new Set(firsts.slice(0, 3)).size, 3, 'three consecutive questions start with three different arms');
});

test('the run records the interleaving it actually used', async () => {
  const v = await run({ base: DEAD, probeMs: 100, tasks: 0, limit: 6, quiet: true, write: false });
  assert.equal(v.interleaving.order.length, 6);
  assert.deepEqual(v.interleaving.order.slice(0, 3), ['organism>alone>null', 'alone>null>organism', 'null>organism>alone']);
  assert.equal(v.checks.everyQuestionGotAllThreeArms, true);
  assert.equal(v.checks.armsRotated, true);
  for (const row of v.rows) assert.equal(new Set(row.order.split('>')).size, 3);
});

// ---------------------------------------------------------------- an absent arm
test('summarizeArm records an arm that answered nothing as absent, never as zero', () => {
  const empty = { asked: 7, answered: 0, correct: 0, loose: 0, anywhere: 0, ms: [], fellBack: 7, reason: null, bySource: {}, held: 0, heldOf: 0 };
  const s = summarizeArm(empty, 'no ollama at ' + DEAD);
  assert.equal(s.absent, true);
  assert.equal(s.correct, null);
  assert.equal(s.accuracy, null);
  assert.equal(s.meanMs, null);
  assert.equal(s.interval.width, null);
  assert.ok(s.reason.includes('no ollama'));
  assert.notEqual(s.accuracy, 0, 'zero would say the model answered and lost');
  // The control: the same shape with one answer is present, and then zero correct is a real zero.
  const one = summarizeArm({ ...empty, answered: 1, asked: 1, fellBack: 0, ms: [12] });
  assert.equal(one.absent, false);
  assert.equal(one.correct, 0);
  assert.equal(one.accuracy, 0);
});

test('with no model reachable the two model arms are absent and the third still answers', async () => {
  const v = await run({ base: DEAD, probeMs: 100, tasks: 1, limit: 8, quiet: true, write: false });
  assert.equal(v.ollamaUp, false);
  for (const arm of ['organism', 'alone']) {
    assert.equal(v.arms[arm].absent, true, arm + ' is absent');
    assert.equal(v.arms[arm].correct, null);
    assert.equal(v.arms[arm].accuracy, null);
    assert.equal(v.arms[arm].asked, 0, 'an arm with no model is not asked, so it cannot be scored');
    assert.ok(v.arms[arm].reason, 'an absent arm carries the reason it is absent');
  }
  // The control arm, in the same process on the same questions, did answer every one.
  assert.equal(v.arms.null.absent, false);
  assert.equal(v.arms.null.n, v.questions.total);
  assert.equal(v.arms.null.n, v.arms.null.asked);
  assert.equal(v.winner, 'null', 'the only arm that answered is the only arm that can win');
  assert.equal(v.runnerUp, null);
  assert.equal(v.gap, null);
  assert.equal(v.checks.absentArmsCarryAReason, true);
  assert.equal(v.verdict, 'GREEN', 'a model that was never reachable is not a failed bench');
});

// ---------------------------------------------------------------- the questions
test('the questions come from the fixture and from the three exact suites', () => {
  const qs = buildQuestions({ tasksPerSuite: 2 });
  const bySource = qs.reduce((m, q) => (m[q.source] = (m[q.source] || 0) + 1, m), {});
  assert.deepEqual(bySource, { fixture: 40, algebra: 2, sequence: 2, grid: 2 });
  for (const q of qs) {
    assert.ok(q.q.length > 0 && String(q.a).length > 0);
    assert.ok(q.grade === 'exact' || q.grade === 'number');
  }
  // The sources are round robin, so no source sits only at the start or only at the end.
  assert.notEqual(qs[0].source, qs[1].source);
  const suiteIdx = qs.map((q, i) => (q.source === 'algebra' ? i : -1)).filter((i) => i >= 0);
  assert.ok(suiteIdx[suiteIdx.length - 1] > 3, 'the second algebra question is not adjacent to the first');
});

test('the stride sample spreads over the families instead of taking the first block', () => {
  const list = Array.from({ length: 60 }, (_, i) => ({ i, family: i < 30 ? 'a' : 'b' }));
  const taken = stride(list, 6);
  assert.equal(taken.length, 6);
  assert.equal(new Set(taken.map((t) => t.family)).size, 2, 'both families appear');
  // The control: the first N would all be one family.
  assert.equal(new Set(list.slice(0, 6).map((t) => t.family)).size, 1);
  assert.equal(stride(list, 0).length, 0);
  assert.equal(stride(list, 200).length, 60);
});

test('the fixture is in memory and the suite questions are not', () => {
  const qs = buildQuestions({ tasksPerSuite: 2 });
  const brain = buildBrain(qs);
  assert.equal(brain.memory.episodic.size(), 40, 'one episode per fixture item, and nothing else');
});

// ---------------------------------------------------------------- the edges
test('the interval width and n_for_95 move the way an edge has to move', () => {
  const small = wilson(5, 10), large = wilson(500, 1000);
  assert.ok(small.width > large.width, 'ten answers buy a wider interval than a thousand');
  assert.ok(large.lo < 0.5 && large.hi > 0.5);
  assert.equal(wilson(0, 0).width, null);
  // A gap of nothing cannot be separated from zero at any n, and a narrow gap costs more
  // questions than a wide one.
  assert.equal(nFor95(0.5, 0.5), null);
  assert.ok(nFor95(0.5, 0.45) > nFor95(0.5, 0.2));
  assert.equal(nFor95(1, 0), 1);
});

// ---------------------------------------------------------------- provenance
test('the control arm reports what answered each question, and the suites are all exact', async () => {
  // No model is reachable, so this is the organism with no AI at all. Before act/solve.mjs
  // it scored 0 on every suite; the claim here is that the suite items are now answered, and
  // that the verdict says WHICH path answered them rather than only how many were right.
  const v = await run({ base: DEAD, probeMs: 100, tasks: 2, quiet: true, write: false });
  const s = v.arms.null;
  assert.equal(s.absent, false);
  assert.ok(s.provenance, 'the control arm carries provenance counts');
  assert.deepEqual(Object.keys(s.provenance).sort(), ['exact', 'memory']);
  // Every suite question is computed, and every fixture question is retrieved. The two
  // populations do not overlap, which is what makes the two counts readable.
  const suiteItems = v.questions.bySource.algebra + v.questions.bySource.sequence + v.questions.bySource.grid;
  assert.equal(s.provenance.exact.n, suiteItems);
  assert.equal(s.provenance.memory.n, v.questions.bySource.fixture);
  assert.equal(s.provenance.exact.n + s.provenance.memory.n, s.n);
  for (const source of ['algebra', 'sequence', 'grid']) {
    assert.equal(s.bySource[source].n, v.questions.bySource[source]);
    assert.equal(s.bySource[source].correct, s.bySource[source].n, source + ' ' + s.bySource[source].correct + '/' + s.bySource[source].n);
  }
  assert.equal(v.checks.provenanceCountsAddUp, true);
  // The absent model arms carry no provenance, because they are the model and nothing else.
  assert.equal(v.arms.alone.provenance, null);
  // Every row names the provenance of the arm that answered it.
  for (const row of v.rows) assert.ok(['exact', 'memory', 'model'].includes(row.arms.null.provenance), JSON.stringify(row.arms.null));
});

test('a seeded run draws the same questions twice', () => {
  const seed = 'answer/' + new RNG('answer-test').int(1000);
  const a = buildQuestions({ tasksPerSuite: 3, seed });
  const b = buildQuestions({ tasksPerSuite: 3, seed });
  assert.deepEqual(a.map((q) => q.id + '|' + q.a), b.map((q) => q.id + '|' + q.a));
});
