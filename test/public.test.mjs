// test/public.test.mjs: the three public sets, graded against the thing each claim replaced.
//
// Every claim here is a claim about bench/public.mjs that a reader of the verdict files would
// otherwise have to take on trust: that the sample is the same sample twice, that the ARC arm
// solves a task whose program is in the vocabulary and does NOT solve the same task with one
// cell changed, that the budget is a real deadline and not a hope, that the HumanEval grade is
// a real sandbox with a real refusal in it, that the opt in plan arm computes rather than reads
// a number out of the model's prose, and (Board 8) that a killed run loses nothing: the journal
// holds every graded arm result, --resume runs only what it does not hold, a torn line costs
// one result and no more, and the bar file is never written by a narrow or unfinished run.
//
// No test here opens a socket: every run is the null arm or ARC, neither of which has a model.
// Scratch journals and verdicts go under bench/verdicts/public/.scratch-*, inside the tree,
// and are removed when the test ends.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, mkdirSync, rmSync, appendFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import { G } from '../cells/grid.mjs';
import { runTests } from '../act/run.mjs';
import {
  sampleIds, arcTask, loadArc, loadGsm8k, loadHumanEval,
  finalAnswer, lastNumber, parsePlan, evalPlan, sameInteger,
  parseVisible, humanEvalEntry, cutAtStopTokens, wilson, nFor95, planArms,
  run, barStatus, comparePublished, journalPath, readJournal, fmtDuration, BAR_ARMS, budgetOf,
} from '../bench/public.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SCRATCH = path.join(ROOT, 'bench', 'verdicts', 'public', '.scratch-test-' + process.pid);
let scratchN = 0;
const scratch = () => { const d = path.join(SCRATCH, String(++scratchN)); mkdirSync(d, { recursive: true }); return d; };
after(() => rmSync(SCRATCH, { recursive: true, force: true }));

// ---------------------------------------------------------------- the sample
test('the sampler returns the same ids twice at one seed and different ids at another', () => {
  const ids = loadArc().map((t) => t.id);
  assert.equal(ids.length, 400);
  const a = sampleIds(ids, 25, 'public/1');
  const b = sampleIds(ids, 25, 'public/1');
  assert.deepEqual(a, b, 'one seed, one sample');
  assert.equal(a.length, 25);
  const c = sampleIds(ids, 25, 'public/2');
  assert.notDeepEqual(a, c, 'a different seed must draw a different sample');
  // The sample runs in the set's own order, so an arm is never compared against an order.
  assert.deepEqual(a, [...a].sort(), 'the sample keeps the set\'s order');
  assert.deepEqual(sampleIds(ids, 0, 'public/1'), ids, 'limit 0 is the whole set');
});

// ---------------------------------------------------------------- ARC, the organism arm
// A task whose hidden program IS in tasks/grid.mjs's vocabulary, built here from cells/grid.mjs
// primitives on hand grids, so the claim is about the arm and not about ARC being easy.
function rotateTask(seed = 'test/arc') {
  const rng = new RNG(seed);
  const pair = () => {
    const rows = [[rng.int(9) + 1, rng.int(9) + 1, 0], [0, rng.int(9) + 1, rng.int(9) + 1], [rng.int(9) + 1, 0, rng.int(9) + 1]];
    const g = G.from(rows);
    return { input: G.rows(g), output: G.rows(G.rotate(g, 1)) };
  };
  return { train: [pair(), pair(), pair()], test: [pair()] };
}

test('the ARC organism arm solves a depth 1 task in its vocabulary and fails the same task with one cell changed', async () => {
  const task = rotateTask();
  const good = await arcTask(task, { budgetMs: 5000 });
  assert.equal(good.solved, true, 'a rotate1 task must be solved: ' + JSON.stringify(good.found));
  assert.equal(good.timedOut, false);
  assert.ok(Array.isArray(good.found) && good.found.length >= 1, 'a program must have been found');

  const altered = JSON.parse(JSON.stringify(task));
  altered.test[0].output[0][0] = (altered.test[0].output[0][0] + 1) % 10;
  const bad = await arcTask(altered, { budgetMs: 5000 });
  assert.equal(bad.solved, false, 'one changed cell in the test output must cost the task');
  console.log('ARC arm: solved=' + good.solved + ' in ' + good.ms + ' ms, altered solved=' + bad.solved + ' in ' + bad.ms + ' ms');
});

test('the budget is a deadline: an impossible task on big grids fails at about budgetMs', async () => {
  const rng = new RNG('test/arc/impossible');
  const grid = (w, h) => {
    const rows = [];
    for (let y = 0; y < h; y++) { const r = []; for (let x = 0; x < w; x++) r.push(rng.int(10)); rows.push(r); }
    return rows;
  };
  // Input and output are unrelated grids of the same size, so no composition of the vocabulary
  // reproduces them and the search runs the whole depth 3 tree before it can say so.
  const pair = () => ({ input: grid(30, 30), output: grid(30, 30) });
  const train = [];
  for (let i = 0; i < 8; i++) train.push(pair());
  const task = { train, test: [pair()] };

  // The deadline is calibrated against the same task run without one, so the claim is that a
  // budget STOPS a search that would otherwise finish later, and not that some number is small.
  const free = await arcTask(task, { budgetMs: 120_000 });
  assert.equal(free.timedOut, false, 'the unbudgeted run must finish');
  assert.equal(free.solved, false, 'no program in the vocabulary fits unrelated grids');
  const budgetMs = Math.max(50, Math.round(free.ms / 4));
  const r = await arcTask(task, { budgetMs });
  console.log('the whole search took ' + free.ms + ' ms; with a budget of ' + budgetMs + ' ms the task came back after ' + r.ms + ' ms, timedOut=' + r.timedOut);
  assert.equal(r.timedOut, true, 'the search must have been stopped by the deadline');
  assert.equal(r.solved, false);
  assert.ok(r.ms >= budgetMs, 'the deadline must not fire early: ' + r.ms);
  assert.ok(r.ms < budgetMs + 2000, 'the deadline must fire at about the budget: ' + r.ms);
});

// ---------------------------------------------------------------- the HumanEval sandbox
const GOOD = 'function add(a, b) { return a + b; }';
const BAD = 'function add(a, b) { return a * b; }';
const SUITE = [
  "const assert = require('node:assert');",
  'function test() {',
  '  let candidate = add;',
  '  assert.deepEqual(candidate(2, 3), 5);',
  '  assert.deepEqual(candidate([1], [2]), "12");',
  '}',
  'test();',
].join('\n');

test('runTests passes a correct function against an assert.deepEqual suite and fails a wrong one', async () => {
  const good = await runTests(GOOD, SUITE);
  assert.equal(good.passed, true, 'the correct function must pass: ' + good.error);
  assert.equal(good.error, null);
  const bad = await runTests(BAD, SUITE);
  assert.equal(bad.passed, false, 'the wrong function must fail');
  assert.match(String(bad.error), /AssertionError/);
  console.log('runTests: good passed in ' + good.ms + ' ms, wrong failed with ' + bad.error);
});

test('a suite that requires anything but node:assert, or touches process, fails with the error recorded and this process untouched', async () => {
  const beforeExit = process.exitCode;
  const fs = await runTests(GOOD, "const x = require('node:fs'); x.readFileSync('anything');");
  assert.equal(fs.passed, false);
  assert.match(String(fs.error), /SandboxError/);
  assert.match(String(fs.error), /node:fs/);

  const proc = await runTests(GOOD, 'process.exit(1);');
  assert.equal(proc.passed, false);
  assert.match(String(proc.error), /ReferenceError/);
  assert.match(String(proc.error), /process/);

  // The claim that matters: the grading process is still here, still running, still with the
  // exit code it had. A sandbox that let process.exit through would not reach this line.
  assert.equal(process.exitCode, beforeExit);
  assert.equal(typeof process.pid, 'number');
  console.log('sandbox refusals: ' + fs.error + ' | ' + proc.error);
});

test('the doctests in a record\'s own prompt are the visible cases, and the stop tokens cut a completion', () => {
  const recs = loadHumanEval();
  assert.equal(recs.length, 161);
  const first = recs.find((r) => r.name === 'HumanEval_0_has_close_elements');
  assert.equal(humanEvalEntry(first), 'has_close_elements');
  const v = parseVisible(first.prompt, 'has_close_elements');
  assert.equal(v.cases.length, 2);
  assert.deepEqual(v.cases[0], { args: [[1.0, 2.0, 3.0], 0.5], expected: false });
  const cut = cutAtStopTokens('function a(){}\nfunction b(){}', first.stop_tokens);
  assert.equal(cut.text, 'function a(){}');
  assert.equal(cut.cutAt, '\nfunction ');
});

// ---------------------------------------------------------------- GSM8K
test('the plan evaluator computes the eggs plan exactly and rejects a word that is neither let nor a bound name', () => {
  const plan = parsePlan('let eggs = 16 - 3 - 4\neggs * 2');
  assert.equal(plan.ok, true, plan.reason);
  assert.deepEqual(plan.lets, [{ name: 'eggs', expr: '16 - 3 - 4' }]);
  const out = evalPlan(plan);
  assert.equal(out.ok, true, out.reason);
  assert.equal(out.value, '18');
  assert.equal(out.steps[0].value, '9', 'the intermediate is exact too');

  const prose = parsePlan('let eggs = 16 - 3 - 4\neggs * price');
  assert.equal(prose.ok, false);
  assert.match(String(prose.reason), /"price"/);
  const words = parsePlan('She has 16 eggs\nlet eggs = 16 - 3 - 4\neggs * 2');
  assert.equal(words.ok, false, 'a prose line is not a plan line');
  assert.equal(evalPlan(words).ok, false);
});

test('the #### extractor reads 18 from the first GSM8K record, and exact means exact', () => {
  const recs = loadGsm8k();
  assert.equal(recs.length, 1319);
  assert.equal(finalAnswer(recs[0]), '18');
  assert.equal(sameInteger('18', '18'), true);
  assert.equal(sameInteger('18.0', '18'), true);
  assert.equal(sameInteger('180', '18'), false);
  assert.equal(sameInteger(null, '18'), false);
  // Every GSM8K arm reads the LAST number, which is the arms' one ruler. A decimal is read
  // whole: "$18.00" read as integers ends in 00, an answer the model did not give.
  assert.equal(lastNumber('she makes 9 eggs, so 9 * 2 = 18'), '18');
  assert.equal(lastNumber('<think>the answer is 7</think> 18'), '18');
  assert.equal(lastNumber('no numbers here'), null);
  assert.equal(lastNumber('she earns **$18.00** a day'), '18.00');
  assert.equal(sameInteger(lastNumber('she earns $18.00 a day'), '18'), true, '18.00 is 18');
  assert.equal(sameInteger(lastNumber('about 18.5 eggs'), '18'), false, '18.5 is not 18, and is not 5 either');
  assert.equal(lastNumber('she earns $1,080 in all'), '1080');
});

// ---------------------------------------------------------------- the boundary
// The organism arm is act/prompt.mjs ask(), which ANSWERS and acts on nothing. plan() and
// doPrompt() are where words become proposals, and public data must never reach them.
test('the bench imports ask() and nothing else from act/prompt.mjs, and never plan() or doPrompt()', () => {
  const src = readFileSync(path.join(ROOT, 'bench', 'public.mjs'), 'utf8');
  const imports = [...src.matchAll(/^import\s+([\s\S]*?)\s+from\s+'([^']+)';$/gm)];
  assert.ok(imports.length > 0, 'the source must have imports to check');
  const fromPrompt = imports.filter(([, , from]) => /prompt/.test(from));
  assert.equal(fromPrompt.length, 1, 'exactly one import from a prompt module');
  assert.equal(fromPrompt[0][2], '../act/prompt.mjs');
  const names = fromPrompt[0][1].replace(/[{}\s]/g, '').split(',').filter(Boolean).sort();
  assert.deepEqual(names, ['ROUTES', 'ask'], 'ask() and the ROUTES constant, nothing else: ' + names.join(','));
  for (const [, n] of imports) {
    assert.equal(/\bplan\b/.test(n), false, 'plan() is never imported: ' + n);
    assert.equal(/\bdoPrompt\b/.test(n), false, 'doPrompt() is never imported: ' + n);
  }
  assert.equal(/import\(\s*[^)]*prompt/.test(src), false, 'no dynamic import of a prompt module either');
});

// The same claim BY BEHAVIOUR: a run over public records leaves in the organism's ledger the
// act.ask events it asked, one per record, and no event of any other type. The null arm is
// the ask() path with the model switched off, so this runs with no socket.
test('a null arm run over public records writes one act.ask per record to the ledger and nothing else', async () => {
  const dir = scratch();
  const g = await run({ set: 'gsm8k', limit: 3, seed: 't-ledger', arms: 'null', quiet: true, journalDir: dir, verdictDir: dir });
  assert.deepEqual(g.ledgerEvents, { 'act.ask': 3 });
  assert.equal(g.memoryEpisodes, 0, 'nothing from a public set is in memory before it is graded');
  const h = await run({ set: 'humaneval', limit: 2, seed: 't-ledger', arms: 'null', quiet: true, journalDir: dir, verdictDir: dir });
  assert.deepEqual(h.ledgerEvents, { 'act.ask': 2 });
  assert.equal(h.arms.null.n, 2);
  assert.equal(h.arms.null.correct, 0, 'the organism with no model writes no passing function');
  for (const r of [...g.rows, ...h.rows]) assert.equal(r.arms.null.provenance, 'memory', 'the null arm answered from memory, not from a model');
});

// ---------------------------------------------------------------- write once, and the journal
const journalLines = (file) => readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());

test('a narrow run writes only the -partial file, isTheBar false, with the published rows, and journals every graded arm result', async () => {
  const dir = scratch();
  const v = await run({ set: 'gsm8k', limit: 5, seed: 't-narrow', arms: 'null', quiet: true, journalDir: dir, verdictDir: dir, argv: ['--set', 'gsm8k'] });
  assert.equal(v.isTheBar, false);
  assert.equal(v.complete, true, 'the run finished; it is still not the bar');
  assert.ok(v.notTheBarBecause.some((w) => /a sample of 5 of 1319/.test(w)), v.notTheBarBecause.join('; '));
  assert.ok(existsSync(path.join(dir, 'public-gsm8k-partial.json')));
  assert.equal(existsSync(path.join(dir, 'public-gsm8k.json')), false, 'a narrow run never writes the bar file');
  const onDisk = JSON.parse(readFileSync(path.join(dir, 'public-gsm8k-partial.json'), 'utf8'));
  assert.equal(onDisk.isTheBar, false);
  assert.equal(onDisk.published.length > 0, true, 'the published rows ride in every verdict');
  assert.ok(onDisk.published.some((r) => /405B/.test(r.system)), 'the 405B row is among them');
  assert.match(onDisk.statement, /^PARTIAL, isTheBar false/);
  for (const k of ['at', 'command', 'node', 'statement']) assert.ok(onDisk[k], 'the verdict carries ' + k);
  const lines = journalLines(journalPath(dir, 'gsm8k', 't-narrow')).map((l) => JSON.parse(l));
  assert.equal(lines[0].type, 'header');
  assert.deepEqual(lines[0].fingerprint, { set: 'gsm8k', seed: 't-narrow', model: 'qwen3:1.7b', route: null, maxTokens: 3000, regions: true, k: 5, check: 1 });
  assert.equal(lines.length, 1 + 5, 'one header and one line per graded arm result');
  assert.deepEqual(lines.slice(1).map((l) => l.id), v.rows.map((r) => r.id), 'journaled in the order they ran');
});

test('a fresh run over an existing journal moves it aside and deletes nothing', async () => {
  const dir = scratch();
  const opts = { set: 'gsm8k', limit: 3, seed: 't-aside', arms: 'null', quiet: true, journalDir: dir, verdictDir: dir };
  await run(opts);
  const file = journalPath(dir, 'gsm8k', 't-aside');
  const first = readFileSync(file, 'utf8');
  const v = await run(opts);
  const aside = readdirSync(dir).filter((f) => /^gsm8k-t-aside\.superseded-.*\.jsonl$/.test(f));
  assert.equal(aside.length, 1, 'the first journal was moved aside: ' + readdirSync(dir).join(','));
  assert.equal(readFileSync(path.join(dir, aside[0]), 'utf8'), first, 'byte for byte');
  assert.equal(v.journal.movedAside.endsWith(aside[0]), true);
  assert.equal(journalLines(file).length, 1 + 3, 'the new journal starts over');
});

test('--resume refuses a journal written under a different configuration and names the difference', async () => {
  const dir = scratch();
  await run({ set: 'gsm8k', limit: 2, seed: 't-fp', arms: 'null', model: 'm-one', quiet: true, journalDir: dir, verdictDir: dir });
  await assert.rejects(
    run({ set: 'gsm8k', limit: 2, seed: 't-fp', arms: 'null', model: 'm-two', resume: true, quiet: true, journalDir: dir, verdictDir: dir }),
    (e) => /--resume refused/.test(e.message) && /model "m-one"/.test(e.message) && /model "m-two"/.test(e.message),
  );
  // the same flags resume, read everything back, and run nothing
  const v = await run({ set: 'gsm8k', limit: 2, seed: 't-fp', arms: 'null', model: 'm-one', resume: true, quiet: true, journalDir: dir, verdictDir: dir });
  assert.equal(v.journal.armResultsReadBack, 2);
  assert.equal(v.rate.tasksTimed, 0, 'no task ran again');
  assert.equal(v.n, 2);
});

// THE KILL. A real child process running the real CLI is killed mid run, the way a session
// ending kills it, and the run is then resumed. ARC is the set because it has no model: the
// test opens no socket and the child spends real time per task, so the kill lands mid way.
test('a killed run resumes from its journal, runs only what the journal did not hold, and finishes with the same task count', async () => {
  const dir = scratch();
  const limit = 60, seed = 't-kill';
  const file = journalPath(dir, 'arc', seed);
  const child = spawn(process.execPath, [path.join(ROOT, 'bench', 'public.mjs'), '--set', 'arc', '--limit', String(limit), '--seed', seed, '--journalDir', dir, '--verdictDir', dir, '--quiet'], { stdio: 'ignore' });
  let exited = null;
  child.on('exit', (code) => { exited = code; });
  const t0 = Date.now();
  while (Date.now() - t0 < 60_000) {
    if (existsSync(file) && journalLines(file).length >= 1 + 4) break;
    if (exited !== null) break;
    await new Promise((r) => setTimeout(r, 15));
  }
  assert.equal(exited, null, 'the child must still be running when it is killed, or this test proves nothing');
  child.kill('SIGKILL');
  await new Promise((r) => (exited !== null ? r() : child.once('exit', r)));
  const atKill = readJournal(file);
  assert.ok(atKill.records.size >= 4 && atKill.records.size < limit, 'killed mid way: ' + atKill.records.size + ' of ' + limit);
  // A kill inside a write leaves a torn line; one is appended here so the claim is tested every time.
  appendFileSync(file, '{"type":"arm","id":"0000');
  assert.equal(existsSync(path.join(dir, 'public-arc.json')), false, 'a killed run never wrote the bar file');

  const v = await run({ set: 'arc', limit, seed, resume: true, quiet: true, journalDir: dir, verdictDir: dir });
  assert.equal(v.n, limit, 'the resumed run finishes with the same task count');
  assert.equal(v.journal.resumed, true);
  assert.equal(v.journal.tornLines, 1, 'the torn line was skipped and counted');
  assert.equal(v.journal.armResultsReadBack, atKill.records.size, 'every result the killed run journaled was read back');
  assert.equal(v.rate.tasksTimed, limit - atKill.records.size, 'and only the rest ran');
  assert.deepEqual(v.rows.map((r) => r.id), sampleIds(loadArc().map((t) => t.id), limit, seed), 'the same sample, in the set order');
  // What a task measured, without its wall time: the search is deterministic, so these are
  // equal between any two runs of one task, and ms is not.
  const measured = (c) => JSON.stringify([c.ok, c.exhausted, c.timedOut, c.searched, c.found]);
  for (const r of v.rows) {
    const held = atKill.records.get(r.id + '\u0000organism');
    if (held) {
      assert.equal(r.arms.organism.journal, true, 'read back, not run again: ' + r.id);
      assert.equal(measured(r.arms.organism), measured(held), 'a read back result is the journaled result: ' + r.id);
    }
  }
  assert.equal(readJournal(file).records.size, limit, 'the journal now holds the whole run, the torn line cost nothing else');
  assert.equal(readJournal(file).torn, 1);

  // The resumed run measures what an uninterrupted run measures, task for task.
  const whole = await run({ set: 'arc', limit, seed, quiet: true, write: false });
  assert.deepEqual(v.rows.map((r) => r.id + ' ' + measured(r.arms.organism)), whole.rows.map((r) => r.id + ' ' + measured(r.arms.organism)));
  assert.equal(v.arms.organism.correct, whole.arms.organism.correct);
  assert.ok(v.rows.some((r) => r.arms.organism.searched > 0), 'the comparison compared real searches');
  console.log('killed after ' + atKill.records.size + ' of ' + limit + ' ARC tasks; the resume read them back, ran ' + v.rate.tasksTimed
    + ', and solved ' + v.arms.organism.correct + ' of ' + v.n + ', the same as an uninterrupted run');
});

// ---------------------------------------------------------------- the bar and the published rows
test('the bar is the whole set, finished, with every bar arm graded, and nothing else', () => {
  const whole = { set: 'gsm8k', limit: 0, bar: false, arms: ['organism', 'alone', 'null'], complete: true, absentRecords: 0, of: 1319 };
  assert.equal(barStatus(whole).isTheBar, true);
  assert.equal(barStatus({ ...whole, limit: 6 }).isTheBar, false, 'a sample is not the bar');
  assert.equal(barStatus({ ...whole, limit: 6, bar: true }).isTheBar, true, 'unless the caller declares it with --bar');
  assert.equal(barStatus({ ...whole, limit: 5000 }).isTheBar, true, 'a limit past the set is the whole set');
  assert.equal(barStatus({ ...whole, complete: false }).isTheBar, false, 'an unfinished run is never the bar');
  assert.equal(barStatus({ ...whole, absentRecords: 2 }).isTheBar, false, 'an absent arm result is never the bar');
  assert.equal(barStatus({ ...whole, arms: ['organism', 'null'] }).isTheBar, false, 'a missing bar arm is never the bar');
  assert.equal(barStatus({ ...whole, arms: ['organism', 'alone', 'null', 'plan'] }).isTheBar, true, 'an opt in arm beside the bar arms does not spoil it');
  assert.equal(barStatus({ ...whole, set: 'arc', of: 400, arms: ['organism'] }).isTheBar, true, 'ARC\'s bar is its one arm');
  assert.deepEqual(BAR_ARMS.arc, ['organism']);
  assert.match(barStatus({ ...whole, limit: 6 }).why.join(), /a sample of 6 of 1319/);
});

test('the published comparison names the rows the organism is above and below, and what the interval decides', () => {
  const rows = [{ system: 'no model bar', score: 17 }, { system: 'open 405B', score: 96.8 }, { system: 'mid', score: 50 }];
  const iv = wilson(5, 10);
  const c = comparePublished(0.5, iv, rows);
  assert.deepEqual(c.beats.map((r) => r.system), ['no model bar']);
  assert.deepEqual(c.doesNotBeat.map((r) => r.system), ['open 405B', 'mid'], 'a tie is not a win');
  assert.deepEqual(c.decidedAbove.map((r) => r.system), ['no model bar'], 'the interval lower edge clears 17');
  assert.deepEqual(c.decidedBelow.map((r) => r.system), ['open 405B'], 'the interval upper edge is under 96.8');
  assert.deepEqual(c.undecided.map((r) => r.system), ['mid']);
  assert.deepEqual(comparePublished(null, iv, rows).beats, [], 'an absent arm beats nothing');
  assert.equal(fmtDuration(3_723_000), '1h 02m 03s');
  assert.equal(fmtDuration(43_000), '0m 43s');
});

test('the arithmetic the verdicts print is the arithmetic the other benches print', () => {
  const w = wilson(1, 2);
  assert.ok(w.lo > 0 && w.hi < 1 && w.width > 0);
  assert.deepEqual(wilson(0, 0), { lo: null, hi: null, width: null });
  assert.equal(nFor95(0.5, 0.5), null, 'no gap needs no n');
  assert.equal(nFor95(0.6, 0.4), Math.max(1, Math.ceil((1.96 * 1.96 * (0.6 * 0.4 + 0.4 * 0.6)) / (0.2 * 0.2))));
  const p = planArms(4);
  assert.equal(p.length, 4);
  assert.notEqual(p[0][0], p[1][0], 'the first arm rotates');
  for (const row of p) assert.deepEqual([...row].sort(), ['alone', 'null', 'organism']);
});

test('an answer that spent the whole token budget is marked capped, and a free or unknown one never is', () => {
  // Board 8 measured this: at maxTokens 1600 qwen3:1.7b spent exactly 1600 tokens thinking and
  // returned no answer text, so a capped row is graded on the budget as much as on the model.
  assert.deepEqual(budgetOf(1600, { maxTokens: 1600 }), { tokens: 1600, capped: true });
  assert.deepEqual(budgetOf(1728, { maxTokens: 4000 }), { tokens: 1728, capped: false });
  assert.deepEqual(budgetOf(0, { maxTokens: 4000 }), { tokens: 0, capped: false });
  // solve() answering exactly never called the model, and a budget of none caps nothing
  assert.deepEqual(budgetOf(null, { maxTokens: 4000 }), { tokens: null, capped: false });
  assert.deepEqual(budgetOf(5000, { maxTokens: null }), { tokens: 5000, capped: false });
});
