// test/self-learn.test.mjs: the organism learning from its own mistakes (self/learn.mjs), board 35 builder, item
// self-learn. Every test plants its own tree in a temp dir (a ledger, the 200-id list, a GSM8K test file, a train split,
// a held-out list, a kept store) and asks through a planted asker: the kept store's programs through reason/induce.mjs
// answerFromPrograms, or a refusal. MODEL OFF: no act/prompt.mjs ask(), no socket.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as I from '../reason/induce.mjs';
import * as L from '../self/learn.mjs';

const FLOOR = 0.1046;
const AT = '2026-09-28T00:00:00.000Z';
const Q = (a, b, c) => `Sam buys ${a} bags of apples. Each bag holds ${b} apples. He also picks ${c} apples from a tree. How many apples does Sam have now?`;
const rec = (a, b, c, gold = a * b + c) => ({ question: Q(a, b, c), answer: `${a}*${b}+${c}=${a * b + c}\n#### ${gold}` });
// five records a*b+c fits, and a sixth of the same lesson and form whose gold it contradicts (26 is written 27)
const FIVE = [rec(3, 4, 5), rec(6, 7, 2), rec(5, 9, 8), rec(8, 3, 11), rec(7, 6, 4)];
const CONTRA = rec(4, 5, 6, 27);
const KEPT = { at: 'planted', levels: {}, devLoo: { role: { precision: 0.3333 }, cue: { precision: 0.1046 }, named: { precision: 0.0568 }, count: { precision: 0.0264 } }, invariant: 'whole', minSupport: 2 };
const jl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '');
const ledgerRow = (id, source = 'gsm8k') => ({ source, id, kind: 'word-problem', prompt: null, given: '1', wanted: null, why: 'wrong-model' });

const ROOTS = [];
after(() => { for (const r of ROOTS) fs.rmSync(r, { recursive: true, force: true }); });
function plant({ test = [], devIds = [], ledger = [], train = null, held = null } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'self-learn-test-'));
  ROOTS.push(root); // removed after the file's tests, pass or fail
  const w = (rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
  w(L.FILES.test, jl(test));
  w(L.FILES.math, JSON.stringify({ records: { ids: devIds } }));
  w(L.FILES.ledger, jl(ledger));
  w(L.FILES.kept, JSON.stringify(KEPT));
  if (train) w(L.FILES.train, jl(train));
  if (held) w(L.FILES.heldOut, jl(held.map((id) => ({ id }))));
  return root;
}
// the planted asker: the store's programs, the tier's order and floor, and the tier's gate 7 (an entry that carries
// forms answers only a prompt whose question form is one of them), or a refusal
const REFUSE = { text: '', from: null, program: null };
const askFn = (store) => async (prompt) => {
  const h = I.answerFromPrograms(prompt, store, { minPrecision: FLOOR });
  if (!h) return REFUSE;
  const e = store.levels[h.level][h.pattern].find((x) => x.program === h.program);
  if (e && e.forms && Array.isArray(e.forms.roles) && !e.forms.roles.includes(I.questionForm(prompt).role)) return REFUSE;
  return { text: 'by ' + h.program + '\n' + h.answer, from: 'program', program: { text: h.program, level: h.level, pattern: h.pattern } };
};
const run = (root, extra = {}) => L.learn({ root, askFn, floor: FLOOR, at: AT, ...extra });
// the tests of the rule, the refusals, the provenance, the retractions and dry mode keep with the rule's own support (the
// gate off): a planted tree of three to six rows never gives the support gate its 60 answers, and the gate has its own test
const runRule = (root, extra = {}) => run(root, { gate: false, ...extra });
const readStore = (root) => JSON.parse(fs.readFileSync(path.join(root, L.FILES.learned), 'utf8'));
const programsOf = (store) => [...new Set(Object.values(store.levels).flatMap((o) => Object.values(o).flatMap((l) => l.map((e) => e.program))))].sort();
function tree(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) tree(f, base, out); else out.push(path.relative(base, f) + ' ' + fs.statSync(f).size);
  }
  return out.sort();
}

test('the rule: a 2-op program that fits 5 of 6 rows of one lesson and contradicts 1 is refused (in any form, of any lesson); without that row it is kept, by its exact text', async () => {
  const six = [...FIVE, CONTRA];
  const ids = six.map((_, i) => 'gsm8k.' + i);
  const root = plant({ test: six, devIds: ids, ledger: ids.map((id) => ledgerRow(id)) });
  const r = await run(root);
  assert.equal(r.rows, 6);
  assert.equal(r.before.refused, 6); // every row is a mistake: the planted asker has no program yet
  assert.equal(r.programs, 0, 'a program that contradicts a development row it could answer is never kept');
  assert.ok(r.tally.refusedContradiction >= 1);
  // the control that can fail (board 36, item learn): the same six rows with the 6th row's gold written right (26). The
  // program fits all six and contradicts none (its own contradictions 0), the run's contradiction refusals fall by its
  // two (under the role and the cue pattern; the ones left are other candidate programs of the same rows), the gate
  // refuses it instead, and with the gate off the rule keeps it: so the refusal above is the contradiction's
  const FIT6 = [...FIVE, rec(4, 5, 6)];
  const rootFit = plant({ test: FIT6, devIds: ids, ledger: ids.map((id) => ledgerRow(id)) });
  const rf = await run(rootFit);
  assert.equal(rf.programs, 0, 'the support gate validates nothing on six rows');
  assert.equal(r.tally.refusedContradiction - rf.tally.refusedContradiction, 2, 'contradiction refusals ' + r.tally.refusedContradiction + ' then ' + rf.tally.refusedContradiction);
  assert.equal(rf.tally.refusedGate, 2);
  const fitRows = L.collect({ root: rootFit }).rows.map(L.prepare);
  const jfit = L.judge('add(mul(q0,q1),q2)', fitRows, fitRows[0].lesson);
  assert.equal(jfit.kept, true);
  assert.equal(jfit.fits.length, 6);
  const rootFitRule = plant({ test: FIT6, devIds: ids, ledger: ids.map((id) => ledgerRow(id)) });
  const rfr = await runRule(rootFitRule);
  assert.deepEqual(programsOf(readStore(rootFitRule)), ['add(mul(q0,q1),q2)']);
  assert.equal(rfr.programs, 1);
  // the judge itself, on the same six rows: fits 5, contradicts gsm8k.5, refused for the contradiction
  const rows = L.collect({ root }).rows.map(L.prepare);
  assert.equal(new Set(rows.map((x) => x.lesson)).size, 1);
  const j = L.judge('add(mul(q0,q1),q2)', rows, rows[0].lesson);
  assert.equal(j.kept, false);
  assert.equal(j.reason, 'contradiction');
  assert.deepEqual(j.contra, ['gsm8k.5']);
  assert.equal(j.why, 'contradicts 1 development row(s) of its pattern (any lesson, any question form: every row the tier could ask it); fits 5 of its lesson');
  // the contradicted row in ANOTHER question form, or of ANOTHER lesson, of the same pattern: still refused (no gate is
  // relied on to keep it away; the rule before this revision kept the program and dropped that form)
  const otherForm = rows.map((x, i) => (i === 5 ? { ...x, form: 'n3|q|x|rnE,n,n' } : x));
  const jf = L.judge('add(mul(q0,q1),q2)', otherForm, rows[0].lesson);
  assert.equal(jf.kept, false);
  assert.equal(jf.reason, 'contradiction');
  assert.deepEqual(jf.contra, ['gsm8k.5']);
  const otherLesson = rows.map((x, i) => (i === 5 ? { ...x, lesson: 'another lesson' } : x));
  assert.equal(L.judge('add(mul(q0,q1),q2)', otherLesson, rows[0].lesson).kept, false);
  // the support rule at its edge: the row it came from and 1 other is refused; and 2 others is kept
  const j2 = L.judge('add(mul(q0,q1),q2)', rows.slice(0, 2), rows[0].lesson);
  assert.equal(j2.kept, false);
  assert.equal(j2.reason, 'support');
  assert.equal(j2.why, 'fits 2 development row(s) of its lesson, fewer than 3 (the row it came from and 2 others)');
  assert.equal(L.judge('add(mul(q0,q1),q2)', rows.slice(0, 3), rows[0].lesson).kept, true);
  // and the five alone are kept by the judge, with the one form they share
  const jk = L.judge('add(mul(q0,q1),q2)', rows.slice(0, 5), rows[0].lesson);
  assert.equal(jk.kept, true);
  assert.deepEqual(jk.forms, ['n3|q|x|rn,n,n']);
  // the five alone: kept, the one program, under the role and the cue pattern, with its provenance
  const ids5 = FIVE.map((_, i) => 'gsm8k.' + i);
  const root5 = plant({ test: FIVE, devIds: ids5, ledger: ids5.map((id) => ledgerRow(id)) });
  const r5 = await runRule(root5);
  const s5 = readStore(root5);
  assert.deepEqual(programsOf(s5), ['add(mul(q0,q1),q2)']);
  assert.equal(r5.programs, 1);
  assert.deepEqual(Object.keys(s5.levels.role), ['n3|q|x|rn,n,n']);
  assert.deepEqual(Object.keys(s5.levels.cue), ['n3|q|x']);
  const e = s5.levels.role['n3|q|x|rn,n,n'][0];
  assert.equal(e.program, 'add(mul(q0,q1),q2)');
  assert.equal(e.ops, 2);
  assert.equal(e.support, 5);
  assert.deepEqual(e.records.slice().sort(), ids5);
  assert.deepEqual(e.forms, { roles: ['n3|q|x|rn,n,n'] });
  assert.equal(e.learned.lesson, rows[0].lesson);
  assert.equal(e.learned.contradictions, 0);
  assert.equal(e.learned.date, '2026-09-28');
  assert.deepEqual(e.learned.inducedFrom.slice().sort(), ids5);
  // and the organism, asked again with the merged store, answers all five right by the learned program
  assert.equal(r5.after.right, 5);
  assert.equal(r5.learnedAnswered.right, 5);
  assert.equal(r5.learnedAnswered.wrong, 0);
});

test('a planted test-record id is refused with the exact reason, and never opened', async () => {
  const recs = [...FIVE.slice(0, 3), rec(9, 2, 3)];
  const root = plant({ test: recs, devIds: ['gsm8k.0', 'gsm8k.1', 'gsm8k.2'], ledger: [ledgerRow('gsm8k.0'), ledgerRow('gsm8k.1'), ledgerRow('gsm8k.2'), ledgerRow('gsm8k.3'), ledgerRow('arc.x', 'arc')] });
  const c = L.collect({ root });
  assert.deepEqual(c.rows.map((x) => x.id), ['gsm8k.0', 'gsm8k.1', 'gsm8k.2']);
  const t = c.refused.find((x) => x.id === 'gsm8k.3');
  assert.deepEqual(t, { id: 'gsm8k.3', source: 'gsm8k', reason: 'a GSM8K test record: not one of the 200 development ids bench/verdicts/math.json lists, so nothing that learns may read it' });
  assert.equal(t.reason, L.REASONS.test);
  assert.equal(c.refused.find((x) => x.id === 'arc.x').reason, L.REASONS.arc);
  assert.equal(c.opened.test, 0);
  assert.equal(c.opened.total, 3);
  const r = await runRule(root);
  assert.equal(r.refusedByReason[L.REASONS.test], 1);
  assert.ok(!L.provenanceIds(readStore(root)).has('gsm8k.3'));
});

test('held-out ids never appear in the learned provenance, and without the held-out list the same id does (the control)', async () => {
  const train = [rec(2, 8, 7), rec(9, 2, 3), rec(6, 5, 9), rec(4, 7, 1)];
  const devIds = ['gsm8k.0', 'gsm8k.1', 'gsm8k.2'];
  const ledger = devIds.map((id) => ledgerRow(id));
  const root = plant({ test: FIVE.slice(0, 3), devIds, ledger, train, held: ['gsm8k-train.2'] });
  const r = await runRule(root);
  assert.equal(r.opened.heldOut, 0);
  assert.equal(r.counts.trainHeldOut, 1);
  const prov = L.provenanceIds(readStore(root));
  assert.ok(prov.size > 0, 'the store names ids at all');
  assert.ok(prov.has('gsm8k-train.0') && prov.has('gsm8k-train.3'));
  assert.ok(!prov.has('gsm8k-train.2'));
  // the control that can fail: the same tree without a held-out list names gsm8k-train.2
  const open = plant({ test: FIVE.slice(0, 3), devIds, ledger, train });
  await runRule(open);
  assert.ok(L.provenanceIds(readStore(open)).has('gsm8k-train.2'));
});

test('a kept entry that answered development rows wrong has their form retracted: merged, the tier refuses them; without the retraction it answers them wrong (the control)', async () => {
  const ids = FIVE.map((_, i) => 'gsm8k.' + i);
  const form = I.questionForm(FIVE[0].question + L.SUFFIX).role;
  assert.equal(form, 'n3|q|x|rn,n,n');
  const wrongKept = { ...KEPT, levels: { role: { [form]: [{ program: 'add(q0,add(q1,q2))', ops: 2, support: 2, chain: 2, records: ['planted.a', 'planted.b'], chainRecords: [], tried: 2, forms: { roles: [form] } }] } } };
  const root = plant({ test: FIVE, devIds: ids, ledger: ids.map((id) => ledgerRow(id)) });
  fs.writeFileSync(path.join(root, L.FILES.kept), JSON.stringify(wrongKept));
  const r = await runRule(root);
  assert.equal(r.before.wrong, 5, 'the kept entry answers every row wrong before');
  const s = readStore(root);
  assert.deepEqual(s.retract.map(({ date, by, ...x }) => x), [{ level: 'role', pattern: form, program: 'add(q0,add(q1,q2))', forms: [form], wrongRows: ids, rightRows: [] }]);
  assert.equal(s.retract[0].date, '2026-09-28');
  assert.deepEqual(programsOf(s), ['add(mul(q0,q1),q2)']);
  assert.equal(r.retracted.forms, 1);
  assert.equal(r.mergedCounts.retracted, 1);
  assert.equal(r.after.wrong, 0);
  assert.equal(r.after.refused, 5);
  assert.equal(r.outcomes.withdrawn, 5);
  // the control that can fail: the same merge without the retraction answers all five wrong again
  const noRetract = L.mergeStores(wrongKept, { ...s, retract: [] });
  const ask = askFn(noRetract);
  let wrong = 0;
  for (const x of FIVE) { const a = await ask(x.question + L.SUFFIX); if (a.program && Number(a.text.split('\n').pop()) !== I.goldOf(x)) wrong++; }
  assert.equal(wrong, 5);
  assert.ok(L.provenanceIds(s).has('gsm8k.4'), 'the retraction rows are provenance');
});

test('the support gate: a support at which a program learned on one half answers a row of the other half wrong is raised; when the halves keep nothing first, nothing is kept (with the gate off the same tree keeps a 3-row program: the control); 0 wrong and 60 right on the halves validates a support', async () => {
  // the halves are the salted hash of the id (L.foldOf with L.GATE.salt): gsm8k.0, 3, 4, 5 in half 0; gsm8k.1, 2, 6 in half 1
  const ids = [0, 1, 2, 3, 4, 5, 6].map((i) => 'gsm8k.' + i);
  assert.deepEqual(ids.map((id) => L.foldOf(id, 2, L.GATE.salt)), [0, 1, 1, 0, 0, 0, 1]);
  // a*b+c fits the three rows of half 1 and is contradicted by the row of half 0 (26 written 27); a-b fits three rows of
  // another pattern (half 0)
  const QB = (a, b) => `Mia has ${a} marbles. She gives away ${b} marbles. How many marbles does Mia have left?`;
  const recB = (a, b) => ({ question: QB(a, b), answer: `${a}-${b}=${a - b}\n#### ${a - b}` });
  const seven = [CONTRA, FIVE[0], FIVE[1], recB(9, 4), recB(12, 5), recB(20, 8), FIVE[2]];
  const planted = () => plant({ test: seven, devIds: ids });
  const root = planted();
  const r = await run(root);
  assert.equal(r.rows, 7);
  assert.equal(r.gate.on, true);
  // support 2: a*b+c learned on half 1 answers gsm8k.0 (half 0) wrong, so the gate rises; support 3: nothing is kept on a
  // half, so no support is validated and the full run keeps nothing (a-b would be kept by the rule alone)
  assert.deepEqual(r.gate.tried.map((t) => [t.others, t.entries, t.right, t.wrong]), [[2, 4, 0, 1], [3, 0, 0, 0]]);
  assert.deepEqual(r.gate.tried[0].wrongRows, ['gsm8k.0']);
  assert.equal(r.gate.others, null);
  assert.equal(r.programs, 0);
  assert.equal(r.tally.refusedGate, 2, 'a-b under its role and its cue pattern, refused by the gate');
  const st = readStore(root);
  assert.equal(st.minSupport, null);
  assert.equal(st.gate.others, null);
  assert.ok(L.provenanceIds(st).has('gsm8k.0'), 'the gate\'s wrong row is provenance');
  // the control that can fail: the same tree with the gate off keeps a-b on its 3 rows
  const root2 = planted();
  const c = await run(root2, { gate: false });
  assert.equal(c.gate.on, false);
  assert.equal(c.gate.others, L.RULE.others);
  assert.deepEqual(programsOf(readStore(root2)), ['sub(q0,q1)']);
  // a support is validated when the halves answer 0 wrong and at least GATE.minRight right: 130 rows a-b fits
  const many = [];
  for (let i = 0; i < 130; i++) many.push(recB(20 + i, 1 + (i % 9)));
  const ids130 = many.map((_, i) => 'gsm8k.' + i);
  const root3 = plant({ test: many, devIds: ids130 });
  const v = await run(root3);
  assert.equal(L.GATE.minRight, 60);
  assert.equal(v.gate.tried.length, 1);
  assert.equal(v.gate.tried[0].others, L.RULE.others);
  assert.equal(v.gate.tried[0].wrong, 0);
  assert.ok(v.gate.tried[0].right >= L.GATE.minRight, 'the halves answered ' + v.gate.tried[0].right + ' right');
  assert.equal(v.gate.others, L.RULE.others);
  assert.deepEqual(programsOf(readStore(root3)), ['sub(q0,q1)']);
  assert.equal(readStore(root3).minSupport, L.RULE.others + 1);
  // 0 wrong is not enough: the five a*b+c rows give the halves 2 right answers, fewer than 60, so nothing is kept (the
  // rule alone keeps the program: the first test)
  const ids5 = FIVE.map((_, i) => 'gsm8k.' + i);
  const v5 = await run(plant({ test: FIVE, devIds: ids5 }));
  assert.deepEqual(v5.gate.tried.map((t) => [t.others, t.right, t.wrong]), [[2, 2, 0], [3, 0, 0]]);
  assert.equal(v5.gate.others, null);
  assert.equal(v5.programs, 0);
  // and 60 right is not enough: one row of the 131 whose gold a-b contradicts is answered wrong on its half at every
  // support the halves keep a-b at, so no support is validated
  const bad = [...many, { question: QB(50, 7), answer: '50-7=43\n#### 44' }];
  const vb = await run(plant({ test: bad, devIds: bad.map((_, i) => 'gsm8k.' + i) }));
  assert.equal(vb.gate.tried[0].wrong, 1);
  assert.ok(vb.gate.tried[0].right >= L.GATE.minRight);
  assert.deepEqual(vb.gate.tried[0].wrongRows, ['gsm8k.130']);
  assert.equal(vb.gate.others, null);
});

test('dry mode writes nothing', async () => {
  const ids = FIVE.map((_, i) => 'gsm8k.' + i);
  const root = plant({ test: FIVE, devIds: ids, ledger: ids.map((id) => ledgerRow(id)) });
  const before = tree(root);
  const r = await runRule(root, { dry: true });
  assert.equal(r.file, null);
  assert.equal(r.programs, 1, 'dry still learns: the program is found, only the write is skipped');
  assert.equal(fs.existsSync(path.join(root, L.FILES.learned)), false);
  assert.deepEqual(tree(root), before);
});

test('mergeStores: the kept entries first, a learned program appended once, a retracted form removed, the inputs unchanged', () => {
  const kept = { at: 'k', levels: { role: { p: [{ program: 'add(q0,q1)', records: ['a'] }] } } };
  const learned = { at: 'l', levels: { role: { p: [{ program: 'add(q0,q1)', records: ['b'] }, { program: 'mul(q0,q1)', records: ['c'] }] }, cue: { c: [{ program: 'sub(q0,q1)', records: ['d'] }] } } };
  const k0 = JSON.stringify(kept), l0 = JSON.stringify(learned);
  const m = L.mergeStores(kept, learned);
  assert.deepEqual(m.levels.role.p.map((e) => e.program), ['add(q0,q1)', 'mul(q0,q1)']);
  assert.equal(m.levels.role.p[0].records[0], 'a');
  assert.deepEqual(m.levels.cue.c.map((e) => e.program), ['sub(q0,q1)']);
  assert.equal(m.merged.added, 2);
  assert.deepEqual([...L.learnedKeysOf(kept, learned)].sort(), ['cue|c|sub(q0,q1)', 'role|p|mul(q0,q1)']);
  assert.equal(JSON.stringify(kept), k0);
  assert.equal(JSON.stringify(learned), l0);
  // a retraction removes its form from the kept entry and keeps the entry; one the kept store does not hold is unapplied
  const kf = { at: 'k', levels: { role: { p: [{ program: 'add(q0,q1)', records: ['a'], forms: { roles: ['F1', 'F2'] } }] } } };
  const kf0 = JSON.stringify(kf);
  const mr = L.mergeStores(kf, { levels: {}, retract: [{ level: 'role', pattern: 'p', program: 'add(q0,q1)', forms: ['F1'] }, { level: 'cue', pattern: 'nowhere', program: 'mul(q0,q1)', forms: ['F1'] }] });
  assert.deepEqual(mr.levels.role.p.map((e) => e.program), ['add(q0,q1)']);
  assert.deepEqual(mr.levels.role.p[0].forms.roles, ['F2']);
  assert.deepEqual(mr.levels.role.p[0].forms.retracted, ['F1']);
  assert.equal(mr.merged.retracted, 1);
  assert.equal(mr.merged.unapplied, 1);
  assert.equal(JSON.stringify(kf), kf0);
});

// ---- board 36, item learn-2: the ceiling by cause and the straight-line programs read from the worked chains
const mkRow = (id, question, answer) => ({ id, question, answer, gold: Number(answer.split('####')[1].trim()), lesson: 'planted' });
const CAUSE_ROWS = () => [
  mkRow('c1', 'A tree grows 3 inches each year. How many inches does it grow in 2 decades?', '3*10=<<3*10=30>>30\n30*2=<<30*2=60>>60\n#### 60'),
  mkRow('c2', 'Ann has 3 red pens, 4 blue pens, 5 green pens, 6 black pens, 7 pink pens and 8 gray pens. How many pens does Ann have?', '3+4=<<3+4=7>>7\n7+5=<<7+5=12>>12\n12+6=<<12+6=18>>18\n18+7=<<18+7=25>>25\n25+8=<<25+8=33>>33\n#### 33'),
  mkRow('c3', 'Lea has 5 marbles. Her friend gives her some more. How many marbles does Lea have now?', '5+9=<<5+9=14>>14\n#### 14'),
  mkRow('c4', Q(3, 4, 5), '3*4=<<3*4=12>>12\n12+5=<<12+5=17>>17\n#### 17'),
  mkRow('c5', 'Bo has 3 pens and 4 pencils. How many things does Bo have?', 'He has 7.\n#### 7'),
];

test('the cause classifier: five planted rows, one per cause, each filed under its own; ceilingByCause sums its causes to its unreachable count', () => {
  const rows = CAUSE_ROWS().map(L.prepare);
  const got = rows.map((r) => L.causeOf(r, { groupSize: 1 }));
  assert.deepEqual(got.map((k) => k.cause), [1, 2, 3, 4, 5]);
  assert.deepEqual(got.map((k) => k.name), ['word quantity', 'chain too long', 'number from the text', 'pattern', 'other']);
  assert.equal(got[3].sub, 'ownForm');
  // the chain behind causes 2, 3 and 5, by its exact fields
  assert.equal(L.chainOf(rows[1]).text, 'add(add(add(add(add(q0,q1),q2),q3),q4),q5)');
  assert.equal(L.chainOf(rows[1]).ops, 5);
  assert.ok(L.chainOf(rows[1]).ops > I.MAX_OPS);
  assert.deepEqual(L.chainOf(rows[2]).unmatched, [9]);
  assert.equal(L.chainOf(rows[4]).reason, 'no annotated step');
  const t = L.ceilingByCause(CAUSE_ROWS());
  assert.equal(t.rows, 5);
  assert.equal(t.reachable, 0);
  assert.equal(t.unreachable, 5);
  assert.deepEqual(t.causes, { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
  assert.equal(Object.values(t.causes).reduce((a, b) => a + b, 0), t.unreachable);
  assert.deepEqual(t.ids, { 1: ['c1'], 2: ['c2'], 3: ['c3'], 4: ['c4'], 5: ['c5'] });
  // the control: two rows of one role form that share the one program reach each other, and nothing is filed
  const two = L.ceilingByCause([mkRow('s1', Q(3, 4, 5), '3*4=<<3*4=12>>12\n12+5=<<12+5=17>>17\n#### 17'), mkRow('s2', Q(6, 7, 2), '6*7=<<6*7=42>>42\n42+2=<<42+2=44>>44\n#### 44')]);
  assert.equal(two.reachable, 2);
  assert.equal(two.unreachable, 0);
  assert.deepEqual(two.causes, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
});

test('a planted train record with 3 annotated steps yields the asserted straight-line program text', () => {
  const question = 'Ben has 12 apples. He buys 3 bags with 4 apples in each bag. Then he gives 5 apples away. How many apples does Ben have now?';
  const answer = 'He buys 3*4=<<3*4=12>>12 apples.\nHe has 12+12=<<12+12=24>>24 apples.\nHe has 24-5=<<24-5=19>>19 apples left.\n#### 19';
  assert.deepEqual(I.chainSteps(answer).map((s) => s.expr + '=' + s.result), ['3*4=12', '12+12=24', '24-5=19']);
  const c = I.chainProgram(answer, I.parse(question + L.SUFFIX), { gold: 19 });
  assert.equal(c.ok, true);
  assert.equal(c.text, 'sub(add(mul(q1,q2),q0),q3)');
  assert.equal(c.steps, 3);
  assert.equal(c.ops, 3);
  assert.equal(c.whole, true);
  // the control: the same chain against a gold no step computes is refused with the exact reason
  const w = I.chainProgram(answer, I.parse(question + L.SUFFIX), { gold: 20 });
  assert.equal(w.ok, false);
  assert.equal(w.reason, 'no step of the chain computes the gold on the prompt numbers');
});

test('a planted word quantity is read only when its word is in the prompt', () => {
  assert.deepEqual(I.wordQuantities('How many inches does it grow in 2 decades?').map((w) => w.name + '=' + w.v), ['wdecade=10']);
  assert.equal(I.wordQuantities('How many inches does it grow in 2 springs?').some((w) => w.name === 'wdecade'), false);
  const withWord = L.prepare(CAUSE_ROWS()[0]);
  assert.equal(L.causeOf(withWord, { groupSize: 1 }).cause, 1);
  const noWord = L.prepare(mkRow('c1b', 'A tree grows 3 inches each spring. How many inches does it grow in 2 springs?', '3*10=<<3*10=30>>30\n30*2=<<30*2=60>>60\n#### 60'));
  const k = L.causeOf(noWord, { groupSize: 1 });
  assert.notEqual(k.cause, 1);
  assert.equal(k.cause, 3);
  // the word leaf never enters the chain program a row offers: with the word admitted the chain runs, without it not
  const p = I.parse(CAUSE_ROWS()[0].question + L.SUFFIX);
  const ans = CAUSE_ROWS()[0].answer;
  assert.equal(I.chainProgram(ans, p, { gold: 60 }).ok, false);
  const ww = I.chainProgram(ans, p, { gold: 60, words: I.wordQuantities(CAUSE_ROWS()[0].question) });
  assert.equal(ww.ok, true);
  assert.deepEqual(ww.words, ['wdecade']);
  assert.equal(L.chainCandidate(withWord), null);
});

test('the chain programs never change what the old rule keeps on the board 35 planted ledger; six quantities are kept only with them (the control)', async () => {
  const ids5 = FIVE.map((_, i) => 'gsm8k.' + i);
  const on = plant({ test: FIVE, devIds: ids5, ledger: ids5.map((id) => ledgerRow(id)) });
  const off = plant({ test: FIVE, devIds: ids5, ledger: ids5.map((id) => ledgerRow(id)) });
  const ron = await runRule(on, { chain: true });
  const roff = await runRule(off, { chain: false });
  const son = readStore(on);
  const soff = readStore(off);
  assert.deepEqual(programsOf(son), ['add(mul(q0,q1),q2)']);
  assert.deepEqual(programsOf(soff), ['add(mul(q0,q1),q2)']);
  assert.deepEqual(son.levels, soff.levels);
  assert.equal(ron.programs, 1);
  assert.equal(roff.programs, 1);
  assert.equal(ron.tally.fromChain, 0);
  assert.equal(son.chain.on, true);
  assert.equal(soff.chain.on, false);
  // six quantities summed: 5 operations, past the search's MAX_OPS; the chain program is kept and answers all five right
  const S = (a, b, c, d, e, f) => `Ann has ${a} red pens, ${b} blue pens, ${c} green pens, ${d} black pens, ${e} pink pens and ${f} gray pens. How many pens does Ann have?`;
  const six = (...v) => { const st = []; let s = v[0]; for (const x of v.slice(1)) { st.push(`${s}+${x}=<<${s}+${x}=${s + x}>>${s + x}`); s += x; } return { question: S(...v), answer: st.join('\n') + '\n#### ' + s }; };
  const SIX = [six(3, 4, 5, 6, 7, 8), six(2, 9, 4, 11, 3, 6), six(5, 1, 7, 2, 9, 4), six(8, 6, 3, 5, 2, 10), six(4, 7, 9, 3, 6, 12)];
  const ids6 = SIX.map((_, i) => 'gsm8k.' + i);
  const on6 = plant({ test: SIX, devIds: ids6, ledger: ids6.map((id) => ledgerRow(id)) });
  const off6 = plant({ test: SIX, devIds: ids6, ledger: ids6.map((id) => ledgerRow(id)) });
  const r6 = await runRule(on6, { chain: true });
  const r6off = await runRule(off6, { chain: false });
  assert.deepEqual(programsOf(readStore(on6)), ['add(add(add(add(add(q0,q1),q2),q3),q4),q5)']);
  assert.equal(r6.programs, 1);
  assert.equal(r6.after.right, 5);
  assert.equal(r6.learnedAnswered.wrong, 0);
  const e6 = readStore(on6).levels.role['n6|q|x|rn,n,n,n,n,n'][0];
  assert.equal(e6.learned.fromChain, true);
  assert.equal(e6.learned.contradictions, 0);
  assert.deepEqual(programsOf(readStore(off6)), []);
  assert.equal(r6off.programs, 0);
  assert.equal(r6off.after.refused, 5);
});

test('the cause classifier by each arm\'s own limit: a 5-operation chain is (2) with the search programs only and (4) with the chain programs on, a 9-operation chain is (2) in both, and a row whose own chain gives its gold needs no word quantity with the chain programs on', () => {
  // the 5-operation chain (six quantities summed): past MAX_OPS (4), within CHAIN.maxOps (8)
  const five = L.prepare(CAUSE_ROWS()[1]);
  assert.equal(L.causeOf(five, { groupSize: 1 }).cause, 2);
  const on5 = L.causeOf(five, { groupSize: 1, chain: true });
  assert.equal(on5.cause, 4);
  assert.equal(on5.sub, 'ownForm');
  assert.equal(L.causeOf(five, { groupSize: 2, chain: true }).sub, 'sharedForm');
  // ten quantities summed: a 9-operation chain, past CHAIN.maxOps too
  const vals = [3, 4, 5, 6, 7, 8, 9, 2, 11, 12];
  const colours = ['red', 'blue', 'green', 'black', 'pink', 'gray', 'white', 'brown', 'gold', 'teal'];
  const steps = [];
  let acc = vals[0];
  for (const v of vals.slice(1)) { steps.push(`${acc}+${v}=<<${acc}+${v}=${acc + v}>>${acc + v}`); acc += v; }
  const nine = L.prepare(mkRow('c9', 'Ann has ' + vals.map((v, i) => v + ' ' + colours[i] + ' pens').join(', ') + '. How many pens does Ann have?', steps.join('\n') + '\n#### ' + acc));
  assert.equal(L.chainOf(nine).ops, 9);
  assert.equal(L.causeOf(nine, { groupSize: 1 }).cause, 2);
  assert.equal(L.causeOf(nine, { groupSize: 1, chain: true }).cause, 2);
  // a planted word fit on the 5-operation row: (1) with the search programs only, not (1) once its own chain program counts
  const planted = L.prepare(CAUSE_ROWS()[1]);
  planted.wordFit = true;
  assert.equal(L.causeOf(planted, { groupSize: 1 }).cause, 1);
  assert.notEqual(L.chainCandidate(planted), null);
  assert.equal(L.causeOf(planted, { groupSize: 1, chain: true }).cause, 4);
  // the word row whose chain needs the decade (10) stays (1) in both arms: its own chain does not run on the prompt numbers
  const word = L.prepare(CAUSE_ROWS()[0]);
  assert.equal(L.causeOf(word, { groupSize: 1 }).cause, 1);
  assert.equal(L.causeOf(word, { groupSize: 1, chain: true }).cause, 1);
  // the table with the chain programs on: the 5-operation row moves from (2) to (4), and the sum still equals the unreachable count
  const t = L.ceilingByCause(CAUSE_ROWS(), { chain: true });
  assert.equal(t.unreachable, 5);
  assert.deepEqual(t.causes, { 1: 1, 2: 0, 3: 1, 4: 2, 5: 1 });
  assert.deepEqual(t.ids[4], ['c2', 'c4']);
  assert.deepEqual(t.pattern, { ownForm: 2, sharedForm: 0, notWhole: 0, window: 0 });
});

test('cause (4) names its window part: a whole 8-operation chain over a parse of more than 12 leaves is (4) window with the chain programs on (gate 5 refuses such a parse) and (2) with the search programs only', () => {
  const vals = [3, 4, 5, 6, 7, 8, 9, 2, 11];
  const colours = ['red', 'blue', 'green', 'black', 'pink', 'gray', 'white', 'brown', 'gold'];
  const steps = [];
  let acc = vals[0];
  for (const v of vals.slice(1)) { steps.push(`${acc}+${v}=<<${acc}+${v}=${acc + v}>>${acc + v}`); acc += v; }
  const q = 'Ann has ' + vals.map((v, i) => v + ' ' + colours[i] + ' pens').join(', ') + '. She keeps them in dozens of boxes for both her week and her day, each hour and each minute. How many pens does Ann have?';
  const row = L.prepare(mkRow('cw', q, steps.join('\n') + '\n#### ' + acc));
  assert.equal(row.n, 9);
  assert.ok(I.leavesOf(row.parse).length > 12);
  assert.equal(L.chainOf(row).ops, 8);
  assert.equal(L.chainOf(row).whole, true);
  assert.equal(L.chainCandidate(row), null);
  const on = L.causeOf(row, { groupSize: 3, chain: true });
  assert.equal(on.cause, 4);
  assert.equal(on.sub, 'window');
  assert.equal(L.causeOf(row, { groupSize: 3 }).cause, 2);
  // the control: the same sum over nine quantities with no named word holds 9 leaves and is (4) sharedForm, not window
  const plain = L.prepare(mkRow('cp', 'Ann has ' + vals.map((v, i) => v + ' ' + colours[i] + ' pens').join(', ') + '. How many pens does Ann have?', steps.join('\n') + '\n#### ' + acc));
  assert.equal(I.leavesOf(plain.parse).length, 9);
  assert.equal(L.causeOf(plain, { groupSize: 3, chain: true }).sub, 'sharedForm');
});

// ---------------------------------------------------------------- the six mutants board 36's skeptic ran that 13 of 13 let live (checkpoint 4)
// M4 a row may reach itself in ceilingByCause; M6 the chain program replaces the search programs; M12 a fold of
// ceilingTwoFold reads its own rows; M13 the CHAIN.maxOps guard removed from chainCandidate; M14 its whole guard
// removed; M15 its gold fit removed. Each test below turns red under its mutant (scratch runner, checkpoint 4) and holds
// a control that shows the ruler can move the other way.

test('M4: ceilingByCause is leave-one-out: a row whose own programs give its gold is unreachable when the other row of its form offers nothing (the control: two rows sharing the program reach each other)', () => {
  // A offers two programs for 17; B, gold 100, offers none (no whole program over 6, 7, 2 gives 100 within MAX_OPS)
  const A = L.prepare(mkRow('m4a', Q(3, 4, 5), '3*4=<<3*4=12>>12\n12+5=<<12+5=17>>17\n#### 17'));
  const B = L.prepare(mkRow('m4b', Q(6, 7, 2), '6*7=<<6*7=42>>42\n42+2=<<42+2=44>>44\n#### 100'));
  assert.equal(A.pats.role, B.pats.role);
  assert.deepEqual(L.offersOf(A).map((p) => p.text), ['add(mul(q0,q1),q2)', 'sub(mul(q1,q2),q0)']);
  assert.deepEqual(L.offersOf(B).map((p) => p.text), []);
  // A's own offers give A's gold: only its own row could reach it, and the leave-one-out never asks its own row
  assert.ok(L.offersOf(A).every((p) => L.fitsGold(I.compile(I.readProgram(p.text))(A.L), A.gold)));
  const t = L.ceilingByCause([A, B]);
  assert.equal(t.reachable, 0);
  assert.equal(t.unreachable, 2);
  assert.equal(Object.values(t.causes).reduce((a, b) => a + b, 0), 2);
  const on = L.ceilingByCause([A, B], { chain: true });
  assert.equal(on.reachable, 0);
  // the control: B with the gold its chain computes shares A's program, and both are reached through the other
  const B2 = L.prepare(mkRow('m4c', Q(6, 7, 2), '6*7=<<6*7=42>>42\n42+2=<<42+2=44>>44\n#### 44'));
  assert.equal(L.ceilingByCause([A, B2]).reachable, 2);
});

test('M6: with the chain programs on a row offers its search programs AND its chain program: the search set is kept whole, the chain text is appended once, and a chain the search already found adds nothing', () => {
  // the chain 4*5-3 is one of the two search programs: on equals off
  const C = L.prepare(mkRow('m6a', Q(3, 4, 5), '4*5=<<4*5=20>>20\n20-3=<<20-3=17>>17\n#### 17'));
  assert.equal(L.chainOf(C).text, 'sub(mul(q1,q2),q0)');
  const offC = L.offersOf(C).map((p) => p.text);
  const onC = L.offersOf(C, { chain: true }).map((p) => p.text);
  assert.deepEqual(offC, ['add(mul(q0,q1),q2)', 'sub(mul(q1,q2),q0)']);
  assert.deepEqual(onC, offC);
  assert.deepEqual(L.chainedCandidatesOf(C).programs.map((p) => p.text), offC);
  // the chain (2+3)*4/2 is not a search program: on is off plus it, last, marked fromChain
  const D = L.prepare(mkRow('m6b', Q(2, 3, 4), '2+3=<<2+3=5>>5\n5*4=<<5*4=20>>20\n20/2=<<20/2=10>>10\n#### 10'));
  assert.equal(L.chainOf(D).text, 'div(mul(add(q0,q1),q2),q0)');
  const offD = L.offersOf(D).map((p) => p.text);
  const onD = L.offersOf(D, { chain: true });
  assert.equal(offD.length, 3);
  assert.ok(!offD.includes('div(mul(add(q0,q1),q2),q0)'));
  assert.deepEqual(onD.map((p) => p.text), [...offD, 'div(mul(add(q0,q1),q2),q0)']);
  assert.equal(onD[onD.length - 1].fromChain, true);
  assert.ok(onD.slice(0, -1).every((p) => !p.fromChain));
  const cc = L.chainedCandidatesOf(D);
  assert.deepEqual(cc.programs.map((p) => p.text), onD.map((p) => p.text));
  assert.equal(cc.searched, true);
  // the control: with the chain programs off, neither row offers its chain beyond what the search found
  assert.deepEqual(L.offersOf(D, { chain: false }).map((p) => p.text), offD);
});

test('M12: ceilingTwoFold reads the OTHER folds only: two rows of one fold that share a program are not reached by each other (the control: the same two rows in different folds are)', () => {
  // ids chosen by foldOf itself, never by hand: two of fold 0, one of fold 1
  const ids = Array.from({ length: 64 }, (_, i) => 'm12-' + i);
  const f0 = ids.filter((id) => L.foldOf(id, 2) === 0).slice(0, 2);
  const f1 = ids.filter((id) => L.foldOf(id, 2) === 1).slice(0, 1);
  assert.equal(f0.length, 2);
  assert.equal(f1.length, 1);
  const a = L.prepare(mkRow(f0[0], Q(3, 4, 5), '3*4=<<3*4=12>>12\n12+5=<<12+5=17>>17\n#### 17'));
  const b = L.prepare(mkRow(f0[1], Q(6, 7, 2), '6*7=<<6*7=42>>42\n42+2=<<42+2=44>>44\n#### 44'));
  const c = L.prepare(mkRow(f1[0], Q(5, 9, 8), '5+9=<<5+9=14>>14\n14+8=<<14+8=22>>22\n#### 22'));
  assert.equal(a.pats.role, b.pats.role);
  assert.equal(a.pats.role, c.pats.role);
  // a and b share add(mul(q0,q1),q2); c's programs give 22 on 5, 9, 8 and neither 17 nor 44 on a and b
  assert.ok(L.offersOf(a).some((p) => p.text === 'add(mul(q0,q1),q2)') && L.offersOf(b).some((p) => p.text === 'add(mul(q0,q1),q2)'));
  assert.ok(L.offersOf(c).length >= 1);
  for (const p of L.offersOf(c)) for (const r of [a, b]) assert.ok(!L.fitsGold(I.compile(I.readProgram(p.text))(r.L), r.gold));
  for (const p of [...L.offersOf(a), ...L.offersOf(b)]) assert.ok(!L.fitsGold(I.compile(I.readProgram(p.text))(c.L), c.gold));
  assert.equal(L.ceilingTwoFold([a, b, c]), 0);
  assert.equal(L.ceilingTwoFold([a, b, c], { chain: true }), 0);
  // the control: a in fold 0 and b2 in fold 1 reach each other across the folds
  const b2 = L.prepare(mkRow(f1[0], Q(6, 7, 2), '6*7=<<6*7=42>>42\n42+2=<<42+2=44>>44\n#### 44'));
  assert.equal(L.ceilingTwoFold([a, b2]), 2);
});

test('M13, M14, M15: chainCandidate refuses a chain past CHAIN.maxOps, a chain that is not whole, and a chain whose steps never compute the gold; each refusal is the one guard, shown by the chain fields', () => {
  // M13: ten quantities summed, a 9-operation chain, ok and whole, past CHAIN.maxOps (8)
  const vals = [3, 4, 5, 6, 7, 8, 9, 2, 11, 12];
  const colours = ['red', 'blue', 'green', 'black', 'pink', 'gray', 'white', 'brown', 'gold', 'teal'];
  const steps = [];
  let acc = vals[0];
  for (const v of vals.slice(1)) { steps.push(`${acc}+${v}=<<${acc}+${v}=${acc + v}>>${acc + v}`); acc += v; }
  const nine = L.prepare(mkRow('m13', 'Ann has ' + vals.map((v, i) => v + ' ' + colours[i] + ' pens').join(', ') + '. How many pens does Ann have?', steps.join('\n') + '\n#### ' + acc));
  const c9 = L.chainOf(nine);
  assert.equal(c9.ok, true);
  assert.equal(c9.whole, true);
  assert.equal(c9.ops, 9);
  assert.ok(c9.ops > L.CHAIN.maxOps);
  assert.ok(I.leavesOf(nine.parse).length <= L.CHAIN.maxLeaves);
  assert.ok(L.fitsGold(I.compile(I.readProgram(c9.text))(nine.L), nine.gold));
  assert.equal(L.chainCandidate(nine), null);
  assert.deepEqual(L.offersOf(nine, { chain: true }).map((p) => p.text), L.offersOf(nine).map((p) => p.text));
  // M14: the chain 3*4 computes the gold 12 and reads no q2: ok, one operation, not whole
  const part = L.prepare(mkRow('m14', Q(3, 4, 5), '3*4=<<3*4=12>>12\n#### 12'));
  const cp = L.chainOf(part);
  assert.equal(cp.ok, true);
  assert.equal(cp.whole, false);
  assert.equal(cp.text, 'mul(q0,q1)');
  assert.ok(I.acceptable(I.compile(I.readProgram(cp.text))(part.L), part.L, 'whole'));
  assert.equal(L.chainCandidate(part), null);
  assert.deepEqual(L.offersOf(part, { chain: true }).map((p) => p.text), L.offersOf(part).map((p) => p.text));
  // M15: the same steps against a gold no step computes: the chain itself is refused with the exact reason, so the
  // gold fit in chainCandidate is a second lock on the door chainProgram already locks (the mutant alone is silent;
  // this pins the first lock, and the pair)
  const off = L.prepare(mkRow('m15', Q(3, 4, 5), '3*4=<<3*4=12>>12\n12+5=<<12+5=17>>17\n#### 18'));
  const co = L.chainOf(off);
  assert.equal(co.ok, false);
  assert.equal(co.reason, 'no step of the chain computes the gold on the prompt numbers');
  assert.equal(L.chainCandidate(off), null);
  // the control: the whole 2-operation chain that computes its gold is the candidate, by its exact fields
  const good = L.prepare(mkRow('m15c', Q(3, 4, 5), '3*4=<<3*4=12>>12\n12+5=<<12+5=17>>17\n#### 17'));
  assert.deepEqual(L.chainCandidate(good), { text: 'add(mul(q0,q1),q2)', ops: 2, chain: true, fromChain: true });
});
