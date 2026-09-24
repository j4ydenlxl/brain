// test/prompt-regions.test.mjs: the reasoning regions inside act/prompt.mjs ask() (Board 11, item public).
//
// ask() now sends a math shaped prompt to reason/math.mjs solveMath and a code shaped prompt (a
// function signature with a doc comment) to reason/synth.mjs synthesize, AFTER the exact path and
// the memory step and before every model cell. Nothing here calls Ollama: every model cell is a
// mock handed in through opts.cell, and the routing tests replace the regions themselves with
// functions that record what they were given.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { Brain } from '../core/brain.mjs';
import { attachMemory } from '../memory/index.mjs';
import * as P from '../act/prompt.mjs';
import { loadGsm8k, loadHumanEval, ALONE_PROMPT, lastNumber, finalAnswer, cutAtStopTokens } from '../bench/public.mjs';
import { extractCode } from '../act/code.mjs';
import { runTests } from '../act/run.mjs';
import { buildQuestions, gradeAnswer } from '../bench/answer.mjs';
import { solve } from '../act/solve.mjs';

after(() => { if (typeof P.closeKnowledge === 'function') P.closeKnowledge(); });

let nb = 0;
const brain = () => { const b = new Brain({ name: 'regions-' + (++nb), ledger: 'full', pruneEvery: 0 }); attachMemory(b, { name: 'regions-' + nb }); return b; };
const DOWN = { base: 'http://127.0.0.1:9', probeMs: 150, timeoutMs: 400, spawn: false };
const gsm0 = () => loadGsm8k()[0];
const he0 = () => loadHumanEval()[0];

// A fake region that records its argument and answers as the real one would.
function fakeMath(log, answer = 18) {
  return async (args) => {
    log.push({ region: 'math', args });
    return { provenance: 'model+exact', answer, calls: 6, modelMs: 1, execMs: 2, ms: 3, samples: [{ stage: 'ok', tokens: 5 }], vote: { key: String(answer), count: 5, valid: 5, of: 5, tie: false }, verify: { reached: true, verdict: 'accept', changed: false } };
  };
}
function fakeCode(log, completion = 'function f() { return 1; }') {
  return async (args) => {
    log.push({ region: 'code', args });
    return { provenance: 'model+exact', completion, calls: 5, ms: 4, entry: 'f', extractedCount: 2, passedExtracted: 2, keptIndex: 0, candidates: [{ reached: true, phase: 'first', tokens: 7, modelMs: 1 }] };
  };
}
const neverCell = async () => { throw new Error('a model cell was called on a path that must not call one'); };

test('a GSM8K record goes to solveMath, not to synthesize, and keeps the region provenance', async () => {
  const log = [];
  const g = gsm0();
  const a = await P.ask(brain(), ALONE_PROMPT(g.question), { ...DOWN, provider: 'ollama', model: 'm', maxTokens: 3000, cell: neverCell, regions: { math: fakeMath(log), code: fakeCode(log) } });
  assert.deepEqual(log.map((x) => x.region), ['math'], 'one region call, the math one');
  assert.equal(log[0].args.question, ALONE_PROMPT(g.question), 'the math region is handed the whole prompt');
  assert.equal(log[0].args.k, 5, 'the default k is 5');
  assert.equal(log[0].args.verify, true, 'the default math region verifies');
  assert.equal(log[0].args.maxTokens, 3000, 'the ask budget reaches the region');
  assert.equal(a.route, 'math');
  assert.equal(a.from, 'region');
  assert.equal(a.provenance.answer, 'model+exact');
  assert.equal(a.provenance.region.name, 'math');
  assert.equal(a.provenance.region.provenance, 'model+exact');
  assert.equal(a.provenance.region.reached, true);
  assert.equal(a.provenance.llm.provider, 'mock');
  assert.equal(lastNumber(a.text), '18', 'the answer is the last number of the text');
  assert.equal(finalAnswer(g), '18');
});

test('a HumanEval record prompt goes to synthesize, not to solveMath, and keeps the region provenance', async () => {
  const log = [];
  const h = he0();
  const a = await P.ask(brain(), h.prompt, { ...DOWN, provider: 'ollama', model: 'm', maxTokens: 4000, cell: neverCell, regions: { math: fakeMath(log), code: fakeCode(log) } });
  assert.deepEqual(log.map((x) => x.region), ['code'], 'one region call, the code one, although the examples carry numbers');
  assert.equal(log[0].args.prompt, h.prompt);
  assert.equal(log[0].args.k, 5);
  assert.equal(log[0].args.repair, true, 'the default code region repairs');
  assert.equal(a.route, 'code');
  assert.equal(a.provenance.answer, 'model+exact');
  assert.equal(a.provenance.region.name, 'code');
  assert.equal(a.provenance.region.extracted, 2);
  assert.match(a.text, /```javascript\nfunction f\(\) \{ return 1; \}\n```/);
});

test('the real regions on a mock cell: GSM8K record 0 is computed in the sandbox, HumanEval record 0 passes its hidden tests', async () => {
  const g = gsm0();
  const calls = [];
  const mathCell = async (req) => {
    calls.push(req.purpose || req.phase || 'program');
    if (req.purpose === 'verify') return { ok: true, text: 'ACCEPT', tokens: 1 };
    return { ok: true, text: '```javascript\nfunction solve() { const eggs = 16 - 3 - 4; return eggs * 2; }\n```', tokens: 20 };
  };
  const a = await P.ask(brain(), ALONE_PROMPT(g.question), { ...DOWN, provider: 'ollama', model: 'm', cell: mathCell });
  assert.equal(a.route, 'math');
  assert.equal(a.provenance.answer, 'model+exact', 'the programs ran and agreed');
  assert.equal(a.provenance.region.vote.count, 5);
  assert.equal(lastNumber(a.text), finalAnswer(g));
  assert.ok(calls.length >= 5, 'k=5 programs were asked for: ' + calls.join(','));

  const h = he0();
  const codeCell = async () => ({ ok: true, text: '```javascript\nfunction has_close_elements(numbers, threshold){\n  for (let i = 0; i < numbers.length; i++) for (let j = i + 1; j < numbers.length; j++) if (Math.abs(numbers[i] - numbers[j]) < threshold) return true;\n  return false;\n}\n```', tokens: 30 });
  const b = await P.ask(brain(), h.prompt, { ...DOWN, provider: 'ollama', model: 'm', cell: codeCell });
  assert.equal(b.route, 'code');
  assert.equal(b.provenance.answer, 'model+exact');
  assert.ok(b.provenance.region.extracted >= 1, 'the prompt examples were read out');
  const code = cutAtStopTokens(extractCode(b.text), h.stop_tokens);
  const graded = await runTests(code.text, h.tests, { limitMs: 5000, memoryMB: 128 });
  assert.equal(graded.passed, true, 'the record own hidden tests pass: ' + graded.error);
});

test('a prompt solve() computes never reaches a region, and neither do prose, a factual question, provider null or regions:false', async () => {
  const log = [];
  const regions = { math: fakeMath(log), code: fakeCode(log) };
  // a math shaped suite prompt solve() computes: the region must never see it
  const q = buildQuestions({ tasksPerSuite: 3 }).find((x) => x.source !== 'fixture' && P.mathShape(x.q) && solve(x.q));
  assert.ok(q, 'the suite holds a math shaped prompt solve() computes');
  const exact = await P.ask(brain(), q.q, { ...DOWN, provider: 'ollama', model: 'm', cell: neverCell, regions });
  assert.equal(exact.provenance.answer, 'exact');
  assert.equal(exact.text.includes(solve(q.q).answer), true);
  const g = gsm0();
  const off = await P.ask(brain(), ALONE_PROMPT(g.question), { ...DOWN, provider: 'null', regions });
  assert.equal(off.provenance.answer, 'memory', 'provider null: no region, no model');
  const none = await P.ask(brain(), ALONE_PROMPT(g.question), { ...DOWN, provider: 'null', cell: neverCell, regions: false });
  assert.notEqual(none.route, 'math');
  assert.equal(P.regionFor('Tell me a story about a dragon and a lighthouse.', { provider: 'ollama' }), null, 'prose has no region');
  assert.equal(P.regionFor(ALONE_PROMPT(g.question), { provider: 'ollama', regions: false }), null);
  assert.equal(P.regionFor(ALONE_PROMPT(g.question), { provider: 'ollama', regions: { math: false } }), null);
  assert.equal(P.regionFor(ALONE_PROMPT(g.question), { provider: 'null' }), null);
  assert.equal(P.regionFor(he0().prompt, { provider: 'ollama' }), 'code');
  assert.deepEqual(log, [], 'no region was called on any of these');
});

test('a region whose cell is not reached answers from memory and says the cell was not reached', async () => {
  const g = gsm0();
  const deadCell = async () => ({ ok: false, text: '', reason: 'mock: connection refused' });
  const a = await P.ask(brain(), ALONE_PROMPT(g.question), { ...DOWN, provider: 'ollama', model: 'm', cell: deadCell, regions: { math: { k: 2, verify: false } } });
  assert.equal(a.route, 'math');
  assert.equal(a.from, 'memory');
  assert.equal(a.provenance.answer, 'memory');
  assert.equal(a.provenance.region.reached, false);
  assert.equal(a.provenance.llm.ok, false, 'the bench reads llm.ok false as ABSENT, not wrong');
});

test('the math shape covers every GSM8K record, the code shape every HumanEval record, and neither fires on the internal suite code', () => {
  const gs = loadGsm8k();
  const miss = gs.filter((r) => !P.mathShape(ALONE_PROMPT(r.question))).map((r) => r.id);
  assert.deepEqual(miss, [], 'every GSM8K record is math shaped');
  const hs = loadHumanEval();
  const codeMiss = hs.filter((r) => !P.codeShape(r.prompt)).map((r) => r.name);
  assert.deepEqual(codeMiss, [], 'every HumanEval prompt is code shaped');
  for (const t of ['What is the capital of France?', 'hello there', 'https://example.com/a?b=1']) { assert.equal(P.mathShape(t), null, t); assert.equal(P.regionFor(t, { provider: 'ollama' }), null, t); }
});

test('the internal suite through ask() loses no exact answer with the regions on and a model cell present, and calls no region', async () => {
  const qs = buildQuestions({ tasksPerSuite: 1e9 }).filter((q) => q.source !== 'fixture');
  let calls = 0;
  const cell = async () => { calls++; return { ok: true, text: '```javascript\nfunction solve() { return 0; }\n```', tokens: 1 }; };
  const tally = async (opts) => {
    const b = brain();
    const ids = [];
    for (const q of qs) {
      const a = await P.ask(b, q.q, opts);
      const prov = a.provenance.answer;
      const exact = prov === 'exact' || (prov === 'direct' && a.provenance.source === 'exact');
      if (exact && gradeAnswer(a.text, q).ok) ids.push(q.id);
    }
    return ids.sort();
  };
  const digest = (ids) => crypto.createHash('sha256').update(ids.join('\n')).digest('hex').slice(0, 16);
  const before = await tally({ provider: 'null', route: 'direct', spawn: false, regions: false });
  const withRegions = await tally({ ...DOWN, provider: 'ollama', model: 'none', route: 'direct', cell });
  assert.ok(qs.length >= 700, 'the suite is the whole suite: ' + qs.length);
  assert.ok(before.length >= 700, 'exact and correct before: ' + before.length);
  assert.equal(digest(withRegions), digest(before), 'the same exact and correct ids: ' + withRegions.length + ' vs ' + before.length);
  assert.equal(calls, 0, 'solve() computed every suite prompt the math shape matched, so no region called its cell');
});
