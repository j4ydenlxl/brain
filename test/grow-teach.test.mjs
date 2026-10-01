// test/grow-teach.test.mjs: THE TEACHER (grow/teach.mjs, grow/NEO.md "Self-opened tasks") against stub roots.
// His words it serves (2026-10-01, NEO.md): "every gap in my vision can be filled by the octopus being itself".
// Every test builds a temporary root (judge/dev/ with locked class names, a syllabus, a ledger, task directories an arm
// would write under work/grow/gen-<n>/teach/) and passes its own runOrganism stub, so no model, no network and nothing of
// the real neo/ is touched; the CLI runs with --root <tmp>. The seed checks read the real neo/syllabus.jsonl only.
// What it holds the teacher to: every refusal with its reason, the move (three files, nothing else), the ledger shas
// (CRLF read as LF), idempotence, the norm level 1 overlap rule, the skill cap, frontier's order, round-robin and
// exhaustion, the brief's required strings, the CLI exit codes, and that no verb opens judge/heldout/,
// judge/control.jsonl, state/ or neo/tasks/*/heldout.jsonl. Temp roots live under os.tmpdir() and are removed on exit.
// Author: Opus 5.5 builder (the teacher) for the Fable 5.1 orchestrator, 2026-10-01, his NEO order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  TASK_RE, SYLLABUS, LEDGER, TASKS_DIR, TASK_FILES, MIN_ROWS, BRIEF_ROWS, SKILL_CAP, DEFAULTS, ALREADY, OPENED_MARK, REFUSED_MARK,
  normQ, shaText, lockedClasses, readSyllabus, rowErrors, validateTaskDir, intake, frontier, status, teachBrief, main,
} from '../grow/teach.mjs';
import { conciseDirective, runNode, why1, lastJson } from '../grow/generation.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-teach-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS cleans tmp */ } });
const LOCKED = ['capital-of', 'code', 'math'];
const EM = String.fromCharCode(0x2014);
const jsonl = (rows, eol = '\n') => rows.map((r) => (typeof r === 'string' ? r : JSON.stringify(r))).join(eol) + eol;
const read = (f) => fs.readFileSync(f, 'utf8');
const readJ = (f) => JSON.parse(read(f));

let seq = 0;
/** A stub root: locked class names in judge/dev/ (sentinel contents never to be read), a syllabus, a ledger. */
function stubRoot({ syllabus = [], ledger = { tasks: [], generated: 0 } } = {}) {
  const root = path.join(TMP, 'root-' + ++seq);
  for (const c of LOCKED) { fs.mkdirSync(path.join(root, 'judge', 'dev'), { recursive: true }); fs.writeFileSync(path.join(root, 'judge', 'dev', c + '.jsonl'), 'DEV-SENTINEL-NEVER-READ\n'); }
  fs.mkdirSync(path.join(root, 'neo'), { recursive: true });
  fs.writeFileSync(path.join(root, SYLLABUS), jsonl(syllabus));
  if (ledger !== null) fs.writeFileSync(path.join(root, LEDGER), JSON.stringify(ledger, null, 2) + '\n');
  return root;
}
const skillRow = (skill, domain = 'arithmetic') => ({ skill, domain, hint: 'A prompt asking ' + skill + '; the answer states it.', by: 'seed', at: '2026-10-01T00:00:00.000Z' });
const devRows = (n = MIN_ROWS.dev, off = 10) => Array.from({ length: n }, (_, i) => { const a = off + i, b = 7; return { q: 'what is ' + a + ' plus ' + b, expect: { contains: [String(a + b)], notRefusal: true }, answer: a + ' plus ' + b + ' is ' + (a + b) + '.' }; });
const heldRows = (n = MIN_ROWS.heldout, off = 50) => Array.from({ length: n }, (_, i) => { const a = off + i, b = 9; return { q: 'add ' + a + ' and ' + b, expect: { contains: [String(a + b)], notRefusal: true }, answer: 'The sum of ' + a + ' and ' + b + ' is ' + (a + b) + '.' }; });
const taskJson = (name, gen = 1, extra = {}) => ({ task: name, skill: name, domain: 'arithmetic', rule: 'the answer is the sum of the two numbers in the prompt', generation: gen, by: 'teach-g' + gen + '-b1', ...extra });
const teachDir = (root, gen = 1) => path.join(root, 'work', 'grow', 'gen-' + gen, 'teach');
/** What an arm writes: work/grow/gen-<gen>/teach/<name>/ with task.json, dev.jsonl, heldout.jsonl and next.jsonl. */
function writeTask(root, name, { gen = 1, task = taskJson(name, gen), dev = devRows(), heldout = heldRows(), next = [], eol = '\n', omit = [] } = {}) {
  const dir = path.join(teachDir(root, gen), name);
  fs.mkdirSync(dir, { recursive: true });
  if (!omit.includes('task.json')) fs.writeFileSync(path.join(dir, 'task.json'), typeof task === 'string' ? task : JSON.stringify(task, null, 2) + '\n');
  if (!omit.includes('dev.jsonl')) fs.writeFileSync(path.join(dir, 'dev.jsonl'), jsonl(dev, eol));
  if (!omit.includes('heldout.jsonl')) fs.writeFileSync(path.join(dir, 'heldout.jsonl'), jsonl(heldout, eol));
  if (next.length) fs.writeFileSync(path.join(dir, 'next.jsonl'), jsonl(next));
  return dir;
}
/** A stub organism: answers the prompts in `answers` (q -> text), refuses the rest; records what it was asked. */
function stubOrganism(answers = {}) {
  const asked = [];
  const run = async (rows) => { asked.push(rows.map((r) => r.q)); return { rows: rows.map((r) => ({ q: r.q, got: Object.hasOwn(answers, r.q) ? answers[r.q] : 'nothing in memory matches that yet' })) }; };
  return { run, asked };
}
/** An organism that adds the two numbers of every prompt: it answers every row of devRows right. */
const adder = async (rows) => ({ rows: rows.map((r) => { const m = /(\d+)\D+(\d+)/.exec(r.q); return { q: r.q, got: m ? 'It is ' + (Number(m[1]) + Number(m[2])) + '.' : null }; }) });
const refusedOf = (out, task) => out.refused.find((r) => r.task === task);
const whyHas = (out, task, re) => { const r = refusedOf(out, task); assert.ok(r, task + ' is refused: ' + JSON.stringify(out)); assert.ok(r.why.some((w) => re.test(w)), task + ': ' + JSON.stringify(r.why) + ' names ' + re); };
const cli = (args) => runNode(BRAIN, 'grow/teach.mjs', args, { timeout: 60000 });

// ---- the seed (the real neo/syllabus.jsonl)
const SEED = fs.readFileSync(path.join(BRAIN, SYLLABUS), 'utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));

test('the seed: at least 300 skills, unique valid names, no locked class, every row with a domain, a one-sentence hint, by seed and a stamp', () => {
  assert.ok(SEED.length >= 300, 'rows: ' + SEED.length);
  const names = SEED.map((r) => r.skill);
  assert.equal(new Set(names).size, names.length, 'skills are unique');
  const locked = new Set(lockedClasses(BRAIN));
  assert.ok(locked.size > 0, 'the real tree has locked classes in judge/dev/');
  for (const r of SEED) {
    assert.match(r.skill, TASK_RE);
    assert.ok(!locked.has(r.skill), r.skill + ' is a locked class');
    assert.equal(typeof r.domain, 'string'); assert.ok(r.domain.trim());
    assert.equal(typeof r.hint, 'string'); assert.ok(r.hint.trim().length > 20, r.skill + ' has a hint');
    assert.ok(r.hint.trim().endsWith('.'), r.skill + ': the hint is one sentence ending in a period');
    const bare = r.hint.replace(/"[^"]*"/g, '""').replace(/\.\.\./g, ''); // a quoted example prompt or an ellipsis is not a sentence end
    assert.equal((bare.match(/\.\s+[A-Z]/g) || []).length, 0, r.skill + ': the hint is one sentence');
    assert.ok(!r.hint.includes(EM), r.skill + ': no em dash');
    assert.equal(r.by, 'seed');
    assert.ok(!Number.isNaN(Date.parse(r.at)), r.skill + ' has an ISO stamp');
  }
  assert.equal(readSyllabus(BRAIN).rows.length, SEED.length, 'readSyllabus keeps every seed row');
});

test('the seed is round-robin across domains: no domain runs ahead of another that still has skills, and the first rows span every domain', () => {
  const left = new Map();
  for (const r of SEED) left.set(r.domain, (left.get(r.domain) || 0) + 1);
  const D = left.size;
  assert.ok(D >= 25, 'domains: ' + D);
  assert.equal(new Set(SEED.slice(0, D).map((r) => r.domain)).size, D, 'the first ' + D + ' rows hold every domain once');
  const seen = new Map([...left.keys()].map((d) => [d, 0]));
  SEED.forEach((r, i) => {
    seen.set(r.domain, seen.get(r.domain) + 1);
    const open = [...left.keys()].filter((d) => seen.get(d) < left.get(d) || d === r.domain);
    const counts = open.map((d) => seen.get(d));
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, 'row ' + (i + 1) + ' (' + r.skill + '): a domain ran ahead');
  });
  const ledger = readJ(path.join(BRAIN, LEDGER));
  assert.ok(Array.isArray(ledger.tasks) && Number.isFinite(ledger.generated), 'neo/LEDGER.json is { tasks: [..], generated }');
});

// ---- the rules
test('norm level 1 and the sha: lower case, punctuation gone, spaces collapsed; CRLF reads as LF', () => {
  assert.equal(normQ('  What IS 12 + 3?!  '), 'what is 12 3');
  assert.equal(normQ('add\t1,  and\n2.'), 'add 1 and 2');
  assert.equal(normQ('Café: ÉTÉ'), 'café été');
  assert.equal(normQ('???'), '');
  const lf = 'a\nb\n';
  assert.equal(shaText('a\r\nb\r\n'), shaText(lf));
  assert.equal(shaText(lf), createHash('sha256').update(lf).digest('hex'));
  assert.notEqual(shaText('a\nb\n'), shaText('a\nc\n'));
});

test('rowErrors: a well formed row passes; a refusal, a failed expect, an unknown clause, an empty answer and a forbidden pattern each fail with a reason', () => {
  assert.deepEqual(rowErrors(devRows(1)[0]), []);
  const base = { q: 'what is 1 plus 1', expect: { contains: ['2'], notRefusal: true }, answer: '1 plus 1 is 2.' };
  assert.ok(rowErrors({ ...base, answer: 'I do not carry that yet: 2' }).some((w) => /refusal/.test(w)));
  assert.ok(rowErrors({ ...base, answer: '1 plus 1 is 3.' }).some((w) => /fails its own expect/.test(w)));
  assert.ok(rowErrors({ ...base, expect: { includes: ['2'] } }).some((w) => /unknown clause includes/.test(w)));
  assert.ok(rowErrors({ ...base, answer: '   ' }).some((w) => /answer is not a non-empty string/.test(w)));
  assert.ok(rowErrors({ ...base, q: '' }).some((w) => /q is not/.test(w)));
  assert.ok(rowErrors({ ...base, q: '?!' }).some((w) => /empty under norm level 1/.test(w)));
  assert.ok(rowErrors({ ...base, answer: 'the process gives 2.' }).some((w) => /answer uses process/.test(w)));
  assert.ok(rowErrors(null).some((w) => /not a JSON object/.test(w)));
});

// ---- intake: the move, the ledger, idempotence
test('intake opens a valid task: the three files move to neo/tasks/<task>/, the ledger freezes their shas (CRLF as LF), next.jsonl stays in work/', async () => {
  const root = stubRoot();
  const dir = writeTask(root, 'add-two-numbers', { eol: '\r\n', next: [skillRow('add-four-numbers'), skillRow('add-negative-numbers')] });
  fs.writeFileSync(path.join(dir, 'notes.md'), 'arm notes\n');
  const org = stubOrganism({ 'what is 10 plus 7': 'It is 17.' });
  const out = await intake(root, { gen: 1, runOrganism: org.run, now: () => '2026-10-01T12:00:00.000Z' });
  assert.deepEqual(out.opened, ['add-two-numbers']);
  assert.deepEqual(out.refused, []);
  assert.equal(out.baseline, 'asked');
  const dest = path.join(root, TASKS_DIR, 'add-two-numbers');
  assert.deepEqual(fs.readdirSync(dest).sort(), [...TASK_FILES].sort(), 'only the three files move');
  for (const f of TASK_FILES) assert.ok(!fs.existsSync(path.join(dir, f)), f + ' left work/');
  assert.deepEqual(fs.readdirSync(dir).sort(), ['next.jsonl', 'notes.md', OPENED_MARK].sort());
  const led = readJ(path.join(root, LEDGER));
  assert.equal(led.tasks.length, 1);
  const row = led.tasks[0];
  assert.deepEqual(Object.keys(row).slice(0, 8), ['task', 'generation', 'devSha', 'heldoutSha', 'dev', 'heldout', 'by', 'at']);
  assert.equal(row.task, 'add-two-numbers'); assert.equal(row.generation, 1); assert.equal(row.by, 'teach-g1-b1'); assert.equal(row.at, '2026-10-01T12:00:00.000Z');
  assert.equal(row.dev, MIN_ROWS.dev); assert.equal(row.heldout, MIN_ROWS.heldout);
  assert.equal(row.devSha, shaText(read(path.join(dest, 'dev.jsonl'))));
  assert.equal(row.devSha, createHash('sha256').update(jsonl(devRows())).digest('hex'), 'the CRLF file hashes as its LF text');
  assert.equal(row.heldoutSha, createHash('sha256').update(jsonl(heldRows())).digest('hex'));
  assert.deepEqual(row.baseline, { n: MIN_ROWS.dev, ok: 1, score: 0.05 });
  assert.equal(led.generated, 0, 'generated is kept');
  assert.equal(org.asked.length, 1, 'the organism is asked once');
  assert.equal(org.asked[0].length, MIN_ROWS.dev, 'only the dev prompts are asked');
  assert.ok(org.asked[0].every((q) => !/^add /.test(q)), 'no held-out prompt reaches the organism');
  assert.equal(out.added, 2);
  const syl = readSyllabus(root).rows;
  assert.deepEqual(syl.map((r) => r.skill), ['add-four-numbers', 'add-negative-numbers']);
  assert.equal(syl[0].by, 'gen-1/add-two-numbers'); assert.equal(syl[0].at, '2026-10-01T12:00:00.000Z');
});

test('intake is idempotent: a second run opens nothing new, refuses nothing it moved, and leaves the ledger and the syllabus byte for byte', async () => {
  const root = stubRoot();
  writeTask(root, 'add-two-numbers', { next: [skillRow('add-four-numbers')] });
  const one = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  assert.deepEqual(one.opened, ['add-two-numbers']);
  const ledger = read(path.join(root, LEDGER)), syllabus = read(path.join(root, SYLLABUS));
  const org = stubOrganism();
  const two = await intake(root, { gen: 1, runOrganism: org.run });
  assert.deepEqual(two.opened, []);
  assert.deepEqual(two.refused, []);
  assert.equal(two.already, 1);
  assert.equal(two.baseline, 'nothing to ask');
  assert.equal(org.asked.length, 0, 'nothing is asked twice');
  assert.equal(read(path.join(root, LEDGER)), ledger);
  assert.equal(read(path.join(root, SYLLABUS)), syllabus);
});

// ---- intake: every refusal with its reason
test('refused: a name that is not a task name, a locked class name, and a name already in the ledger; each stays in work/ with refused.json', async () => {
  const root = stubRoot({ ledger: { tasks: [{ task: 'taken-task', generation: 1 }], generated: 0 } });
  for (const name of ['Bad_Name', 'ab', 'math', 'taken-task']) writeTask(root, name);
  const out = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  assert.deepEqual(out.opened, []);
  whyHas(out, 'Bad_Name', /is not \//);
  whyHas(out, 'ab', /is not \//);
  whyHas(out, 'math', /is a locked class/);
  whyHas(out, 'taken-task', /already in the ledger/);
  for (const name of ['Bad_Name', 'ab', 'math', 'taken-task']) {
    const dir = path.join(teachDir(root), name);
    for (const f of TASK_FILES) assert.ok(fs.existsSync(path.join(dir, f)), name + '/' + f + ' stays in work/');
    const r = readJ(path.join(dir, REFUSED_MARK));
    assert.equal(r.task, name); assert.ok(r.why.length >= 1);
  }
  assert.ok(!fs.existsSync(path.join(root, TASKS_DIR)), 'nothing moved');
  assert.equal(readJ(path.join(root, LEDGER)).tasks.length, 1, 'the ledger is unchanged');
});

test('refused: under the dev minimum and under the held-out minimum', async () => {
  const root = stubRoot();
  writeTask(root, 'short-dev', { dev: devRows(MIN_ROWS.dev - 1) });
  writeTask(root, 'short-held', { heldout: heldRows(MIN_ROWS.heldout - 1) });
  const out = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  whyHas(out, 'short-dev', new RegExp('dev\\.jsonl has ' + (MIN_ROWS.dev - 1) + ' rows, under ' + MIN_ROWS.dev));
  whyHas(out, 'short-held', new RegExp('heldout\\.jsonl has ' + (MIN_ROWS.heldout - 1) + ' rows, under ' + MIN_ROWS.heldout));
  assert.deepEqual(out.opened, []);
});

test('refused: an answer that fails its own expect, a refusal as an answer, an empty answer, an unknown clause, a forbidden pattern', async () => {
  const root = stubRoot();
  const bad = (i, patch) => devRows().map((r, j) => (j === i ? { ...r, ...patch } : r));
  writeTask(root, 'fails-expect', { dev: bad(3, { answer: 'It is 1000.' }) });
  writeTask(root, 'refusal-answer', { heldout: heldRows().map((r, j) => (j === 0 ? { ...r, answer: 'nothing in memory matches ' + r.answer } : r)) });
  writeTask(root, 'empty-answer', { dev: bad(0, { answer: '' }) });
  writeTask(root, 'unknown-clause', { dev: bad(5, { expect: { has: ['17'] } }) });
  writeTask(root, 'forbidden-word', { dev: bad(2, { answer: '12 plus 7 is 19, the eval( of it.' }) });
  const out = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  assert.deepEqual(out.opened, []);
  whyHas(out, 'fails-expect', /dev\.jsonl line 4: the answer fails its own expect/);
  whyHas(out, 'refusal-answer', /heldout\.jsonl line 1: the answer is a refusal/);
  whyHas(out, 'empty-answer', /dev\.jsonl line 1: answer is not a non-empty string/);
  whyHas(out, 'unknown-clause', /dev\.jsonl line 6: expect: unknown clause has/);
  whyHas(out, 'forbidden-word', /answer uses eval\(\)/);
});

test('the overlap rule: a held-out prompt equal to a dev prompt under norm level 1 is refused, so is a prompt repeated inside a set', async () => {
  const root = stubRoot();
  const held = heldRows(); held[4] = { ...held[4], q: 'What is 12 plus 7?', answer: '12 plus 7 is 19.', expect: { contains: ['19'] } };
  writeTask(root, 'leaky-held', { heldout: held });
  const dev = devRows(MIN_ROWS.dev + 1); dev[MIN_ROWS.dev] = { ...dev[0], q: '  WHAT is 10, plus 7!! ' };
  writeTask(root, 'dup-dev', { dev });
  const held2 = heldRows(); held2[9] = { ...held2[2], q: 'Add 52 and 9.' };
  writeTask(root, 'dup-held', { heldout: held2 });
  writeTask(root, 'clean-task');
  const out = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  whyHas(out, 'leaky-held', /heldout\.jsonl row 5 is a dev prompt under norm level 1/);
  whyHas(out, 'dup-dev', /dev\.jsonl repeats a prompt under norm level 1: row 21 is row 1/);
  whyHas(out, 'dup-held', /heldout\.jsonl repeats a prompt under norm level 1: row 10 is row 3/);
  assert.deepEqual(out.opened, ['clean-task'], 'a prompt that differs after norm level 1 is no overlap');
});

test('refused: task.json missing, naming another task, an invalid skill, or another generation', async () => {
  const root = stubRoot();
  writeTask(root, 'no-task-json', { omit: ['task.json'] });
  writeTask(root, 'wrong-task', { task: taskJson('other-task') });
  writeTask(root, 'bad-skill', { task: taskJson('bad-skill', 1, { skill: 'No Skill' }) });
  writeTask(root, 'wrong-gen', { task: taskJson('wrong-gen', 2) });
  writeTask(root, 'no-dev', { omit: ['dev.jsonl'] });
  const out = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  assert.deepEqual(out.opened, []);
  whyHas(out, 'no-task-json', /task\.json is missing/);
  whyHas(out, 'wrong-task', /task\.json task is not the directory name wrong-task/);
  whyHas(out, 'bad-skill', /task\.json skill is not a skill name/);
  whyHas(out, 'wrong-gen', /task\.json generation is not 1/);
  whyHas(out, 'no-dev', /^no dev\.jsonl$/);
});

test('refused: the organism already answers the whole dev set; the task stays in work/, refused.json marks the skill answered, and frontier skips it', async () => {
  const root = stubRoot({ syllabus: [skillRow('add-two-numbers'), skillRow('add-three-numbers')] });
  writeTask(root, 'add-two-numbers');
  const out = await intake(root, { gen: 1, runOrganism: adder });
  assert.deepEqual(out.opened, []);
  assert.deepEqual(refusedOf(out, 'add-two-numbers').why, [ALREADY]);
  const dir = path.join(teachDir(root), 'add-two-numbers');
  for (const f of TASK_FILES) assert.ok(fs.existsSync(path.join(dir, f)));
  const r = readJ(path.join(dir, REFUSED_MARK));
  assert.equal(r.answered, true); assert.equal(r.skill, 'add-two-numbers');
  assert.deepEqual(r.baseline, { n: MIN_ROWS.dev, ok: MIN_ROWS.dev, score: 1 });
  assert.equal(readJ(path.join(root, LEDGER)).tasks.length, 0);
  const f = frontier(root, { gen: 2 });
  assert.deepEqual(readJ(path.join(root, f.plan)).briefs.flatMap((b) => b.skills), ['add-three-numbers']);
  assert.equal(status(root).answered, 1);
});

test('the organism answers part of the dev set: opened, with that baseline in the ledger', async () => {
  const root = stubRoot();
  writeTask(root, 'add-two-numbers');
  const answers = Object.fromEntries(devRows().slice(0, 5).map((r) => [r.q, r.answer]));
  const out = await intake(root, { gen: 1, runOrganism: stubOrganism(answers).run });
  assert.deepEqual(out.opened, ['add-two-numbers']);
  assert.deepEqual(readJ(path.join(root, LEDGER)).tasks[0].baseline, { n: MIN_ROWS.dev, ok: 5, score: 0.25 });
});

test('when the organism cannot be asked the task is still opened, with baseline null and the reason in the ledger row', async () => {
  const root = stubRoot();
  writeTask(root, 'add-two-numbers');
  const out = await intake(root, { gen: 1, runOrganism: async () => { throw new Error('the pack is gone\nstack line'); } });
  assert.deepEqual(out.opened, ['add-two-numbers']);
  assert.equal(out.baseline, 'the organism could not be asked: the pack is gone');
  const row = readJ(path.join(root, LEDGER)).tasks[0];
  assert.equal(row.baseline, null);
  assert.equal(row.baselineWhy, 'the organism could not be asked: the pack is gone');
});

test('a refused task the arm fixes is opened by a later run, and its refused.json goes; a neo/tasks/ directory with no ledger row is refused', async () => {
  const root = stubRoot();
  writeTask(root, 'fixed-later', { dev: devRows(5) });
  const one = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  whyHas(one, 'fixed-later', /under/);
  writeTask(root, 'fixed-later');
  const two = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  assert.deepEqual(two.opened, ['fixed-later']);
  assert.ok(!fs.existsSync(path.join(teachDir(root), 'fixed-later', REFUSED_MARK)));
  fs.mkdirSync(path.join(root, TASKS_DIR, 'orphan-task'), { recursive: true });
  writeTask(root, 'orphan-task');
  const three = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  whyHas(three, 'orphan-task', /already exists but the ledger has no row/);
  assert.equal(readJ(path.join(root, LEDGER)).tasks.length, 1);
});

// ---- the syllabus grows
test('next.jsonl: valid new skills are appended once (deduplicated against the syllabus and each other); malformed rows and locked names are dropped', async () => {
  const root = stubRoot({ syllabus: [skillRow('already-there')] });
  writeTask(root, 'task-one', { next: [skillRow('already-there'), skillRow('new-skill-a'), skillRow('new-skill-a'), { skill: 'Bad Name', domain: 'x', hint: 'h.' }, { skill: 'no-hint', domain: 'x' }, skillRow('math'), 'not json'] });
  writeTask(root, 'task-two', { heldout: heldRows(MIN_ROWS.heldout, 80), next: [skillRow('new-skill-a'), skillRow('new-skill-b', 'text')] });
  const out = await intake(root, { gen: 1, runOrganism: stubOrganism().run, now: () => '2026-10-01T12:30:00.000Z' });
  assert.deepEqual(out.opened, ['task-one', 'task-two']);
  assert.equal(out.added, 2);
  assert.equal(out.syllabus, 3);
  const rows = readSyllabus(root).rows;
  assert.deepEqual(rows.map((r) => [r.skill, r.by]), [['already-there', 'seed'], ['new-skill-a', 'gen-1/task-one'], ['new-skill-b', 'gen-1/task-two']]);
  assert.ok(rows.slice(1).every((r) => r.at === '2026-10-01T12:30:00.000Z' && r.domain && r.hint));
});

test('the cap: at most SKILL_CAP new skills a generation, counted across intake runs, and printed when it binds', async () => {
  const root = stubRoot();
  const many = Array.from({ length: SKILL_CAP + 5 }, (_, i) => skillRow('cap-skill-' + i));
  writeTask(root, 'task-one', { next: many });
  const one = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  assert.equal(one.added, SKILL_CAP);
  assert.equal(one.cap, 'at most ' + SKILL_CAP + ' new skills a generation: 5 left out');
  writeTask(root, 'task-two', { heldout: heldRows(MIN_ROWS.heldout, 80), next: [skillRow('one-more-skill')] });
  const two = await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  assert.deepEqual(two.opened, ['task-two']);
  assert.equal(two.added, 0);
  assert.equal(two.cap, 'at most ' + SKILL_CAP + ' new skills a generation: 1 left out');
  writeTask(root, 'task-three', { gen: 2, next: [skillRow('one-more-skill')] });
  const three = await intake(root, { gen: 2, runOrganism: stubOrganism().run });
  assert.equal(three.added, 1, 'a new generation has its own cap');
  assert.equal(three.cap, undefined, 'no cap line when it does not bind');
  assert.equal(readSyllabus(root).rows.length, SKILL_CAP + 1);
});

// ---- frontier
test('frontier: the next k*per skills in syllabus order that no ledger task carries (task.json skill and task name) and no locked class, as briefs and plan.json', async () => {
  const syllabus = ['s-a1', 's-b1', 's-c1', 's-a2', 'math', 's-b2', 's-c2', 's-a3', 'opened-name', 's-b3'].map((s, i) => skillRow(s, ['a', 'b', 'c'][i % 3]));
  const root = stubRoot({ syllabus, ledger: { tasks: [{ task: 'opened-task', generation: 1 }, { task: 'opened-name', generation: 1 }], generated: 7 } });
  fs.mkdirSync(path.join(root, TASKS_DIR, 'opened-task'), { recursive: true });
  fs.writeFileSync(path.join(root, TASKS_DIR, 'opened-task', 'task.json'), JSON.stringify(taskJson('opened-task', 1, { skill: 's-b1' })));
  const out = frontier(root, { gen: 3, k: 2, per: 3 });
  assert.deepEqual(out, { generation: 3, briefs: 2, skills: 6, syllabus: 10, opened: 2, plan: 'work/grow/gen-3/teach/plan.json' });
  const plan = readJ(path.join(root, out.plan));
  assert.equal(plan.generation, 3);
  assert.deepEqual(plan.briefs, [
    { brief: 'work/grow/gen-3/teach/brief-1.md', skills: ['s-a1', 's-c1', 's-a2'], dir: 'work/grow/gen-3/teach/' },
    { brief: 'work/grow/gen-3/teach/brief-2.md', skills: ['s-b2', 's-c2', 's-a3'], dir: 'work/grow/gen-3/teach/' },
  ]);
  for (const b of plan.briefs) for (const s of b.skills) assert.ok(read(path.join(root, b.brief)).includes('`' + s + '`'));
  const small = frontier(root, { gen: 3, k: 5, per: 3 });
  assert.equal(small.briefs, 3);
  assert.deepEqual(readJ(path.join(root, small.plan)).briefs.map((b) => b.skills.length), [3, 3, 1], 'the last brief holds what is left');
});

test('frontier over the real seed: the default briefs span a spread of domains, round-robin, not one domain first', () => {
  const root = stubRoot({ syllabus: SEED });
  const out = frontier(root, { gen: 1 });
  assert.equal(out.briefs, DEFAULTS.k);
  assert.equal(out.skills, DEFAULTS.k * DEFAULTS.per);
  const bySkill = new Map(SEED.map((r) => [r.skill, r.domain]));
  const picked = readJ(path.join(root, out.plan)).briefs.flatMap((b) => b.skills);
  const domains = new Set(SEED.map((r) => r.domain));
  assert.equal(new Set(picked.map((s) => bySkill.get(s))).size, Math.min(picked.length, domains.size), 'every picked skill opens a new domain until the domains run out');
  assert.deepEqual(picked, SEED.slice(0, picked.length).map((r) => r.skill), 'syllabus order');
});

test('frontier exhaustion: with every skill opened it prints briefs 0, writes an empty plan and leaves no stale brief', async () => {
  const root = stubRoot({ syllabus: [skillRow('only-skill')] });
  const before = frontier(root, { gen: 1 });
  assert.equal(before.briefs, 1);
  assert.ok(fs.existsSync(path.join(teachDir(root), 'brief-1.md')));
  writeTask(root, 'only-skill');
  assert.deepEqual((await intake(root, { gen: 1, runOrganism: stubOrganism().run })).opened, ['only-skill']);
  const after = frontier(root, { gen: 1 });
  assert.equal(after.briefs, 0);
  assert.equal(after.skills, 0);
  assert.equal(after.opened, 1);
  assert.deepEqual(readJ(path.join(root, after.plan)), { generation: 1, briefs: [] });
  assert.ok(!fs.existsSync(path.join(teachDir(root), 'brief-1.md')), 'the stale brief is gone');
  assert.deepEqual(status(root), { syllabus: 1, opened: 1, pending: 0, tasks: ['only-skill'], answered: 0 });
});

test('the brief carries every required string: the directive, the skills, the files, the counts, the learnable rules, the forbidden paths, the one line back', () => {
  const skills = [skillRow('add-two-numbers'), skillRow('reverse-a-string', 'text')];
  const b = teachBrief({ n: 4, i: 2, skills, directive: conciseDirective(BRAIN), locked: LOCKED });
  const must = [
    '[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]', 'TEACHER arm 2 of generation 4', 'NO model call',
    '`add-two-numbers` (arithmetic): ' + skills[0].hint, '`reverse-a-string` (text): ' + skills[1].hint,
    'work/grow/gen-4/teach/<task>/', '`task.json`', '`dev.jsonl`: ' + BRIEF_ROWS.dev + ' rows', '`heldout.jsonl`: ' + BRIEF_ROWS.heldout + ' rows', '`next.jsonl`: at least ' + BRIEF_ROWS.next + ' rows',
    '"generation": 4', '"by": "teach-g4-b2"', '{ "q": <the prompt>, "expect": <clauses>, "answer": <the answer> }',
    'FUNCTION of the prompt', 'computed', 'looked up', 'templated', 'VARIED wording', 'OTHER instances of the same shape', 'other numbers, other subjects', 'never a dev prompt',
    'norm level 1', 'plain digits', '"notRefusal": true', '`contains`', 'full sentence a person would read',
    '`judge/heldout/`', '`judge/control.jsonl`', '`state/`', '`neo/tasks/*/heldout.jsonl`', 'capital-of, code, math',
    'node grow/teach.mjs check work/grow/gen-4/teach/add-two-numbers', 'node grow/generation.mjs ask', ALREADY, 'One line: the task names you wrote',
  ];
  for (const s of must) assert.ok(b.includes(s), 'the brief says ' + JSON.stringify(s));
  assert.ok(b.startsWith('[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]'), 'the directive comes first');
  assert.ok(!b.includes(EM), 'no em dash');
});

// ---- status
test('status: { syllabus, opened, pending, tasks } from the syllabus and the ledger', async () => {
  const root = stubRoot({ syllabus: [skillRow('add-two-numbers'), skillRow('s-two'), skillRow('s-three'), skillRow('s-two'), 'broken line'] });
  assert.deepEqual(status(root), { syllabus: 3, opened: 0, pending: 3, tasks: [], answered: 0 });
  writeTask(root, 'add-two-numbers');
  await intake(root, { gen: 1, runOrganism: stubOrganism().run });
  assert.deepEqual(status(root), { syllabus: 3, opened: 1, pending: 2, tasks: ['add-two-numbers'], answered: 0 });
  const empty = stubRoot({ ledger: null });
  assert.deepEqual(status(empty), { syllabus: 0, opened: 0, pending: 0, tasks: [], answered: 0 });
  fs.writeFileSync(path.join(empty, LEDGER), '{ not json');
  await assert.rejects(() => main(['status', '--root', empty]), /is not JSON/);
});

// ---- no verb opens what only the selector reads
test('intake, frontier, status and check never open judge/heldout/, judge/control.jsonl, state/, judge/dev/ files or a neo/tasks/*/heldout.jsonl', async () => {
  const root = stubRoot({ syllabus: [skillRow('add-two-numbers'), skillRow('next-skill')] });
  fs.mkdirSync(path.join(root, 'judge', 'heldout'), { recursive: true });
  fs.writeFileSync(path.join(root, 'judge', 'heldout', 'math.jsonl'), 'HELDOUT-SENTINEL\n');
  fs.writeFileSync(path.join(root, 'judge', 'control.jsonl'), 'CONTROL-SENTINEL\n');
  fs.mkdirSync(path.join(root, 'state', 'grow'), { recursive: true });
  fs.writeFileSync(path.join(root, 'state', 'grow', 'x.json'), '{}');
  writeTask(root, 'add-two-numbers');
  const seen = [];
  const names = ['readFileSync', 'openSync', 'readdirSync', 'statSync', 'existsSync', 'createReadStream'];
  const orig = Object.fromEntries(names.map((k) => [k, fs[k]]));
  for (const k of names) fs[k] = function (p, ...rest) { seen.push(k + ' ' + String(p)); return orig[k].call(this, p, ...rest); };
  try {
    await intake(root, { gen: 1, runOrganism: stubOrganism().run });
    frontier(root, { gen: 2 });
    status(root);
    writeTask(root, 'next-skill', { gen: 2 });
    try { await main(['check', path.join(teachDir(root, 2), 'next-skill'), '--root', root]); } catch { /* the check result is not this test's */ }
    await intake(root, { gen: 2, runOrganism: stubOrganism().run });
  } finally { for (const k of names) fs[k] = orig[k]; }
  assert.ok(seen.length > 0, 'the recorder saw the verbs read');
  const bad = seen.filter((s) => /judge[\\/]heldout|control\.jsonl|[\\/]state([\\/]|$)|neo[\\/]tasks[\\/][^\\/]+[\\/]heldout\.jsonl|readFileSync .*judge[\\/]dev[\\/]/.test(s));
  assert.deepEqual(bad, []);
  assert.ok(fs.existsSync(path.join(root, TASKS_DIR, 'add-two-numbers', 'heldout.jsonl')), 'the moved held-out set is there, unread');
});

// ---- the CLI
test('CLI exit codes: --help 0, an unknown verb 2, an unknown flag 2, a bad --k or --gen 2, status 0 with one JSON line', () => {
  const root = stubRoot({ syllabus: [skillRow('one-skill')] });
  const h = cli(['--help']);
  assert.equal(h.code, 0); assert.match(h.stdout, /^usage: node grow\/teach\.mjs/);
  const v = cli(['teach-me', '--root', root]);
  assert.equal(v.code, 2); assert.match(why1(v), /unknown verb teach-me/);
  assert.equal(cli(['status', '--nope', '--root', root]).code, 2);
  const k = cli(['frontier', '--k', '0', '--root', root]);
  assert.equal(k.code, 2); assert.match(why1(k), /--k is an integer from 1 to/);
  assert.equal(cli(['intake', '--gen', 'x', '--root', root]).code, 2);
  assert.equal(cli(['frontier', '--per', '999', '--root', root]).code, 2);
  const s = cli(['status', '--root', root]);
  assert.equal(s.code, 0);
  assert.equal(s.stdout.trim().split('\n').length, 1);
  assert.deepEqual(lastJson(s.stdout), { syllabus: 1, opened: 0, pending: 1, tasks: [], answered: 0 });
  const f = cli(['frontier', '--gen', '2', '--k', '1', '--per', '1', '--root', root]);
  assert.equal(f.code, 0);
  assert.deepEqual(lastJson(f.stdout), { generation: 2, briefs: 1, skills: 1, syllabus: 1, opened: 0, plan: 'work/grow/gen-2/teach/plan.json' });
});

test('CLI check: a good task directory prints ok true and exits 0; a bad one prints its errors and exits 1; no directory exits 2', () => {
  const root = stubRoot();
  const good = writeTask(root, 'good-task', { next: Array.from({ length: BRIEF_ROWS.next }, (_, i) => skillRow('next-' + i)) });
  const g = cli(['check', good, '--root', root]);
  assert.equal(g.code, 0, why1(g));
  assert.deepEqual(lastJson(g.stdout), { ok: true, task: 'good-task', dev: MIN_ROWS.dev, heldout: MIN_ROWS.heldout, next: BRIEF_ROWS.next, errors: [], warnings: [] });
  const badDir = writeTask(root, 'bad-task', { dev: devRows(3) });
  const b = cli(['check', badDir, '--root', root]);
  assert.equal(b.code, 1);
  const j = lastJson(b.stdout);
  assert.equal(j.ok, false);
  assert.ok(j.errors.some((e) => /dev\.jsonl has 3 rows, under/.test(e)));
  assert.ok(j.warnings.some((w) => /next\.jsonl has 0 rows, under/.test(w)));
  assert.ok(fs.existsSync(path.join(badDir, 'dev.jsonl')), 'check moves nothing');
  assert.equal(cli(['check', '--root', root]).code, 2);
});

test('CLI intake: the organism from the root\'s judge/baseline.mjs, and baseline null when the root has none', () => {
  const asks = stubRoot();
  fs.writeFileSync(path.join(asks, 'judge', 'baseline.mjs'), [
    'export const PACK = null;',
    'export async function runOrganism(rows, opts = {}) {',
    '  return { rows: rows.map((r) => ({ q: r.q, got: r.q === "what is 10 plus 7" ? "It is 17." : null })) };',
    '}', '',
  ].join('\n'));
  writeTask(asks, 'add-two-numbers');
  const a = cli(['intake', '--gen', '1', '--root', asks]);
  assert.equal(a.code, 0, why1(a));
  const ja = lastJson(a.stdout);
  assert.deepEqual(ja.opened, ['add-two-numbers']);
  assert.equal(ja.baseline, 'asked');
  assert.deepEqual(readJ(path.join(asks, LEDGER)).tasks[0].baseline, { n: MIN_ROWS.dev, ok: 1, score: 0.05 });
  const none = stubRoot();
  writeTask(none, 'add-two-numbers');
  const n = cli(['intake', '--gen', '1', '--root', none]);
  assert.equal(n.code, 0, why1(n));
  const jn = lastJson(n.stdout);
  assert.deepEqual(jn.opened, ['add-two-numbers']);
  assert.match(jn.baseline, /^the organism could not be asked: /);
  const row = readJ(path.join(none, LEDGER)).tasks[0];
  assert.equal(row.baseline, null);
  assert.match(row.baselineWhy, /^the organism could not be asked: /);
  const again = cli(['intake', '--gen', '1', '--root', none]);
  assert.equal(again.code, 0);
  assert.deepEqual(lastJson(again.stdout).opened, []);
  assert.equal(lastJson(again.stdout).already, 1);
});

test('validateTaskDir alone: the rules hold without a ledger, a generation or the organism', () => {
  const root = stubRoot();
  const dir = writeTask(root, 'standalone-task', { gen: 9, task: taskJson('standalone-task', 9) });
  const v = validateTaskDir(dir);
  assert.equal(v.ok, true, JSON.stringify(v.why));
  assert.equal(v.skill, 'standalone-task');
  assert.equal(v.dev.length, MIN_ROWS.dev);
  assert.equal(validateTaskDir(dir, { n: 1 }).ok, false, 'a generation given must match');
  assert.equal(validateTaskDir(dir, { taken: new Set(['standalone-task']) }).ok, false);
});
