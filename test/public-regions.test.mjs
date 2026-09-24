// test/public-regions.test.mjs: bench/public.mjs through the reasoning regions (Board 11, item public).
//
// Every model cell here is a MOCK handed to run() as opts.cell (a library option, never a flag),
// so nothing calls Ollama. What is proven: the organism arm reaches the regions through ask() and
// journals its provenance per record; a resumed run skips the records its journal holds; the
// verdict carries the native and direct shares, the two rulers, the 405B row and the ETA; a bar
// file is written once; and a region whose cell was not reached is ABSENT, never wrong.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  run, journalPath, VERDICT_NAME, splitOf, gsm8kDevIds, regionsOf, makeCfg, HUMANEVAL_DEV_BELOW, NATIVE, loadHumanEval,
} from '../bench/public.mjs';
import { firstPrompt } from '../act/code.mjs';
import { humanEvalTask } from '../bench/public.mjs';
import * as P from '../act/prompt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SCRATCH = path.join(ROOT, 'bench', 'verdicts', 'public', '.scratch-regions-' + process.pid);
let n = 0;
const scratch = () => { const d = path.join(SCRATCH, String(++n)); mkdirSync(d, { recursive: true }); return d; };
after(() => { rmSync(SCRATCH, { recursive: true, force: true }); if (typeof P.closeKnowledge === 'function') P.closeKnowledge(); });
const lines = (f) => readFileSync(f, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));

// A mock cell that answers every GSM8K program with 18, verifies ACCEPT, and says 18 alone.
function mathCell(log = []) {
  return async (req) => {
    log.push(req.purpose || req.phase || 'program');
    if (req.purpose === 'verify') return { ok: true, text: 'ACCEPT', tokens: 1 };
    if (req.purpose === 'alone') return { ok: true, text: 'The answer is 18.', tokens: 5 };
    return { ok: true, text: '```javascript\nfunction solve() { return 18; }\n```', tokens: 9 };
  };
}

test('the organism arm reaches the math region through ask() and every record journals its provenance', async () => {
  const dir = scratch();
  const log = [];
  const v = await run({ set: 'gsm8k', limit: 3, seed: 't-prov', cell: mathCell(log), quiet: true, journalDir: dir, verdictDir: dir, argv: ['--set', 'gsm8k'] });
  const j = lines(journalPath(dir, 'gsm8k', 't-prov'));
  assert.equal(j[0].type, 'header');
  assert.deepEqual({ regions: j[0].fingerprint.regions, k: j[0].fingerprint.k, check: j[0].fingerprint.check }, { regions: true, k: 5, check: 1 });
  const org = j.filter((l) => l.arm === 'organism');
  assert.equal(org.length, 3);
  for (const l of org) {
    assert.equal(l.provenance, 'model+exact', 'the programs ran and were voted');
    assert.equal(l.route, 'math');
    assert.equal(l.native, false);
    assert.ok(Number.isFinite(l.us) && l.us > 0, 'the ask wall microseconds are journaled');
    assert.equal(l.region.name, 'math');
    assert.equal(l.region.provenance, 'model+exact');
    assert.equal(l.region.k, 5);
    assert.equal(l.region.verify, true);
    assert.equal(l.region.verdict, 'accept');
    assert.equal(l.got, '18');
  }
  const nul = j.filter((l) => l.arm === 'null');
  assert.equal(nul.length, 3);
  for (const l of nul) { assert.equal(l.provenance, 'memory'); assert.equal(l.native, true); assert.ok(l.us > 0); }
  const o = v.arms.organism;
  assert.equal(o.native.n, 0);
  assert.equal(o.viaModel.n, 3);
  assert.equal(o.direct.n, 0);
  assert.deepEqual(o.native.provenances, NATIVE);
  assert.equal(o.regions.math.n, 3);
  assert.equal(o.regions.math.byProvenance['model+exact'].n, 3);
  assert.equal(v.arms.null.native.n, 3);
  assert.ok(v.arms.null.native.meanUs > 0);
  assert.equal(o.splits.development.n + o.splits.heldOut.n, 3);
  assert.equal(v.ladder.row405B.system, 'Llama 3.1 405B Instruct');
  assert.equal(v.ladder.row405B.score, 96.8);
  assert.match(v.ladder.row405B.source, /^https:\/\//);
  assert.ok(v.etaWhole && v.etaWhole.of === 1319 && /ms per record x 1319 records/.test(v.etaWhole.arithmetic));
  assert.match(v.sharedQueue, /ONE Ollama queue/);
  assert.match(v.statement, /native \(exact, memory, direct: no model call\) 0 of 3/);
  assert.match(v.statement, /TWO RULERS/);
  assert.match(v.statement, /shared Ollama queue/);
  assert.equal(v.regions.on, true);
  assert.equal(log.filter((x) => x !== 'alone' && x !== 'verify').length, 15, 'k=5 programs per record, 3 records: ' + log.join(','));
  assert.equal(log.filter((x) => x === 'verify').length, 3, 'one verify call per record');
});

test('a resumed run skips the records its journal holds and asks the cell only for the new ones', async () => {
  const dir = scratch();
  const opts = { set: 'gsm8k', seed: 't-resume', quiet: true, journalDir: dir, verdictDir: dir };
  const first = [];
  await run({ ...opts, limit: 2, cell: mathCell(first) });
  assert.ok(first.length > 0);
  const again = [];
  const v2 = await run({ ...opts, limit: 2, cell: mathCell(again), resume: true });
  assert.equal(again.length, 0, 'every record was in the journal: the cell was never asked');
  assert.equal(v2.journal.armResultsReadBack, 6);
  assert.equal(v2.rate.tasksTimed, 0);
  const more = [];
  const v4 = await run({ ...opts, limit: 4, cell: mathCell(more), resume: true });
  assert.equal(v4.journal.armResultsReadBack, 6, 'the 2 held records (3 arms each) were read back');
  assert.equal(v4.rate.tasksTimed, 2, 'only the 2 new records ran');
  assert.equal(more.filter((x) => x === 'alone').length, 2, 'the alone arm was asked twice, once per new record');
  assert.equal(v4.n, 4);
  const j = lines(journalPath(dir, 'gsm8k', 't-resume'));
  assert.equal(j.filter((l) => l.type === 'arm').length, 12, 'the journal holds 4 records x 3 arms, none twice');
  for (const l of j.filter((x) => x.arm === 'organism')) assert.equal(l.region.name, 'math', 'provenance survives the resume');
});

test('--resume refuses a journal written with the regions under a different k or with them off', async () => {
  const dir = scratch();
  const opts = { set: 'gsm8k', limit: 1, seed: 't-fpk', arms: 'null', quiet: true, journalDir: dir, verdictDir: dir };
  await run(opts);
  await assert.rejects(run({ ...opts, k: 3, resume: true }), /--resume refused/);
  await assert.rejects(run({ ...opts, regions: 0, resume: true }), /--resume refused/);
});

test('HumanEval: the organism is handed the record own prompt and reaches synthesize, the alone arm keeps the Board 8 prompt', async () => {
  const dir = scratch();
  const seen = [];
  const cell = async (req) => {
    seen.push({ purpose: req.purpose || req.phase || null, prompt: String(req.prompt) });
    if (req.purpose === 'alone') return { ok: true, text: '```javascript\nfunction nope() {}\n```', tokens: 3 };
    return { ok: true, text: '```javascript\nfunction nope() {}\n```', tokens: 3 };
  };
  const v = await run({ set: 'humaneval', limit: 2, seed: 't-he', cell, quiet: true, journalDir: dir, verdictDir: dir });
  const j = lines(journalPath(dir, 'humaneval', 't-he'));
  const org = j.filter((l) => l.arm === 'organism');
  assert.equal(org.length, 2);
  for (const l of org) { assert.equal(l.route, 'code'); assert.equal(l.region.name, 'code'); assert.equal(l.region.repair, true); assert.ok(l.provenance === 'model' || l.provenance === 'model+exact'); }
  const alone = seen.filter((s) => s.purpose === 'alone');
  assert.equal(alone.length, 2);
  const recs = new Map(loadHumanEval().map((r) => [r.name, r]));
  for (const row of v.rows) {
    const rec = recs.get(row.id);
    const b = humanEvalTask(rec);
    assert.ok(alone.some((s) => s.prompt === firstPrompt(b.task, b.task.entry)), 'the alone arm got the Board 8 firstPrompt');
    assert.equal(row.split, row.index < HUMANEVAL_DEV_BELOW ? 'development' : 'heldOut');
  }
  assert.equal(v.arms.organism.regions.code.n, 2);
  assert.ok(v.ladder.row405B && v.ladder.row405B.score === 96.8, 'the 405B GSM8K row rides in the HumanEval verdict too');
  assert.ok(v.ladder.frontier.length > 0 && v.ladder.frontier.every((r) => /^https:\/\//.test(r.source)), 'the frontier rows carry sources');
});

test('the two rulers: HumanEval records 0 to 39 and the GSM8K ids math.json lists are development, the rest held out', () => {
  const hs = loadHumanEval();
  assert.equal(splitOf('humaneval', { index: 0 }), 'development');
  assert.equal(splitOf('humaneval', { index: 39 }), 'development');
  assert.equal(splitOf('humaneval', { index: 40 }), 'heldOut');
  assert.equal(splitOf('humaneval', { index: hs.length - 1 }), 'heldOut');
  const dev = gsm8kDevIds();
  const m = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'math.json'), 'utf8'));
  assert.equal(dev.set.size, new Set([...m.records.ids, 'gsm8k.0', 'gsm8k.1', 'gsm8k.2']).size);
  assert.equal(splitOf('gsm8k', { id: 'gsm8k.0' }), 'development', 'a record the prompts were probed on');
  assert.equal(splitOf('gsm8k', { id: m.records.ids[0] }), 'development');
  const out = Array.from({ length: 1319 }, (_, i) => 'gsm8k.' + i).find((id) => !dev.set.has(id));
  assert.equal(splitOf('gsm8k', { id: out }), 'heldOut');
  assert.equal(splitOf('arc', { id: 'x' }), null);
});

test('--tag names the journal and the verdict, --name the verdict only, and the regions option follows k and check', () => {
  assert.equal(VERDICT_NAME('gsm8k', true), 'public-gsm8k.json');
  assert.equal(VERDICT_NAME('gsm8k', false, null, 'smoke'), 'public-gsm8k-smoke-partial.json');
  assert.equal(VERDICT_NAME('gsm8k', true, '30b'), 'public-gsm8k-30b.json');
  assert.equal(VERDICT_NAME('gsm8k', false, '30b'), 'public-gsm8k-30b-partial.json');
  assert.equal(path.basename(journalPath('d', 'gsm8k', 'public/1')), 'gsm8k-public_1.jsonl', 'a smoke and the whole run share one journal');
  assert.equal(path.basename(journalPath('d', 'gsm8k', 'public/1', '30b')), 'gsm8k-30b-public_1.jsonl');
  assert.deepEqual(regionsOf(makeCfg({ set: 'gsm8k' })), { math: { k: 5, verify: true }, code: { k: 5, repair: true } });
  assert.deepEqual(regionsOf(makeCfg({ set: 'gsm8k', k: 3, check: 0 })), { math: { k: 3, verify: false }, code: { k: 3, repair: false } });
  assert.equal(regionsOf(makeCfg({ set: 'gsm8k', regions: 0 })), false);
  assert.equal(makeCfg({ set: 'arc' }).regions, false, 'ARC has no model and no region');
});

test('a bar file is written once: a second pass that also reaches the bar leaves the first as it was', async () => {
  const dir = scratch();
  const opts = { set: 'gsm8k', limit: 2, bar: true, seed: 't-once', quiet: true, journalDir: dir, verdictDir: dir };
  const v1 = await run({ ...opts, cell: mathCell() });
  assert.equal(v1.isTheBar, true, v1.notTheBarBecause.join('; '));
  const f = path.join(dir, 'public-gsm8k.json');
  assert.ok(existsSync(f));
  const bytes = readFileSync(f, 'utf8');
  const v2 = await run({ ...opts, cell: mathCell(), resume: true });
  assert.equal(v2.isTheBar, true);
  assert.equal(v2.writtenTo, null, 'nothing was written');
  assert.match(v2.barKept, /public-gsm8k\.json$/);
  assert.equal(readFileSync(f, 'utf8'), bytes, 'byte for byte the first bar file');
});

test('a region whose cell is not reached is ABSENT on that record, is not journaled, and a resume retries it', async () => {
  const dir = scratch();
  const dead = async () => ({ ok: false, text: '', reason: 'mock: connection refused' });
  const opts = { set: 'gsm8k', limit: 2, seed: 't-dead', arms: 'organism', quiet: true, journalDir: dir, verdictDir: dir };
  const v = await run({ ...opts, cell: dead });
  assert.equal(v.arms.organism.absent, true);
  assert.equal(v.arms.organism.absentRecords, 2);
  assert.match(v.arms.organism.reason, /not reached|connection refused/);
  assert.equal(lines(journalPath(dir, 'gsm8k', 't-dead')).length, 1, 'only the header: nothing absent is journaled');
  const w = await run({ ...opts, cell: mathCell(), resume: true });
  assert.equal(w.arms.organism.n, 2, 'the resume graded both');
});

test('a region answer is never marked capped from its SUMMED tokens: five 1000 token programs under maxTokens 3000 are not a cap', async () => {
  const dir = scratch();
  const cell = async (req) => {
    if (req.purpose === 'verify') return { ok: true, text: 'ACCEPT', tokens: 1000 };
    if (req.purpose === 'alone') return { ok: true, text: '18', tokens: 3000 };
    return { ok: true, text: '```javascript\nfunction solve() { return 18; }\n```', tokens: 1000 };
  };
  const v = await run({ set: 'gsm8k', limit: 2, seed: 't-cap', arms: 'organism,alone', cell, quiet: true, journalDir: dir, verdictDir: dir });
  const org = lines(journalPath(dir, 'gsm8k', 't-cap')).filter((l) => l.arm === 'organism');
  for (const l of org) { assert.equal(l.capped, null); assert.ok(l.tokens >= 5000, 'the sum is kept: ' + l.tokens); }
  assert.equal(v.arms.organism.cappedAtMaxTokens, 0);
  assert.equal(v.arms.organism.cappedNotReadable.n, 2);
  assert.equal(v.arms.alone.cappedAtMaxTokens, 2, 'a single alone call at maxTokens still reads as capped');
});
