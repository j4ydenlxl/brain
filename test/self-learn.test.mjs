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
