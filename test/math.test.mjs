// test/math.test.mjs: reason/math.mjs, the program of thought region, and bench/math.mjs.
// Every model here is a mocked cell (a function). Nothing in this file reaches Ollama: the
// one place a real provider is named is the null provider, which opens no socket.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  solveMath, vote, valueKey, extractProgram, parseVerdict, runProgram, lastNumber,
  prosePrompt, potPrompt, SEED_OFFSETS,
} from '../reason/math.mjs';
import { ALONE_PROMPT } from '../bench/public.mjs';
import { run as runBench, mcnemar, barOf } from '../bench/math.mjs';

const fence = (body) => 'Here is the program.\n```javascript\n' + body + '\n```';
const prog = (ret) => fence('function solve() {\n  const a = 6;\n  const b = 7;\n  return ' + ret + ';\n}');

// A mock cell that answers by purpose and index, and records every request it was handed.
function mock(byPurpose) {
  const seen = [];
  const fn = async (req) => {
    seen.push(req);
    const h = byPurpose[req.purpose];
    const text = typeof h === 'function' ? h(req) : h;
    if (text === undefined) throw new Error('the mock was not told what to say for ' + req.purpose);
    return { text, ok: true, provider: 'mock', ms: 1, tokens: 10 };
  };
  fn.seen = seen;
  return fn;
}

test('a fixed program is executed, voted, and labelled model+exact', async () => {
  const m = mock({ sample: prog('a * b') });
  const r = await solveMath({ question: 'Six rows of seven chairs. How many chairs?', model: m, k: 5, seed: 10 });
  assert.equal(r.answer, '42');
  assert.equal(r.provenance, 'model+exact');
  assert.equal(r.calls, 5);
  assert.equal(r.samples.length, 5);
  assert.ok(r.samples.every((s) => s.ok && s.value === 42 && s.stage === 'ran'));
  assert.equal(r.vote.count, 5);
  assert.equal(r.allFailed, false);
  assert.match(r.program, /function solve/);
  // sample i is drawn at seed + i, which is what makes k=1 the first sample of k=5
  assert.deepEqual(m.seen.map((q) => q.seed), [10, 11, 12, 13, 14]);
  assert.equal(m.seen[0].prompt, potPrompt('Six rows of seven chairs. How many chairs?'));
});

test('a throwing program is discarded; when every sample fails one prose answer is labelled model', async () => {
  const m = mock({ sample: fence('function solve() { throw new Error("boom"); }'), prose: 'I think it is 17.' });
  const r = await solveMath({ question: 'q', model: m, k: 3, seed: 1 });
  assert.equal(r.allFailed, true);
  assert.ok(r.samples.every((s) => !s.ok && s.stage === 'run' && /boom/.test(s.error)));
  assert.equal(r.answer, '17');
  assert.equal(r.provenance, 'model');
  assert.equal(r.calls, 4);
  const prose = m.seen.find((q) => q.purpose === 'prose');
  assert.equal(prose.prompt, prosePrompt('q'));
  assert.equal(prose.seed, 1 + SEED_OFFSETS.prose);
});

test('a non-number is discarded: string, NaN, Infinity, object, undefined, BigInt, null', async () => {
  const bodies = ['"18"', 'NaN', 'Infinity', '({ a: 1 })', 'undefined', '10n', 'null'];
  for (const b of bodies) {
    const run = await runProgram('function solve() { return ' + b + '; }', { timeoutMs: 2000 });
    assert.equal(run.ok, false, b + ' must not count as a vote');
    assert.equal(run.value, null);
  }
  const m = mock({ sample: (req) => prog(['"18"', 'NaN', '12', '({})', '12'][req.index]), prose: 'unused 0' });
  const r = await solveMath({ question: 'q', model: m, k: 5 });
  assert.equal(r.answer, '12');
  assert.equal(r.vote.valid, 2);
  assert.equal(r.samples.filter((s) => !s.ok).length, 3);
  assert.ok(r.samples.filter((s) => !s.ok).every((s) => /non-number/.test(s.error)));
});

test('a tie goes to the integer value, then to the earliest sample', async () => {
  const s = (v) => ({ ok: true, value: v });
  let v = vote([s(3), s(4), s(4), s(3), s(5)]);
  assert.equal(v.tie, true);
  assert.deepEqual(v.tied.sort(), ['3', '4']);
  assert.equal(v.value, 3, 'equal counts, both integers: the earlier first sample wins');
  v = vote([s(2.5), s(2.5), s(7), s(7)]);
  assert.equal(v.value, 7, 'equal counts: an integer beats a non-integer');
  v = vote([s(0.1 + 0.2), s(0.3), s(1)]);
  assert.equal(v.value, 0.3, 'float noise votes with the exact value');
  assert.equal(v.count, 2);
  assert.equal(valueKey(17.999999999999996), '18');
  assert.equal(vote([{ ok: false }, s(Number.NaN)]).value, null);
  // and through solveMath, with a mocked cell that splits its vote
  const m = mock({ sample: (req) => prog(['a + 2', 'a + 3', 'a + 3', 'a + 2'][req.index]) });
  const r = await solveMath({ question: 'q', model: m, k: 4 });
  assert.equal(r.answer, '8');
  assert.equal(r.vote.tie, true);
});

test('the sandbox clock: a program that never returns is stopped and discarded, and the next sample runs', async () => {
  const m = mock({ sample: (req) => (req.index === 0 ? fence('function solve() { while (true) {} }') : prog('a * b')) });
  const t0 = performance.now();
  const r = await solveMath({ question: 'q', model: m, k: 2, timeoutMs: 300 });
  const ms = performance.now() - t0;
  assert.equal(r.samples[0].stage, 'timeout');
  assert.equal(r.samples[0].ok, false);
  assert.ok(r.samples[0].execMs >= 290 && r.samples[0].execMs < 3000, 'stopped near its 300 ms clock, took ' + r.samples[0].execMs);
  assert.equal(r.samples[1].value, 42);
  assert.equal(r.answer, '42');
  assert.ok(ms < 10_000);
});

test('a program has no IO: require, process and fetch are refused inside the sandbox', async () => {
  for (const body of ['return require("node:fs").readdirSync(".").length;', 'return process.pid;', 'return typeof fetch === "function" ? 1 : fetch();', 'return eval("1+1");']) {
    const r = await runProgram('function solve() { ' + body + ' }');
    assert.equal(r.ok, false, body);
  }
});

test('the exact path runs first and the model is never called', async () => {
  const m = mock({});
  let r = await solveMath({ question: 'Compute: 12 * 13', model: m });
  assert.equal(r.answer, '156');
  assert.equal(r.provenance, 'exact');
  assert.equal(r.calls, 0);
  assert.equal(r.exact.method, 'exact.arith');
  r = await solveMath({ question: 'Solve for x: 2*x + 3 = 11', model: m });
  assert.equal(r.answer, '4');
  assert.equal(r.exact.method, 'exact.linear');
  assert.equal(m.seen.length, 0);
  // exact: false skips it, so the bench can measure the model arms alone
  const m2 = mock({ sample: prog('156') });
  r = await solveMath({ question: 'Compute: 12 * 13', model: m2, k: 1, exact: false });
  assert.equal(r.provenance, 'model+exact');
  assert.equal(m2.seen.length, 1);
});

test('verify: ACCEPT keeps the vote, REJECT re-samples once, a reply with no verdict is not a rejection', async () => {
  let m = mock({ sample: prog('a * b'), verify: 'Looks right.\nACCEPT' });
  let r = await solveMath({ question: 'q', model: m, k: 3, verify: true, seed: 5 });
  assert.equal(r.calls, 4);
  assert.equal(r.verify.verdict, 'accept');
  assert.equal(r.answer, '42');
  assert.equal(m.seen[3].seed, 5 + SEED_OFFSETS.verify);
  assert.match(m.seen[3].prompt, /returns 42/);

  m = mock({ sample: prog('a * b'), verify: 'Choose ACCEPT or REJECT.\nThe rate is misread.\nREJECT', resample: prog('a * b + 1') });
  r = await solveMath({ question: 'q', model: m, k: 3, verify: true });
  assert.equal(r.calls, 3 + 1 + 3);
  assert.equal(r.verify.verdict, 'reject');
  assert.equal(r.verify.resampled, true);
  assert.equal(r.verify.changed, true);
  assert.equal(r.answer, '43');
  assert.match(m.seen[4].prompt, /returned 42, and a checker judged that answer WRONG/);

  // the fresh round all fails: the first winner stands
  m = mock({ sample: prog('a * b'), verify: 'REJECT', resample: 'no code at all' });
  r = await solveMath({ question: 'q', model: m, k: 2, verify: true });
  assert.equal(r.answer, '42');
  assert.equal(r.verify.changed, false);

  m = mock({ sample: prog('a * b'), verify: 'I am not sure.' });
  r = await solveMath({ question: 'q', model: m, k: 2, verify: true });
  assert.equal(r.verify.verdict, null);
  assert.equal(r.verify.resampled, false);
  assert.equal(r.calls, 3);
});

test('no model at all: the null provider opens no socket and the answer is none', async () => {
  const r = await solveMath({ question: 'Tom has 3 cats and 2 dogs. How many pets?', k: 2 });
  assert.equal(r.provenance, 'none');
  assert.equal(r.answer, null);
  assert.equal(r.allFailed, true);
});

test('reading the model: programs, verdicts and prose numbers', () => {
  assert.equal(extractProgram('<think>```js\nfunction solve(){return 1}\n```</think>```javascript\nfunction solve() { return 2; }\nconsole.log(solve());\n```'), 'function solve() { return 2; }');
  assert.equal(extractProgram('<think>still thinking when the budget ran out'), null);
  assert.equal(extractProgram('prose only, 42'), null);
  assert.match(extractProgram('Sure: function solve() { return 3; }'), /^function solve\(\) \{ return 3; \}$/);
  assert.equal(extractProgram('```js\nexport function solve() { return 4; }\n```'), 'function solve() { return 4; }');
  assert.equal(parseVerdict('ACCEPT or REJECT? ... REJECT'), 'reject');
  assert.equal(parseVerdict('<think>REJECT</think> ACCEPT'), 'accept');
  assert.equal(parseVerdict('maybe'), null);
  assert.equal(lastNumber('It costs $1,250.50, so 18.'), '18');
  assert.equal(prosePrompt('Q?'), ALONE_PROMPT('Q?'), 'the prose fallback is the prompt shape bench/public.mjs uses');
});

test('bench/math.mjs runs end to end on a mocked cell, shares nested draws, and writes a partial verdict', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'math-bench-'));
  try {
    const recs = [];
    for (let i = 0; i < 6; i++) recs.push(JSON.stringify({ question: 'Record ' + i + ': six rows of seven.', answer: 'work\n#### 42' }));
    const trainFile = path.join(dir, 'train.jsonl');
    writeFileSync(trainFile, recs.join('\n') + '\n');
    let calls = 0;
    const completeFn = async (o) => {
      calls++;
      const p = String(o.prompt);
      let text;
      if (p.includes('Check it.')) text = 'ACCEPT';
      else if (p.includes('JavaScript program')) text = o.seed % 1000 === 1 ? prog('a * b') : prog('a * b + (' + (o.seed % 2) + ')');
      else text = 'The answer is 41.';
      return { text, ok: true, provider: 'ollama', model: o.model, ms: 5, tokens: 20 };
    };
    const lines = [];
    const v = await runBench({
      limit: 4, seed: '1', trainFile, verdictDir: dir, journalDir: dir, completeFn, probeFn: async () => true,
      bigLimit: 2, bigMinutes: 60, log: (s) => lines.push(s), argv: ['--limit', '4'],
    });
    assert.equal(v.isTheBar, false);
    assert.equal(v.writtenTo !== null, true);
    assert.ok(existsSync(path.join(dir, 'math-partial.json')));
    assert.equal(v.records.split, 'train');
    assert.equal(v.records.fallbackToTest, false);
    for (const a of ['pot5v', 'pot5', 'pot1', 'alone', 'null']) assert.equal(v.arms[a].n, 4, a);
    assert.equal(v.arms.pot1.accuracy, 1, 'k=1 is the first sample, seed index*1000+1, which the mock answers 42');
    assert.equal(v.arms.alone.accuracy, 0);
    assert.equal(v.arms.null.accuracy, 0);
    assert.equal(v.arms.pot5.callsPerRecord, 5);
    assert.equal(v.arms.pot5v.callsPerRecord, 6);
    assert.equal(v.arms.pot1.callsPerRecord, 1);
    assert.equal(v.arms.pot5.liveCallsPerRecord, 0, 'pot5 replays the first round pot5v drew');
    assert.equal(v.arms.pot1.liveCallsPerRecord, 0);
    assert.equal(v.arms.pot5v.liveCallsPerRecord, 6);
    assert.equal(v.big.arms['pot1@big'].n, 2);
    assert.equal(calls, 4 * (6 + 1) + 2 * 2, 'the queue served only the draws no arm had made before');
    assert.equal(v.arms.pot5.allProgramsFailed, 0);
    assert.match(v.statement, /exact integer accuracy/);
    assert.ok(!readFileSync(path.join(dir, 'math-partial.json'), 'utf8').includes(String.fromCharCode(0x2014)), 'no em-dash in the verdict');
    // resume reads the journal and asks the queue for nothing
    const before = calls;
    const v2 = await runBench({
      limit: 4, seed: '1', trainFile, verdictDir: dir, journalDir: dir, completeFn, probeFn: async () => true,
      bigLimit: 2, bigMinutes: 60, log: () => {}, resume: true, argv: ['--resume'],
    });
    assert.equal(calls, before);
    assert.equal(v2.arms.pot5.correct, v.arms.pot5.correct);
    // --report reads the journal read only, asks nothing of the queue, and never touches the journal
    const jfile = path.join(dir, 'math-journal-train-1.jsonl');
    const bytes = readFileSync(jfile, 'utf8');
    const v3 = await runBench({
      limit: 4, seed: '1', trainFile, verdictDir: dir, journalDir: dir,
      completeFn: async () => { throw new Error('a report must not call the model'); },
      probeFn: async () => { throw new Error('a report must not probe'); },
      bigLimit: 2, bigMinutes: 60, log: () => {}, report: true,
    });
    assert.equal(readFileSync(jfile, 'utf8'), bytes);
    assert.equal(v3.isTheBar, false);
    assert.ok(v3.whyNotTheBar.some((w) => /--report/.test(w)));
    assert.equal(v3.arms.pot5v.n, 4);
    assert.equal(v3.big.arms['alone@big'].n, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a next rung run: think reaches the program calls and not the prose call, and the verdict is a tagged partial', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'math-rung-'));
  try {
    const trainFile = path.join(dir, 'train.jsonl');
    writeFileSync(trainFile, [0, 1, 2].map((i) => JSON.stringify({ question: 'Record ' + i + ' asks.', answer: '#### 7' })).join('\n') + '\n');
    const seen = [];
    const completeFn = async (o) => {
      seen.push(o);
      const text = String(o.prompt).includes('JavaScript program') ? 'no program here' : 'So 7.';
      return { text, ok: true, provider: 'ollama', ms: 3, tokens: 5 };
    };
    const v = await runBench({
      limit: 3, trainFile, verdictDir: dir, journalDir: dir, completeFn, probeFn: async () => true,
      nobig: true, potThink: 'false', arms: 'pot1,alone', tag: 'nothink', log: () => {},
    });
    assert.equal(v.isTheBar, false);
    assert.ok(existsSync(path.join(dir, 'math-nothink-partial.json')));
    assert.ok(existsSync(path.join(dir, 'math-journal-nothink-train-1.jsonl')));
    assert.equal(v.arms.pot1.n, 3);
    assert.equal(v.arms.pot5.n, 0, 'an arm not asked for does not run');
    assert.equal(v.arms.pot1.accuracy, 1, 'every program failed, so the prose fallback answered');
    assert.equal(v.arms.pot1.allProgramsFailed, 3);
    const programCalls = seen.filter((o) => String(o.prompt).includes('JavaScript program'));
    const proseCalls = seen.filter((o) => !String(o.prompt).includes('JavaScript program'));
    assert.equal(programCalls.length, 3);
    assert.ok(programCalls.every((o) => o.think === false));
    assert.ok(proseCalls.every((o) => !('think' in o)), 'the prose call keeps the model default');
    assert.equal(proseCalls.length, 3, 'the fallback and the alone arm are one draw');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the bar and the paired test', () => {
  assert.equal(mcnemar(0, 0), 1);
  assert.ok(Math.abs(mcnemar(10, 0) - 2 * Math.pow(0.5, 10)) < 1e-12);
  const arm = (correct, n) => ({ n, correct, accuracy: correct / n, interval: { lo: null, hi: null } });
  const w = (c, n) => { const a = arm(c, n); const z = 1.96, p = c / n, d = 1 + z * z / n, ctr = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; a.interval = { lo: ctr - h, hi: ctr + h }; return a; };
  assert.equal(barOf(w(190, 200), w(140, 200), 200).met, true);
  assert.equal(barOf(w(170, 200), w(160, 200), 200).met, false);
  assert.equal(barOf(w(190, 200), w(140, 200), 250).met, false, 'fewer records than planned is not the bar');
});
