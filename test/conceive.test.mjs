// test/conceive.test.mjs: the conceive bench (board 29 first draft, board 31 re-run; item conceive). The prompt file's shape, every grading
// function on fixed strings (the empty answer included), the miss detector on the organism's own texts and on a real
// answer, the controls over the whole file, the copy check on a planted copy, and a --limit 3 smoke of the null arm.
// Board 31 fix pass: planted rows force the wrong native count above 0, the instrument sha (the ask path hashed before
// the first ask and after the last), and the model off bar with its barBlockedBy and nextCommand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadPrompts, validatePrompts, selectPrompts, GRADE_TYPES, WARM, MISS_HEADS, isMiss, isNative,
  candidateOf, exactPass, containsPass, regexPass, lengthPass, itemsOf, linesOf, sentencesOf, paragraphsOf, wordsOf,
  extractCode, runCode, codePass, rubric, rubricLoose, looseVariants, gradeAnswer, copyCheck, args, run, planArms, VERDICTS,
  barMetOf, modelBudget, MODEL_BUDGET, optsFor, journalKey, readJournal, PARROT,
  summarize, specifiersOf, instrumentOf, MODEL_ARM_COMMAND,
} from '../bench/conceive.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const set = loadPrompts();

// ---------------------------------------------------------------- the prompt file
test('prompt file: at least 200 prompts over at least 20 kinds, unique ids, every grade type known, shape sound', () => {
  assert.ok(set.prompts.length >= 200, 'prompts ' + set.prompts.length);
  assert.ok(set.kinds.length >= 20, 'kinds ' + set.kinds.length);
  assert.equal(new Set(set.prompts.map((p) => p.id)).size, set.prompts.length);
  for (const p of set.prompts) assert.ok(GRADE_TYPES.includes(p.grade.type), p.id + ' ' + p.grade.type);
  for (const k of set.kinds) assert.ok(set.prompts.some((p) => p.kind === k), 'kind ' + k + ' has no prompt');
  for (const k of ['arithmetic', 'algebra', 'code', 'essay', 'fact', 'definition', 'translation', 'summary', 'plan', 'advice', 'list', 'comparison', 'classification', 'rewrite', 'poem', 'story', 'joke', 'recipe', 'letter', 'riddle', 'conversation', 'self']) assert.ok(set.kinds.includes(k), 'the task names kind ' + k);
  assert.deepEqual(validatePrompts(set), []);
  const gradeable = set.prompts.filter((p) => p.grade.type !== 'none');
  assert.ok(gradeable.length >= 200, 'gradeable ' + gradeable.length);
  for (const t of GRADE_TYPES) assert.ok(set.prompts.some((p) => p.grade.type === t), 'no row of type ' + t);
  for (const q of WARM) assert.ok(!set.prompts.some((p) => p.prompt.toLowerCase() === q.toLowerCase()), 'warm up ask is a conceive prompt: ' + q);
});

test('validatePrompts finds each kind of broken row (a planted bad set)', () => {
  const bad = validatePrompts({ kinds: ['a'], prompts: [
    { id: 'x', kind: 'a', prompt: 'p', grade: { type: 'exact', answer: '' } },
    { id: 'x', kind: 'b', prompt: 'p', grade: { type: 'contains' } },
    { id: 'y', kind: 'a', prompt: 'p', grade: { type: 'regex', pattern: '(' } },
    { id: 'z', kind: 'a', prompt: 'p', grade: { type: 'length' } },
    { id: 'w', kind: 'a', prompt: 'p', grade: { type: 'code', entry: '1f', tests: [] } },
    { id: 'v', kind: 'a', prompt: 'p', grade: { type: 'judge' } },
  ] });
  for (const want of ['exact with no answer', 'repeated', 'not in kinds', 'contains with no terms', 'does not compile', 'length with no count', 'code with no entry', 'unknown']) assert.ok(bad.some((b) => b.includes(want)), 'missed: ' + want + ' in ' + JSON.stringify(bad));
});

test('selectPrompts: --limit N is round robin over the kinds; 0 is every prompt in file order', () => {
  const three = selectPrompts(set, 3);
  assert.equal(three.length, 3);
  assert.deepEqual(three.map((p) => p.kind), set.kinds.slice(0, 3));
  const fifty = selectPrompts(set, 50);
  assert.equal(new Set(fifty.map((p) => p.kind)).size, set.kinds.length);
  assert.equal(selectPrompts(set, 0).length, set.prompts.length);
  assert.equal(selectPrompts(set, 100000).length, set.prompts.length);
  const plan = planArms(4, ['a', 'b', 'c']);
  assert.deepEqual(plan.map((p) => p[0]), ['a', 'b', 'c', 'a']);
});

// ---------------------------------------------------------------- the graders on fixed strings
test('exact: last meaningful line, labels and edge punctuation stripped, numbers by value', () => {
  const n = (a) => ({ type: 'exact', answer: String(a) });
  assert.equal(exactPass('145', n(145)), true);
  assert.equal(exactPass('answered exactly by exact.arith, with no model and no network.\n145', n(145)), true);
  assert.equal(exactPass('The answer is 145.', n(145)), true);
  assert.equal(exactPass('Answer: 1,450', n(1450)), true);
  assert.equal(exactPass('31/4', n(7.75)), true);
  assert.equal(exactPass('x = 5', n(5)), true);
  assert.equal(exactPass('146', n(145)), false);
  assert.equal(exactPass('145 is close, but it is 146', n(145)), false);
  assert.equal(exactPass('', n(145)), false);
  assert.equal(exactPass('   \n  ', n(145)), false);
  assert.equal(exactPass('A piano.', { type: 'exact', answer: 'piano' }), true);
  assert.equal(exactPass('It is a towel!', { type: 'exact', answer: 'towel' }), true);
  assert.equal(exactPass('The next letter is I.', { type: 'exact', answer: 'I' }), true);
  assert.equal(exactPass('`10-20-30`', { type: 'exact', answer: '10-20-30' }), true);
  assert.equal(exactPass('"object"', { type: 'exact', answer: 'object' }), true);
  assert.equal(exactPass('a keyboard', { type: 'exact', answer: 'piano', alts: ['keyboard'] }), true);
  assert.equal(exactPass('a violin', { type: 'exact', answer: 'piano', alts: ['keyboard'] }), false);
  assert.equal(candidateOf('Sure.\n**Answer:** "Paris".'), 'Paris');
});

test('contains: word boundaries, prefixes with *, case sensitivity, all and any', () => {
  assert.equal(containsPass('Tokyo is the capital.', { type: 'contains', any: ['Tokyo'] }), true);
  assert.equal(containsPass('a tokyoite', { type: 'contains', any: ['Tokyo'] }), false);
  assert.equal(containsPass('light refraction', { type: 'contains', any: ['refract*'] }), true);
  assert.equal(containsPass('au revoir', { type: 'contains', any: ['Au'], caseSensitive: true }), false);
  assert.equal(containsPass('The symbol is Au.', { type: 'contains', any: ['Au'], caseSensitive: true }), true);
  assert.equal(containsPass('oil and vinegar', { type: 'contains', all: ['oil', 'vinegar'] }), true);
  assert.equal(containsPass('oil only', { type: 'contains', all: ['oil', 'vinegar'] }), false);
  assert.equal(containsPass('carbon  dioxide', { type: 'contains', any: ['carbon dioxide'] }), true);
  assert.equal(containsPass('pão', { type: 'contains', any: ['pão'] }), true);
  assert.equal(containsPass('', { type: 'contains', any: ['Tokyo'] }), false);
  assert.equal(containsPass('anything', { type: 'contains' }), false);
});

test('regex and length: counts of words, sentences, paragraphs, lines and items', () => {
  assert.equal(regexPass('HELLO', { pattern: '\\bHELLO\\b' }), true);
  assert.equal(regexPass('hello', { pattern: '\\bHELLO\\b' }), false);
  assert.equal(regexPass('', { pattern: '\\bHELLO\\b' }), false);
  const haiku = { type: 'length', lines: { min: 3, max: 3 } };
  assert.equal(lengthPass('Red leaves fall\nquietly down\nto the cold ground', haiku), true);
  assert.equal(lengthPass('Here is a haiku:\nRed leaves fall\nquietly down\nto the cold ground', haiku), false);
  assert.equal(lengthPass('', haiku), false);
  assert.equal(linesOf('a\n\n---\nb').length, 2);
  assert.equal(wordsOf('one two, three -- four').length, 4);
  assert.equal(sentencesOf('One. Two! Three? "Four."  Five').length, 5);
  assert.equal(paragraphsOf('p1 line\nstill p1\n\np2\n\n\n p3').length, 3);
  assert.equal(itemsOf('Intro:\n- a\n- b\n* c'), 3);
  assert.equal(itemsOf('1. a\n2) b\n**3.** c\n- d', { numbered: true }), 3);
  assert.equal(itemsOf('apple\nbanana\npear', { perLine: true }), 3);
  assert.equal(itemsOf('apple\nbanana\npear'), 0);
  assert.equal(itemsOf('**Ingredients:**\n- flour'), 1);
  assert.equal(lengthPass('one two three', { type: 'length', words: { min: 3, max: 3 }, sentences: { min: 1, max: 1 } }), true);
  assert.equal(lengthPass('one two three. four.', { type: 'length', words: { min: 3, max: 5 }, sentences: { min: 1, max: 1 } }), false);
  assert.equal(lengthPass('x', { type: 'length' }), false);
});

test('code: fenced JavaScript run in a worker; wrong, empty, broken and looping code all fail', async () => {
  const g = { type: 'code', entry: 'reverseString', tests: [{ args: ['abc'], want: 'cba' }, { args: [''], want: '' }] };
  assert.equal(await rubric('Here you go:\n```javascript\nfunction reverseString(s) { return s.split("").reverse().join(""); }\n```\nDone.', g), true);
  assert.equal(await rubric('const reverseString = (s) => [...s].reverse().join("");', g), true);
  assert.equal(await rubric('export function reverseString(s) { return s.split("").reverse().join(""); }', g), true);
  assert.equal(await rubric('function reverseString(s) { return s; }', g), false);
  assert.equal(await rubric('', g), false);
  assert.equal(await rubric('function reverseString(s) { return ', g), false);
  assert.equal(await rubric('I do not carry that yet: ...', g), false);
  const loop = await runCode(['function f(){ while(true){} }'], 'f', [{ args: [], want: 1 }], { ms: 100 });
  assert.equal(loop.ok, false);
  assert.match(loop.error, /timed out|timeout/i);
  const arr = { type: 'code', entry: 'unique', tests: [{ args: [[1, 2, 1, 3]], want: [1, 2, 3] }] };
  assert.equal(await rubric('function unique(a){ return [...new Set(a)]; }', arr), true);
  assert.equal(await rubric('function unique(a){ return Array.isArray(a) ? a.filter((x,i)=>a.indexOf(x)===i) : null; }', arr), true, 'arrays built inside the sandbox pass Array.isArray');
  // HumanEval shape: a completion that is only the body passes with the prompt put in front of it
  const prompt = '// Return n doubled.\nfunction dbl(n) {';
  const hg = { type: 'code', entry: 'dbl', tests: [{ args: [2], want: 4 }] };
  assert.equal(await codePass('  return n * 2;', hg, prompt), true);
  assert.equal(await codePass('  return n * 3;', hg, prompt), false);
  assert.match(extractCode('```js\nconst a = 1;\n```\ntext\n```\nconst b = 2;\n```'), /const a = 1;/);
});

test('loose: IFEval variants let an intro or outro line or markdown stars through; strict does not', async () => {
  const haiku = { type: 'length', lines: { min: 3, max: 3 } };
  const text = 'Here is a haiku:\nRed leaves fall\nquietly down\nto the cold ground';
  assert.equal(await rubric(text, haiku), false);
  assert.equal(await rubricLoose(text, haiku), true);
  assert.equal(looseVariants('a\nb\nc').length, 8);
  assert.equal(await rubricLoose('', haiku), false);
  assert.equal(await rubricLoose('anything', { type: 'none' }), null);
  assert.equal(await rubric('anything', { type: 'none' }), null);
  await assert.rejects(() => rubric('x', { type: 'judge' }), /unknown grade type/);
});

// ---------------------------------------------------------------- the miss detector
test('miss detector: the two memory miss texts and the region misses are refusals; a real answer is native', async () => {
  const { FALLTHROUGH_HEAD, FALLTHROUGH_TRY, ask } = await import('../act/prompt.mjs');
  const { seedBasic } = await import('../seeds/basic.mjs');
  assert.equal(MISS_HEADS.length, 4);
  const fall = FALLTHROUGH_HEAD + '\nnothing in memory matches baker, loaves.\n' + FALLTHROUGH_TRY;
  assert.equal(isMiss(fall), true);
  assert.equal(isMiss('nothing in memory matches tell, joke.'), true);
  assert.equal(isMiss('the math region produced no number: every program failed and the prose answer held none.'), true);
  assert.equal(isMiss('the code region produced no candidate: no reason given'), true);
  assert.equal(isNative(fall), false);
  assert.equal(isNative(''), false);
  assert.equal(isNative('  \n '), false);
  const real = 'answered exactly by exact.arith, with no model and no network.\n145';
  assert.equal(isMiss(real), false);
  assert.equal(isNative(real), true);
  assert.equal(isNative('I do know: nothing in memory matches is a phrase.'), true, 'a miss head is a refusal only at the start');
  // the organism's own output, not a copy of it: a prompt it does not carry and one it does
  const b = seedBasic({ name: 'conceive-test', ledger: 'off' });
  const miss = await ask(b, 'Tell me a pun about bread.', { provider: 'null', k: 5, events: [], knowledge: false });
  assert.equal(isMiss(miss.text), true, miss.text.slice(0, 80));
  const hit = await ask(b, 'What is 48 plus 97?', { provider: 'null', k: 5, events: [], knowledge: false });
  assert.equal(isNative(hit.text), true);
  assert.equal(exactPass(hit.text, { type: 'exact', answer: '145' }), true);
});

test('gradeAnswer: a refusal is graded false before the rubric runs, even where the rubric alone would pass it', async () => {
  const { FALLTHROUGH_HEAD, FALLTHROUGH_TRY } = await import('../act/prompt.mjs');
  const fall = FALLTHROUGH_HEAD + '\nnothing in memory matches autumn, leaves.\n' + FALLTHROUGH_TRY;
  const row = set.prompts.find((p) => p.id === 'poem-01');
  assert.equal(await rubric(fall, row.grade, row.prompt), true, 'the miss text has three lines, so the haiku rubric alone passes it');
  assert.deepEqual(await gradeAnswer(fall, row), { native: false, graded: false, gradedLoose: false });
  assert.deepEqual(await gradeAnswer('Red leaves fall\nquietly down\nto the cold ground', row), { native: true, graded: true, gradedLoose: true });
  const none = set.prompts.find((p) => p.grade.type === 'none');
  assert.deepEqual(await gradeAnswer('Hello.', none), { native: true, graded: null, gradedLoose: null });
});

// ---------------------------------------------------------------- the controls over the whole file
test('control: the empty answer and the echoed prompt pass no gradeable rubric in the file (strict and loose)', async () => {
  const gradeable = set.prompts.filter((p) => p.grade.type !== 'none');
  assert.ok(gradeable.length >= 200);
  const emptyPass = [], echoPass = [];
  for (const p of gradeable) {
    if ((await rubric('', p.grade, p.prompt)) || (await rubricLoose('', p.grade, p.prompt))) emptyPass.push(p.id);
    if (await rubric(p.prompt, p.grade, p.prompt)) echoPass.push(p.id);
    assert.equal((await gradeAnswer('', p)).graded, false);
  }
  assert.deepEqual(emptyPass, []);
  assert.deepEqual(echoPass, []);
});

test('copy check: no prompt of the file is in the sets it must not reuse, and a planted copy is caught', () => {
  const c = copyCheck(set.prompts);
  assert.ok(c.sources.some((s) => s.file === 'bench/site-ask.mjs' && s.present && s.strings > 0));
  assert.ok(c.sources.some((s) => s.file === 'bench/essay-prompts.json' && s.present && s.strings > 0));
  assert.deepEqual(c.copied, []);
  const planted = copyCheck([
    { id: 'p1', prompt: 'Who are you?' },
    { id: 'p2', prompt: 'Write a short essay on why the ocean is salty.' },
    { id: 'p3', prompt: 'Something nobody wrote before, about a violet lantern and eleven owls.' },
  ]);
  assert.deepEqual(planted.copied.map((x) => x.id), ['p1', 'p2']);
});

test('args: an unknown flag, a stray argument, a model larger than qwen3:1.7b and a bad arm all run nothing', () => {
  assert.ok(args(['--nope']).bad.length);
  assert.ok(args(['stray']).bad.length);
  assert.ok(args(['--model', 'qwen3:30b-a3b']).bad.length);
  assert.ok(args(['--arms', 'organism,oracle']).bad.length);
  assert.ok(args(['--limit', 'x']).bad.length);
  assert.deepEqual(args(['--limit', '3', '--model-arm', '--model', 'qwen3:1.7b']), { opts: { limit: 3, 'model-arm': true, model: 'qwen3:1.7b' }, bad: [] });
});

// ---------------------------------------------------------------- the run
test('run: --limit 3 is partial; the model arm is absent without --model-arm and opens no socket', async () => {
  const v = await run({ limit: 3, quiet: true, write: false });
  assert.equal(v.isTheBar, false);
  assert.equal(v.barMet, false);
  assert.equal(v.wroteTo, VERDICTS.partial);
  assert.equal(v.model.present, false);
  assert.equal(v.model.requested, false);
  assert.equal(v.model.ollamaList, null, 'ollama list never ran');
  assert.equal(v.rows.filter((r) => r.arm === 'model').length, 3);
  assert.ok(v.rows.filter((r) => r.arm === 'model').every((r) => r.absent && r.reason));
  assert.ok(v.rows.filter((r) => r.arm !== 'model').every((r) => !r.absent && Number.isFinite(r.ns) && r.ns > 0));
  assert.equal(v.control.emptyGradesZero, true);
  assert.equal(v.split.heldOut, 'none');
  assert.equal(v.split.contaminated, false);
  assert.ok(Object.values(v.checks).every(Boolean), JSON.stringify(v.checks));
});

test('smoke: node bench/conceive.mjs --limit 3 --arms organism --nowrite prints a tally', () => {
  const r = spawnSync(process.execPath, ['bench/conceive.mjs', '--limit', '3', '--arms', 'organism', '--nowrite'], { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\norganism\s+3\s+\d+\s+\d+\s+\d+\.\d{2}%\s+\d+\.\d{2}%\s+\d+\/3\s/);
  assert.match(r.stdout, /CONCEIVE isTheBar false barMet false: asked 3 prompts over 3 kinds; organism native \d+\.\d{2}% refused \d+\.\d{2}% correct \d+\/3; organism-site absent; model absent; wall \d+ ms, nothing written \(--nowrite\)\. THIS IS NOT THE BAR: narrow: --limit 3, arms organism/);
  assert.match(r.stdout, /control: an empty answer passes 0 of 3 gradeable rubrics/);
  const bad = spawnSync(process.execPath, ['bench/conceive.mjs', '--model', 'qwen3:30b-a3b'], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /ran nothing/);
});

// ---------------------------------------------------------------- board 31 re-run: the bar rule, the controls, the model arm on a mock
test('barMetOf: only the full run with the model arm present, refusing exactly nothing, with no ungraded row', () => {
  const ok = { isTheBar: true, present: true, refusedShare: 0, ungraded: 0 };
  assert.equal(barMetOf(ok), true);
  assert.equal(barMetOf({ ...ok, isTheBar: false }), false, 'a narrow run');
  assert.equal(barMetOf({ ...ok, present: false }), false, 'the model arm absent');
  assert.equal(barMetOf({ ...ok, refusedShare: 0.0034 }), false, 'one refusal in 291');
  assert.equal(barMetOf({ ...ok, refusedShare: null }), false, 'no present row, so no share');
  assert.equal(barMetOf({ ...ok, ungraded: 1 }), false, 'one gradeable row not graded');
  assert.equal(barMetOf({ ...ok, ungraded: null }), false);
});

test('model budgets: public.mjs measured ones by default, the flags win, and the journal key moves with them', () => {
  assert.deepEqual(modelBudget({}), { maxTokens: MODEL_BUDGET.maxTokens, timeoutMs: MODEL_BUDGET.timeoutMs, probeMs: MODEL_BUDGET.probeMs });
  assert.equal(modelBudget({ maxTokens: 800 }).maxTokens, 800);
  const o = optsFor('model', { model: 'qwen3:1.7b' });
  assert.equal(o.provider, 'ollama');
  assert.equal(o.maxTokens, 4000);
  assert.equal(o.timeoutMs, 300000);
  assert.equal(o.base, undefined, 'no base: act/llm.mjs picks its default');
  assert.equal(optsFor('organism', {}).provider, 'null');
  assert.equal(optsFor('organism-site', {}).knowledge, false);
  const p = set.prompts[0];
  assert.equal(journalKey(p, { model: 'qwen3:1.7b' }), journalKey(p, { model: 'qwen3:1.7b' }));
  assert.notEqual(journalKey(p, { model: 'qwen3:1.7b' }), journalKey(p, { model: 'qwen3:1.7b', maxTokens: 800 }));
  assert.notEqual(journalKey(p, { model: 'qwen3:1.7b' }), journalKey({ ...p, prompt: p.prompt + ' ' }, { model: 'qwen3:1.7b' }));
  assert.ok(args(['--resume']).bad.some((b) => /needs --journal/.test(b)));
  assert.deepEqual(args(['--journal', 'x.jsonl', '--resume']).bad, []);
});

test('readJournal: the last row for a key wins, a torn line is skipped and counted, a missing file is empty', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'conceive-journal-'));
  try {
    const f = path.join(dir, 'j.jsonl');
    assert.equal(readJournal(f).rows.size, 0);
    writeFileSync(f, JSON.stringify({ key: 'a', row: { id: 'a', n: 1 } }) + '\n' + JSON.stringify({ key: 'a', row: { id: 'a', n: 2 } }) + '\n{"key":"b","row":{"id"\n');
    const j = readJournal(f);
    assert.equal(j.rows.size, 1);
    assert.equal(j.rows.get('a').n, 2);
    assert.equal(j.torn, 1);
    assert.equal(j.lines, 3);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('control (parrot): one constant answer refuses no prompt and passes almost no rubric in the file', async () => {
  const gradeable = set.prompts.filter((p) => p.grade.type !== 'none');
  let refused = 0, passed = 0;
  for (const p of gradeable) { const g = await gradeAnswer(PARROT, p); if (!g.native) refused++; if (g.graded) passed++; }
  assert.equal(refused, 0, 'the parrot is native on every row: refusing nothing is not answering');
  assert.ok(passed <= 2, 'the parrot passes ' + passed + ' rubrics');
});

// A mock ollama on a random localhost port: /api/tags lists qwen3:1.7b, /api/generate answers from a table (else "ok").
// The model arm runs end to end through ask() without touching the real queue (the test never opens port 11434).
function mockOllama(answer) {
  const seen = { tags: 0, generate: 0, prompts: [] };
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      if (req.url === '/api/tags') { seen.tags++; res.end(JSON.stringify({ models: [{ name: 'qwen3:1.7b' }] })); return; }
      if (req.url === '/api/generate') {
        seen.generate++;
        const j = JSON.parse(body || '{}');
        seen.prompts.push(String(j.prompt).slice(0, 80));
        res.end(JSON.stringify({ model: j.model, response: answer(String(j.prompt)), eval_count: 7, prompt_eval_count: 3 }));
        return;
      }
      res.statusCode = 404; res.end('{}');
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, seen, base: 'http://127.0.0.1:' + server.address().port })));
}
const listed = async () => ({ ran: true, ok: true, listed: 1, row: 'qwen3:1.7b  mock  1.4 GB', modelListed: true });
const FENCE = String.fromCharCode(96).repeat(3);

test('model arm on a mock ollama: present, every row reached and graded, the journal written, --resume asks nothing again', async () => {
  const m = await mockOllama((prompt) => (/capital of Japan/.test(prompt) ? 'Tokyo.' : /reverseString/.test(prompt) ? FENCE + 'js\nfunction reverseString(s){ return [...s].reverse().join(""); }\n' + FENCE : 'ok'));
  const dir = mkdtempSync(path.join(os.tmpdir(), 'conceive-mock-'));
  const journal = path.join(dir, 'model.jsonl');
  const pick = { ...set, prompts: set.prompts.filter((p) => ['fact-01', 'code-01', 'poem-01', 'riddle-01', 'conv-02'].includes(p.id)) };
  try {
    const v = await run({ set: pick, limit: 0, arms: 'model', modelArm: true, base: m.base, listFn: listed, journal, quiet: true, write: false });
    assert.equal(v.model.present, true, v.model.why);
    assert.equal(v.model.ollamaList.row, 'qwen3:1.7b  mock  1.4 GB');
    const mr = v.rows.filter((r) => r.arm === 'model');
    assert.equal(mr.length, 5);
    assert.ok(mr.every((r) => r.absent === false), JSON.stringify(mr.map((r) => [r.id, r.absent, r.reason])));
    assert.ok(mr.every((r) => (r.gradeType === 'none' ? r.graded === null : typeof r.graded === 'boolean')));
    const by = Object.fromEntries(mr.map((r) => [r.id, r]));
    assert.equal(by['fact-01'].graded, true, 'the knowledge tier or the cell says Tokyo');
    // board 34: act/code-native.mjs writes reverseString itself, so the row no longer reaches the mock; either source is graded in the worker
    assert.ok(['llm', 'native'].includes(by['code-01'].from), 'code-01 from ' + by['code-01'].from);
    assert.equal(by['code-01'].graded, true, by['code-01'].from === 'llm' ? 'the mock cell wrote a passing function, run in the worker' : 'the organism wrote a passing function (code-native), run in the worker');
    assert.equal(by['poem-01'].from, 'llm');
    assert.equal(by['poem-01'].graded, false, 'a one line "ok" is not a haiku');
    assert.equal(by['poem-01'].llm.provider, 'ollama');
    assert.equal(by['poem-01'].llm.capped, false);
    assert.equal(by['riddle-01'].native, true);
    // board 31 verify: a wrong native count that is only ever 0 checks nothing; the mock's "ok" to the haiku prompt is a
    // planted native answer that fails its rubric, so the model arm's count must be at least 1 and name poem-01
    assert.ok(v.arms.model.wrongNativeIds.includes('poem-01'), JSON.stringify(v.arms.model.wrongNativeIds));
    assert.ok(v.arms.model.wrongNative >= 1);
    assert.equal(v.arms.model.wrongNative, v.arms.model.wrongNativeIds.length);
    assert.ok(!v.arms.model.wrongNativeIds.includes('code-01'), 'a passing answer is not wrong');
    assert.equal(v.nextCommand, null, 'the model arm is present, so no command is owed');
    const fromModel = mr.filter((r) => r.from === 'llm').length;
    assert.ok(fromModel >= 2 && m.seen.generate >= fromModel, 'the cell was asked ' + m.seen.generate + ' times for ' + fromModel + ' rows from the model (board 34: code-01 is native now, so 3 became 2)');
    assert.equal(v.journal.appended, 5);
    assert.equal(v.isTheBar, false, 'one arm is not the bar');
    assert.equal(v.barMet, false);
    const asked = m.seen.generate;
    const again = await run({ set: pick, limit: 0, arms: 'model', modelArm: true, base: m.base, listFn: listed, journal, resume: true, quiet: true, write: false });
    assert.equal(again.journal.reused, 5);
    assert.equal(again.journal.appended, 0);
    assert.equal(m.seen.generate, asked, 'resume asked the cell nothing');
    assert.deepEqual(again.rows.map((r) => [r.id, r.graded]), v.rows.map((r) => [r.id, r.graded]));
    assert.ok(again.rows.every((r) => r.resumed === true));
  } finally { m.server.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('model arm: ollama list failing, or no row for the model, leaves the arm ABSENT with its reason and asks nothing', async () => {
  const pick = { ...set, prompts: set.prompts.slice(0, 2) };
  const down = await run({ set: pick, limit: 0, arms: 'organism,model', modelArm: true, listFn: async () => ({ ran: true, ok: false, error: 'ENOENT', row: null }), quiet: true, write: false });
  assert.equal(down.model.present, false);
  assert.match(down.model.why, /ollama list failed: ENOENT/);
  assert.ok(down.rows.filter((r) => r.arm === 'model').every((r) => r.absent && /ENOENT/.test(r.reason)));
  assert.equal(down.arms.model.armPresent, false);
  assert.match(down.statement, /was not measured in this run/);
  const norow = await run({ set: pick, limit: 0, arms: 'model', modelArm: true, listFn: async () => ({ ran: true, ok: true, listed: 3, row: null, modelListed: false }), quiet: true, write: false });
  assert.match(norow.model.why, /no row for qwen3:1.7b/);
});

test('wrong native: a native answer that fails its rubric is counted with its id; the smoke prints the per arm walls', async () => {
  const v = await run({ limit: 3, arms: 'organism', quiet: true, write: false });
  const o = v.arms.organism;
  assert.equal(o.wrongNative, o.wrongNativeIds.length);
  assert.equal(o.wrongNative, v.rows.filter((r) => r.arm === 'organism' && r.native && r.gradeType !== 'none' && r.graded === false).length);
  assert.ok(Number.isFinite(o.wallMs) && o.wallMs > 0);
  assert.equal(v.control.parrot.refused, 0);
  const r = spawnSync(process.execPath, ['bench/conceive.mjs', '--limit', '3', '--arms', 'organism', '--nowrite'], { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\nwall: organism \d+(?:\.\d+)? ms, organism-site 0 ms, model absent \(each the sum of its asks\); the whole run \d+ ms/);
  assert.match(r.stdout, /control \(parrot\): "ok" to every prompt refuses 0 of 3 and passes \d+ strict, \d+ loose/);
  assert.match(r.stdout, /organism wrong native \(a native answer that fails its rubric\): \d+ of \d+/);
});

// ---------------------------------------------------------------- board 31 fix pass: planted counts, the instrument, the blocked bar
test('summarize: planted rows force every count above 0, and each row lands in exactly one place', () => {
  const row = (id, gradeType, o) => ({ id, kind: 'k', arm: 'organism', gradeType, ns: 10, route: 'r', from: 'f', absent: false, ...o });
  const rows = [
    row('right', 'exact', { native: true, refused: false, graded: true, gradedLoose: true }),
    row('wrong', 'exact', { native: true, refused: false, graded: false, gradedLoose: false }),
    row('wrong-strict-loose-right', 'length', { native: true, refused: false, graded: false, gradedLoose: true }),
    row('refused', 'exact', { native: false, refused: true, graded: false, gradedLoose: false }),
    row('chat', 'none', { native: true, refused: false, graded: null, gradedLoose: null }),
    { id: 'gone', kind: 'k', arm: 'organism', gradeType: 'exact', absent: true, reason: 'planted', native: null, refused: null, graded: null, gradedLoose: null, ns: null },
  ];
  const s = summarize(rows, 5);
  assert.equal(s.asked, 6);
  assert.equal(s.present, 5);
  assert.equal(s.absent, 1);
  assert.equal(s.native, 4);
  assert.equal(s.refused, 1);
  assert.equal(s.gradeablePresent, 4);
  assert.equal(s.correct, 1);
  assert.equal(s.correctLoose, 2);
  assert.equal(s.gradeableNative, 3);
  assert.equal(s.wrongNative, 2, 'a native answer failing its strict rubric is wrong, loose or not');
  assert.deepEqual(s.wrongNativeIds, ['wrong', 'wrong-strict-loose-right']);
  assert.ok(!s.wrongNativeIds.includes('refused'), 'a refusal is refused, never wrong native');
  assert.ok(!s.wrongNativeIds.includes('chat'), 'a type none row is never wrong');
  assert.equal(s.refusedShare, 0.2);
  assert.equal(s.answeredBy['r/f'], 5);
});

test('instrument: relative imports are followed, the sha moves with one byte, a cycle ends, a missing file is named', () => {
  assert.deepEqual(specifiersOf("import a from './a.mjs';\nexport { b } from '../b.mjs';\nimport './c.mjs';\nconst d = await import('./d.mjs');\nimport fs from 'node:fs';\nimport x from 'pkg';"), ['./a.mjs', '../b.mjs', './c.mjs', './d.mjs']);
  const dir = mkdtempSync(path.join(os.tmpdir(), 'conceive-instrument-'));
  try {
    mkdirSync(path.join(dir, 'act'));
    writeFileSync(path.join(dir, 'act', 'prompt.mjs'), "import { b } from './b.mjs';\nimport './gone.mjs';\nexport const a = 1;\n");
    writeFileSync(path.join(dir, 'act', 'b.mjs'), "import { a } from './prompt.mjs';\nexport const b = 2;\n");
    const one = instrumentOf(['act/prompt.mjs'], dir);
    assert.deepEqual(one.list, ['act/b.mjs', 'act/prompt.mjs']);
    assert.deepEqual(one.missing, ['act/gone.mjs']);
    assert.match(one.sha, /^[0-9a-f]{16}$/);
    assert.equal(instrumentOf(['act/prompt.mjs'], dir).sha, one.sha, 'the same bytes give the same sha');
    writeFileSync(path.join(dir, 'act', 'b.mjs'), "import { a } from './prompt.mjs';\nexport const b = 3;\n");
    const two = instrumentOf(['act/prompt.mjs'], dir);
    assert.notEqual(two.sha, one.sha, 'one byte in an imported file moves the sha');
    assert.equal(two.promptMjs.sha, one.promptMjs.sha, 'act/prompt.mjs itself did not change');
  } finally { rmSync(dir, { recursive: true, force: true }); }
  const real = instrumentOf();
  for (const f of ['act/prompt.mjs', 'act/llm.mjs', 'reason/induce.mjs', 'bench/conceive.mjs', 'seeds/basic.mjs']) assert.ok(real.list.includes(f), f + ' is on the ask path');
  assert.deepEqual(real.missing, []);
  const p = set.prompts[0];
  assert.notEqual(journalKey(p, { model: 'qwen3:1.7b', instrument: real.sha }), journalKey(p, { model: 'qwen3:1.7b', instrument: 'ffffffffffffffff' }), 'a journal row made by other code is never reused');
});

test('run: an ask path that changes during the run is not the bar; the same run with a still path is', async () => {
  const fixed = { sha: 'aaaaaaaaaaaaaaaa', files: 1, list: ['act/prompt.mjs'], missing: [], promptMjs: { sha: 'aaaaaaaaaaaaaaaa', mtime: '2026-09-27T00:00:00.000Z' } };
  let calls = 0;
  const moving = () => (++calls === 1 ? fixed : { ...fixed, sha: 'bbbbbbbbbbbbbbbb' });
  const moved = await run({ limit: 0, quiet: true, write: false, instrumentFn: moving });
  assert.equal(calls, 2, 'the instrument is read before the first ask and after the last');
  assert.equal(moved.checks.askPathStableDuringRun, false);
  assert.equal(moved.instrument.stable, false);
  assert.equal(moved.isTheBar, false);
  assert.match(moved.notTheBarBecause, /askPathStableDuringRun/);
  const still = await run({ limit: 0, quiet: true, write: false, instrumentFn: () => fixed });
  assert.equal(still.checks.askPathStableDuringRun, true);
  assert.equal(still.isTheBar, true, JSON.stringify(still.checks));
  assert.equal(still.barMet, false, 'model off: the model arm is absent, so the bar is not met');
  assert.match(still.barBlockedBy, /the model arm is absent: not requested/);
  assert.equal(still.nextCommand, MODEL_ARM_COMMAND);
  assert.match(still.nextCommand, /--limit 0 --model-arm --journal/);
  assert.equal(still.wroteTo, VERDICTS.bar);
  assert.ok(still.rows.filter((r) => r.arm === 'model').every((r) => r.absent && /MODEL OFF/.test(r.reason)));
  assert.ok(still.arms.organism.present === set.prompts.length && still.arms['organism-site'].present === set.prompts.length);
});
