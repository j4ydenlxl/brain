// test/resume.test.mjs: THE RESUME SOURCE (Board 15, item resume). Author: board 15 builder.
//
// No test here opens a socket: every model cell is a MOCK handed to bench/public.mjs run() as
// opts.cell (a library option, never a flag), the Ollama probe, the process list and the free RAM
// are seams, and every tree is planted under the OS temp directory and deleted after.
//
// What is proven:
//   1. self/resume.mjs agrees with self/gaps.mjs (scriptOf) and with bench/public.mjs (the bar and
//      journal names it derives), and it reads the real chain file into its three steps
//   2. a bench without --resume, or with --resume but no --wall-minutes, is listed as NOT
//      resumable with the reason; the public gaps group under the chain step that closes them
//   3. --wall-minutes cuts after the current record: the journal holds that record whole and the
//      next --resume continues without repeating a record
//   4. the resume starts at the last complete record: the only arm results written are those of
//      the records the journal did not hold, and the decision line kind "resumed" carries lines
//      before and after, records completed, records per minute, model calls and the cut time
//   5. a truncated last line is dropped and rewritten: the repair cuts it and the resume writes
//      that arm result again, so the journal ends whole
//   6. the queue is idle only when no consumer file moved in the window and no model bench runs
//   7. STOP and a claude model are refused, a busy queue waits, all before any probe
//   8. the soak calls the resume source at idle and writes one decision line kind "resumed";
//      --resume-minutes 0 turns it off
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync, utimesSync, appendFileSync, truncateSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as R from '../self/resume.mjs';
import { run, VERDICT_NAME, journalPath } from '../bench/public.mjs';
import { scriptOf as gapsScriptOf } from '../self/gaps.mjs';
import { runSoak } from '../self/autopilot.mjs';
import * as P from '../act/prompt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const TMP = mkdtempSync(path.join(os.tmpdir(), 'brain-resume-test-'));
let n = 0;
after(() => { if (typeof P.closeKnowledge === 'function') P.closeKnowledge(); rmSync(TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const SEED = 't-res';
const CHAIN = 'cmd.exe /c cd /d X && (node tools\\budget.mjs --ram-mb 6000 --disk-mb 200 --dir bench\\verdicts\\public --record bench\\verdicts\\public\\budget-whole-gsm8k.json -- node --max-old-space-size=6000 bench\\public.mjs --set gsm8k --limit 0 --resume --seed ' + SEED + ' > bench\\verdicts\\public\\whole-gsm8k.log 2>&1 & node tools\\budget.mjs --ram-mb 6000 --record bench\\verdicts\\public\\budget-whole-humaneval.json -- node bench\\public.mjs --set humaneval --limit 0 --resume > bench\\verdicts\\public\\whole-humaneval.log 2>&1)';
const gap = (file, cmd) => ({ id: 'never:' + file, kind: R.NEVER_KIND, verdictFile: 'bench/verdicts/' + file, benchCommand: cmd, trial: null });

// A planted tree: the gap ledger, the chain file, a cut note, and bench stubs whose TEXT says what
// they document (resumeOnce only reads a bench's text; the run itself is the in-process runner).
function plant({ gaps = null } = {}) {
  const root = path.join(TMP, 'tree-' + (++n));
  for (const d of ['state/self', 'bench/verdicts/public']) mkdirSync(path.join(root, d), { recursive: true });
  writeFileSync(path.join(root, 'bench/public.mjs'), '// stub: documents --resume and --wall-minutes\n');
  writeFileSync(path.join(root, 'bench/cloud.mjs'), '// stub: no flag to continue a cut run\n');
  writeFileSync(path.join(root, 'bench/half.mjs'), '// stub: documents --resume only\n');
  writeFileSync(path.join(root, R.CHAIN_REL), CHAIN);
  writeFileSync(path.join(root, R.CUT_REL), 'PAUSED earlier by a human.\n');
  const lines = gaps || [
    gap('public-gsm8k-partial.json', 'node bench/public.mjs --set gsm8k --limit 0 --resume'),
    gap('public-gsm8k-smoke-partial.json', 'node bench/public.mjs --set gsm8k --limit 30 --name smoke'),
    gap('public-humaneval-partial.json', 'node bench/public.mjs --set humaneval --limit 6 --seed 1'),
    gap('cloud-partial.json', 'node bench/cloud.mjs'),
    gap('half-partial.json', 'node bench/half.mjs --resume'),
  ];
  writeFileSync(path.join(root, R.GAPS_REL), lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  return root;
}

// The mock model cell: every GSM8K program returns 18, verify accepts, alone says 18.
function mathCell(log = [], delayMs = 0) {
  return async (req) => {
    log.push(req.purpose || req.phase || 'program');
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    if (req.purpose === 'verify') return { ok: true, text: 'ACCEPT', tokens: 1 };
    if (req.purpose === 'alone') return { ok: true, text: 'The answer is 18.', tokens: 5 };
    return { ok: true, text: '```javascript\nfunction solve() { return 18; }\n```', tokens: 9 };
  };
}
const benchOpts = (root, extra = {}) => ({ set: 'gsm8k', seed: SEED, quiet: true, journalDir: path.join(root, 'bench/verdicts/public'), verdictDir: path.join(root, 'bench/verdicts'), argv: ['--set', 'gsm8k'], ...extra });
const journalOf = (root) => path.join(root, 'bench/verdicts/public', 'gsm8k-' + SEED + '.jsonl');
const armLines = (file) => readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)).filter((j) => j.type === 'arm');

// The runner resumeOnce is handed in a test: bench/public.mjs run() in this process with the mock.
function inProcess({ limit, cell }) {
  const calls = [];
  const runner = async ({ root, step, minutes }) => {
    calls.push({ step: step.stem, minutes });
    const startedAt = new Date().toISOString(), t0 = Date.now();
    const v = await run(benchOpts(root, { limit, cell, resume: true, 'wall-minutes': minutes }));
    return { exit: 0, ms: Date.now() - t0, startedAt, endedAt: new Date().toISOString(), cutAt: v.cut ? v.cut.at : null, benchRate: v.rate.tasksPerMinute, argv: ['bench/public.mjs', '--resume', '--wall-minutes', String(minutes)] };
  };
  return { runner, calls };
}
const SEAMS = { idleMs: 0, procs: [], freeMb: 99999, probe: async () => ({ up: true, models: ['qwen3:1.7b'] }) };

test('self/resume.mjs agrees with self/gaps.mjs and bench/public.mjs, and reads the real chain file into its three steps', () => {
  for (const c of ['node bench/public.mjs --set gsm8k --limit 0 --resume', 'node .\\bench\\cloud.mjs', 'node --max-old-space-size=6000 bench/ladder.mjs --rows', null]) assert.equal(R.scriptOf(c), gapsScriptOf(c), String(c));
  for (const [args, set, tag] of [[['--set', 'gsm8k'], 'gsm8k', null], [['--set', 'gsm8k', '--tag', '30b', '--model', 'qwen3:30b-a3b'], 'gsm8k', '30b'], [['--set', 'humaneval'], 'humaneval', null]]) {
    const s = R.publicStep(args);
    assert.equal(s.barRel, 'bench/verdicts/' + VERDICT_NAME(set, true, tag), 'the bar file bench/public.mjs writes');
    assert.equal(s.partialRel, 'bench/verdicts/' + VERDICT_NAME(set, false, tag));
    assert.equal(s.journalRel, 'bench/verdicts/public/' + path.basename(journalPath('.', set, R.DEFAULT_SEED, tag)), 'the journal bench/public.mjs writes');
  }
  const steps = R.parseChain(readFileSync(path.join(ROOT, R.CHAIN_REL), 'utf8'));
  assert.deepEqual(steps.map((s) => s.stem), ['public-gsm8k', 'public-humaneval', 'public-gsm8k-30b']);
  assert.deepEqual(steps.map((s) => s.model), ['qwen3:1.7b', 'qwen3:1.7b', 'qwen3:30b-a3b']);
  assert.equal(steps[0].journalRel, 'bench/verdicts/public/gsm8k-public_1.jsonl');
  assert.equal(steps[0].log, 'bench/verdicts/public/whole-gsm8k.log');
  assert.ok(steps.every((s) => s.args.includes('--resume') && s.args.includes('--limit')));
  assert.deepEqual(R.resumeArgs(steps[0], 20).slice(-3), ['--resume', '--wall-minutes', '20'].slice(-3));
  assert.equal(R.resumeArgs({ args: ['--set', 'gsm8k', '--wall-minutes', '5'] }, 2).filter((a) => a === '--wall-minutes').length, 1, 'one wall, the new one');
  const argv = R.launchArgv(steps[0], 20);
  assert.equal(argv[0], 'tools/budget.mjs');
  for (const f of ['--ram-mb', '--disk-mb', '--dir', '--wait-free-ram-mb']) assert.ok(argv.includes(f), 'the budget wrapper carries ' + f);
  assert.equal(argv[argv.indexOf('--ram-mb') + 1], '6000');
  assert.ok(argv.includes('--max-old-space-size=6000'));
});

test('the CUT line a real pass prints yields the WHOLE ISO cut time (an ISO time holds colons), the RATE and a budget kill', async () => {
  const tail = [
    ' 395/1319 gsm8k.394      gold      12 | organism OK       12  11.2s [model+exact]',
    'CUT gsm8k at 2026-09-26T04:19:34.380Z: --wall-minutes 2 reached after 2.93 min and 5 record(s) run in this pass; 396 of 1319 rows done; the next record is gsm8k.396 and --resume continues from it',
    'PUBLIC gsm8k (partial): CUT by --wall-minutes 2 at 2026-09-26T04:19:34.380Z after 5 record(s) run in this pass',
    'RATE gsm8k: 1.7 tasks per minute, 35.2 s per task over 5 tasks run here, arms organism,alone,null',
  ].join('\n');
  const p = R.parseBenchTail(tail);
  assert.equal(p.cutAt, '2026-09-26T04:19:34.380Z');
  assert.equal(new Date(p.cutAt).toISOString(), p.cutAt, 'a whole ISO stamp');
  assert.equal(p.benchRate, 1.7);
  assert.equal(p.budgetKill, null);
  assert.equal(R.parseBenchTail('BUDGET KILLED ram 6100MB over the 6000MB cap\n').budgetKill, 'BUDGET KILLED ram 6100MB over the 6000MB cap');
  assert.deepEqual(R.parseBenchTail(''), { cutAt: null, benchRate: null, budgetKill: null });
  // and the CUT line bench/public.mjs itself prints parses the same way (a planted pass, the mock cell)
  const root = plant();
  const lines = [];
  const orig = console.log;
  console.log = (...a) => lines.push(a.join(' '));
  let v;
  try { v = await run({ ...benchOpts(root, { limit: 3, cell: mathCell([], 5), 'wall-minutes': 0.0001 }), quiet: false }); } finally { console.log = orig; }
  assert.ok(v.cut);
  assert.equal(R.parseBenchTail(lines.join('\n')).cutAt, v.cut.at, 'the printed CUT line carries the verdict\'s cut.at whole');
});

test('a bench without --resume is listed as not resumable; one with --resume but no --wall-minutes too; the public gaps group under the chain step that closes them', () => {
  const root = plant();
  const p = R.planResume({ root });
  assert.equal(p.never, 5);
  const why = Object.fromEntries(p.notResumable.map((x) => [x.id, x.reason]));
  assert.match(why['never:cloud-partial.json'], /bench\/cloud\.mjs documents no --resume/);
  assert.match(why['never:half-partial.json'], /documents --resume but no --wall-minutes/);
  assert.deepEqual(p.resumable.map((g) => g.step.stem), ['public-gsm8k', 'public-humaneval'], 'chain order');
  assert.deepEqual(p.resumable[0].gaps.sort(), ['never:public-gsm8k-partial.json', 'never:public-gsm8k-smoke-partial.json']);
  assert.deepEqual(p.resumable[1].gaps, ['never:public-humaneval-partial.json']);
  assert.equal(p.resumable[0].barOnDisk, false);
  writeFileSync(path.join(root, 'bench/verdicts/public-gsm8k.json'), '{}');
  assert.equal(R.planResume({ root }).resumable[0].barOnDisk, true, 'a bar file on disk is seen');
  const none = plant({ gaps: [gap('x-partial.json', 'node bench/public.mjs --set gsm8k --limit 30 --name x')] });
  writeFileSync(path.join(none, R.CHAIN_REL), 'no chain here');
  assert.match(R.planResume({ root: none }).notResumable[0].reason, /carried no --resume/);
});

test('repairJournal closes a whole unterminated last line, drops a torn one, and never touches the lines above', () => {
  const dir = path.join(TMP, 'repair-' + (++n));
  mkdirSync(dir, { recursive: true });
  const f = path.join(dir, 'j.jsonl');
  const a = JSON.stringify({ type: 'header' }), b = JSON.stringify({ type: 'arm', id: 'g.1', arm: 'alone', ok: true });
  writeFileSync(f, a + '\n' + b);
  let r = R.repairJournal(f);
  assert.equal(r.closed, true);
  assert.equal(readFileSync(f, 'utf8'), a + '\n' + b + '\n');
  writeFileSync(f, a + '\n' + b + '\n' + b.slice(0, 20));
  r = R.repairJournal(f);
  assert.equal(r.dropped.length, 1);
  assert.equal(readFileSync(f, 'utf8'), a + '\n' + b + '\n', 'the torn tail is gone, the rest byte for byte');
  writeFileSync(f, a + '\n' + b + '\n' + b.slice(0, 10) + '\n');
  r = R.repairJournal(f);
  assert.equal(r.dropped.length, 1, 'a torn line the bench had closed with a newline is dropped too');
  assert.equal(R.inspectJournal(f, ['alone']).lastLineParses, true);
});

test('--wall-minutes cuts after the current record: the journal holds it whole, and the next --resume continues without repeating a record', { timeout: 90_000 }, async () => {
  const root = plant();
  const log = [];
  const v = await run(benchOpts(root, { limit: 4, cell: mathCell(log, 5), 'wall-minutes': 0.0001 }));
  assert.ok(v.cut, 'the run was cut');
  assert.equal(v.cut.recordsRunHere, 1, 'exactly the record it was on');
  assert.equal(v.isTheBar, false);
  assert.match(v.statement, /^CUT by --wall-minutes/);
  const j = R.inspectJournal(journalOf(root));
  assert.equal(j.lines, 4, 'the header and the 3 arm rows of the one record');
  assert.equal(j.whole, 1);
  assert.equal(j.incomplete, 0);
  assert.equal(j.lastLineParses, true);
  assert.equal(j.endsWithNewline, true);
  assert.equal(log.filter((x) => x === 'alone').length, 1);
  const log2 = [];
  const w = await run(benchOpts(root, { limit: 4, cell: mathCell(log2), resume: true }));
  assert.equal(w.cut, undefined, 'no wall, no cut');
  const j2 = R.inspectJournal(journalOf(root));
  assert.equal(j2.whole, 4);
  assert.equal(j2.dupKeys, 0, 'no record was written twice');
  assert.equal(log2.filter((x) => x === 'alone').length, 3, 'only the 3 records the journal did not hold were asked');
  assert.equal(w.journal.armResultsReadBack, 3);
});

test('the resume starts at the last complete record and writes one decision line kind "resumed" with lines, records, rate, model calls and the cut', { timeout: 90_000 }, async () => {
  const root = plant();
  await run(benchOpts(root, { limit: 3, cell: mathCell() }));
  const held = new Set(armLines(journalOf(root)).map((l) => l.id));
  assert.equal(held.size, 3);
  const cellLog = [];
  const { runner, calls } = inProcess({ limit: 5, cell: mathCell(cellLog) });
  const said = [];
  const line = await R.resumeOnce({ root, minutes: 5, runner, log: (l) => said.push(l), ...SEAMS });
  assert.equal(line.decision, 'resumed', JSON.stringify(line).slice(0, 400));
  assert.equal(line.kind, 'resumed');
  assert.deepEqual(calls, [{ step: 'public-gsm8k', minutes: 5 }], 'the chain step that closes the gsm8k gaps');
  const all = armLines(journalOf(root));
  const fresh = all.filter((l) => !held.has(l.id));
  assert.equal(new Set(fresh.map((l) => l.id)).size, 2, 'the 2 records the journal did not hold');
  assert.equal(all.length, 15, 'no held record was run again');
  assert.equal(line.linesBefore, 10);
  assert.equal(line.linesAfter, 16);
  assert.equal(line.recordsBefore, 3);
  assert.equal(line.recordsAfter, 5);
  assert.equal(line.recordsCompleted, 2);
  assert.ok(line.recordsPerMinute > 0);
  assert.equal(line.repeated, 0);
  assert.equal(line.cleanCut, true);
  assert.equal(line.modelCalls, cellLog.length, 'model calls counted from the journal lines equal the calls the cell answered');
  assert.ok(!Number.isNaN(Date.parse(line.cutAt)), 'an ISO cut time');
  assert.equal(line.author, 'organism (resume)');
  const ledger = readFileSync(path.join(root, R.LEDGER_REL), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(ledger.length, 1);
  assert.equal(ledger[0].linesAfter, 16);
  const note = readFileSync(path.join(root, R.CUT_REL), 'utf8');
  assert.match(note, /^PAUSED \S+ by self\/resume\.mjs \(organism \(resume\)\)/);
  assert.match(note, /holds 16 lines/);
  assert.match(note, /HISTORY \(the note this one replaced, verbatim\):\nPAUSED earlier by a human\./);
  assert.ok(said.some((l) => /^not resumable: never:cloud-partial\.json/.test(l)), 'the not-resumable gaps are said by name');
  // a second resume continues from the new line count and repeats nothing
  const { runner: r2 } = inProcess({ limit: 6, cell: mathCell() });
  const second = await R.resumeOnce({ root, minutes: 5, runner: r2, log: () => {}, ...SEAMS });
  assert.equal(second.linesBefore, 16);
  assert.equal(second.linesAfter, 19);
  assert.equal(second.repeated, 0);
  assert.equal(R.inspectJournal(journalOf(root)).dupKeys, 0);
});

test('a truncated last line is dropped and rewritten: the repair cuts it and the resume writes that arm result again', { timeout: 90_000 }, async () => {
  const root = plant();
  await run(benchOpts(root, { limit: 3, cell: mathCell() }));
  const f = journalOf(root);
  const whole = readFileSync(f, 'utf8');
  const lastArm = armLines(f).pop();
  truncateSync(f, Buffer.byteLength(whole) - 25);
  assert.equal(R.inspectJournal(f).lastLineParses, false, 'the tail is torn');
  const cellLog = [];
  const { runner } = inProcess({ limit: 3, cell: mathCell(cellLog) });
  const line = await R.resumeOnce({ root, minutes: 5, runner, log: () => {}, ...SEAMS });
  assert.equal(line.decision, 'resumed');
  assert.equal(line.repaired.dropped, 1);
  assert.equal(line.linesBefore, 9, 'the torn line was dropped before the resume');
  assert.equal(line.linesAfter, 10);
  const j = R.inspectJournal(f);
  assert.equal(j.whole, 3);
  assert.equal(j.lastLineParses, true);
  assert.equal(j.torn, 0);
  assert.equal(j.dupKeys, 0);
  const again = armLines(f).pop();
  assert.equal(again.id + ' ' + again.arm, lastArm.id + ' ' + lastArm.arm, 'the same arm result was written again');
  assert.ok(cellLog.length <= 6, 'only the one arm was asked again: ' + cellLog.join(','));
  assert.equal(line.armLinesAdded, 1);
});

test('the queue is idle only when no consumer file moved in the window and no model bench runs; the last resume\'s own files do not count', () => {
  const root = plant();
  const brief = path.join(root, 'state/self/brief');
  mkdirSync(brief, { recursive: true });
  const f = path.join(brief, '2026-09-26.jsonl');
  writeFileSync(f, '{}\n');
  let q = R.queueState({ root, procs: [] });
  assert.equal(q.idle, false);
  assert.equal(q.busy[0].file, 'state/self/brief/2026-09-26.jsonl');
  const old = (Date.now() - 10 * 60_000) / 1000;
  for (const d of ['state/self/brief', 'bench/verdicts/public']) for (const x of readdirSync(path.join(root, d))) utimesSync(path.join(root, d, x), old, old);
  q = R.queueState({ root, procs: [] });
  assert.equal(q.idle, true, JSON.stringify(q.busy));
  q = R.queueState({ root, procs: [{ pid: 999999, cmd: 'node --max-old-space-size=6000 bench\\public.mjs --set gsm8k --resume' }] });
  assert.equal(q.idle, false, 'a live chain is another writer of the same journal');
  assert.equal(q.busy[0].what, 'process');
  assert.equal(R.queueState({ root, procs: [{ pid: 999999, cmd: 'node bin/brain.mjs self-code --auto --soak 60' }] }).idle, true);
  writeFileSync(path.join(root, 'bench/verdicts/public/gsm8k-' + SEED + '.jsonl'), '{}\n');
  assert.equal(R.queueState({ root, procs: [] }).idle, false);
  appendFileSync(path.join(root, R.LEDGER_REL), JSON.stringify({ kind: 'resumed', endedAt: new Date(Date.now() + 1000).toISOString(), step: { journalRel: 'bench/verdicts/public/gsm8k-' + SEED + '.jsonl', log: 'bench/verdicts/public/whole-gsm8k.log' } }) + '\n');
  assert.equal(R.queueState({ root, procs: [] }).idle, true, 'a write explained by this tree\'s own ended resume is not another consumer');
  assert.equal(R.queueState({ root, procs: [], exclude: ['state/self/brief'] }).checked >= 1, true);
});

test('STOP and a claude model are refused and a busy queue waits, all before any probe; a dry run launches nothing', async () => {
  const root = plant();
  const probe = async () => { throw new Error('the probe must not run'); };
  writeFileSync(path.join(root, R.STOP_REL), '');
  assert.equal((await R.resumeOnce({ root, probe, procs: [], log: () => {} })).wall, 'stop');
  rmSync(path.join(root, R.STOP_REL));
  const c = plant({ gaps: [gap('public-gsm8k-partial.json', 'node bench/public.mjs --set gsm8k --limit 0 --resume')] });
  writeFileSync(path.join(c, R.CHAIN_REL), CHAIN.replace('--seed ' + SEED, '--seed ' + SEED + ' --model claude-opus'));
  const refused = await R.resumeOnce({ root: c, probe, procs: [], log: () => {} });
  assert.equal(refused.decision, 'refused');
  assert.equal(refused.wall, 'model');
  mkdirSync(path.join(root, 'state/self/brief'), { recursive: true });
  writeFileSync(path.join(root, 'state/self/brief/today.jsonl'), '{}\n');
  const busy = await R.resumeOnce({ root, probe, procs: [], idleMs: 60_000, log: () => {} });
  assert.equal(busy.decision, 'waiting');
  assert.equal(busy.wall, 'queue');
  const launched = [];
  const dry = await R.resumeOnce({ root, dry: true, runner: async () => { launched.push(1); return {}; }, log: () => {}, ...SEAMS });
  assert.equal(dry.decision, 'would-resume');
  assert.match(dry.reason, /tools\/budget\.mjs --ram-mb 6000/);
  assert.equal(launched.length, 0);
  assert.equal(existsSync(path.join(root, R.LOCK_REL)), false, 'the lock is released');
  const done = plant({ gaps: [gap('cloud-partial.json', 'node bench/cloud.mjs')] });
  const nothing = await R.resumeOnce({ root: done, probe, procs: [], log: () => {} });
  assert.equal(nothing.decision, 'nothing');
  assert.equal(nothing.notResumable[0].id, 'never:cloud-partial.json');
});

test('the soak calls the resume source at idle and writes one decision line kind "resumed"; --resume-minutes 0 turns it off', { timeout: 60_000 }, async () => {
  const root = plant();
  const tmpBase = path.join(TMP, 'soak-tmp-' + (++n));
  mkdirSync(tmpBase, { recursive: true });
  const asked = [];
  const resumeFn = async (o) => {
    asked.push(o.minutes);
    if (asked.length > 1) return { decision: 'nothing', reason: 'planted: nothing left' };
    return { kind: 'resumed', decision: 'resumed', source: 'resume', step: { stem: 'public-gsm8k', barRel: 'bench/verdicts/public-gsm8k.json' }, linesBefore: 1111, linesAfter: 1150, recordsCompleted: 13, recordsPerMinute: 1.9, modelCalls: 91, cutAt: new Date().toISOString(), barLanded: false, tail: 'not kept' };
  };
  const opts = { root, tmpBase, soak: 0.03, sources: 'resume', author: 'off', 'gate-minutes': 0, 'idle-step-ms': 100, rateFn: () => ({ ok: false, reason: 'not read in a test' }), grade: false, resumeMinMs: 0, resumeMarginMs: 0, log: () => {} };
  const r = await runSoak({ ...opts, resumeFn, 'resume-minutes': 7 });
  assert.equal(r.exitCode, 0, String(r.reason));
  assert.equal(asked.length, 2, 'asked once, then told there is nothing left');
  assert.ok(asked[0] > 0 && asked[0] <= 7, 'the wall handed over is inside --resume-minutes: ' + asked[0]);
  const dir = path.join(root, 'bench/verdicts/autopilot');
  const lines = readdirSync(dir).flatMap((f) => readFileSync(path.join(dir, f), 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)));
  const resumed = lines.filter((l) => l.kind === 'resumed');
  assert.equal(resumed.length, 1);
  assert.equal(resumed[0].source, 'resume');
  assert.equal(resumed[0].linesBefore, 1111);
  assert.equal(resumed[0].linesAfter, 1150);
  assert.equal(resumed[0].modelCalls, 91);
  assert.equal(resumed[0].tail, undefined, 'the output tail stays out of the decision file');
  const st = JSON.parse(readFileSync(path.join(root, r.soakFile), 'utf8'));
  assert.equal(st.resume.runs.length, 1);
  assert.equal(st.resume.modelCalls, 91);
  const off = [];
  const r0 = await runSoak({ ...opts, resumeFn: async (o) => { off.push(o); return { decision: 'nothing' }; }, 'resume-minutes': 0 });
  assert.equal(r0.exitCode, 0);
  assert.equal(off.length, 0, '--resume-minutes 0: never called');
  assert.ok(statSync(path.join(root, r0.soakFile)).isFile());
});
