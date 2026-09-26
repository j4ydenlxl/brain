// test/brief.test.mjs: THE BRIEF OPERATOR (Board 15, item brief).
//
// No Ollama: the author is test/brief-plant.mjs mockAuthor(), which answers the planned files, then
// a FAILING test file, then the fix. The "real tree" is a planted temp tree (plantBriefTree) with a
// fixture gate; the run writes its records into a temp state root; nothing here writes the brain.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync, existsSync, mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runBrief, briefCeiling, validatePlan, validateFile, parseBoardText, gapOf, grammarPlan, codeBlocks, ownedFiles,
  provenanceShare, failureLines, repairTarget, BRIEF_AUTHOR, REPAIR_ROUNDS, WALLS, thinkBudgetCall, gateBaseline, gateDeltaOf,
} from '../self/brief.mjs';
import http from 'node:http';
import { hashTree } from '../self/improve.mjs';
import { OPERATORS, OPERATOR_NAMES, author, makeBudget } from '../self/operators.mjs';
import { DirectTable } from '../memory/direct.mjs';
import { PLANTED_BOARD, plantBriefTree, mockAuthor, CLAMP_TEST, FAKE_GATE_RED } from './brief-plant.mjs';
import { plantTree, plantGaps, mockAuthor as mockDiffAuthor, AUTHOR_DIFF_GOOD } from './operators-plant.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const temps = [];
const tmp = (p) => { const d = mkdtempSync(path.join(os.tmpdir(), p)); temps.push(d); return d; };
const tree = () => { const d = plantBriefTree(); temps.push(d); return d; };
const lines = (f) => readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const clampGap = () => gapOf(parseBoardText(PLANTED_BOARD, { file: '<planted>' }).items[0], 'planted');
const quiet = () => {};
const run = (gap, o) => runBrief(gap, { gateKit: false, waitFreeRamMb: 0, log: quiet, ...o });
test.after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true }); });

test('the planted board parses in the real grammar, and board-13 yields its items without the script\'s own key: it.key', () => {
  const p = parseBoardText(PLANTED_BOARD, { file: '<planted>' });
  assert.deepEqual(p.errors, []);
  assert.deepEqual(p.items.map((i) => i.key), ['clamp']);
  const g = clampGap();
  assert.equal(g.id, 'board-planted:clamp');
  assert.equal(g.verdictFile, 'bench/verdicts/planted-clamp.json');
  assert.equal(g.files.length, 4);
  const cb = codeBlocks(g.brief);
  assert.equal(cb.length, 1);
  assert.equal(cb[0].entry, 'clampSum');
  const gp = grammarPlan(g, tree());
  assert.deepEqual(gp.plan.files, ['planted/clamp.mjs', 'test/planted-clamp.test.mjs', 'bench/planted-clamp.mjs']);
  assert.equal(gp.plan.test, 'node --test test/planted-clamp.test.mjs');
  assert.equal(gp.plan.bar, 'node bench/planted-clamp.mjs');
  const b13 = path.join(HERE, '..', 'docs', 'boards', 'board-13.js');
  if (existsSync(b13)) {
    const r = parseBoardText(readFileSync(b13, 'utf8'), { file: 'docs/boards/board-13.js' });
    const keys = r.items.map((i) => i.key);
    assert.ok(keys.includes('exit') && keys.includes('rows'), keys.join(','));
    assert.ok(keys.every((k) => /^[a-z][\w-]*$/.test(k)), 'no key from the script\'s own code: ' + keys.join(','));
    const exit = gapOf(r.items.find((i) => i.key === 'exit'), 13);
    assert.equal(exit.files.length, 6);
    assert.equal(exit.needsModel, false);
    assert.equal(exit.verdictFile, 'bench/verdicts/venue-exit.json');
  }
  assert.deepEqual(ownedFiles('a/b.mjs (the x, y only), c.md').map((o) => o.path), ['a/b.mjs', 'c.md']);
});

test('the schema gate: a malformed answer is refused before use, with its reason', () => {
  const g = clampGap();
  assert.match(validatePlan('I would write the files.', g).reason, /no JSON object/);
  assert.match(validatePlan({ files: 'planted/clamp.mjs', test: 'x', bar: 'y', verdict: 'z' }, g).reason, /files is not an array/);
  assert.match(validatePlan({ files: ['planted/clamp.mjs'], test: 'npm test', bar: 'node bench/planted-clamp.mjs', verdict: 'bench/verdicts/planted-clamp.json' }, g).reason, /node --test/);
  const out = validatePlan({ files: ['planted/clamp.mjs'], test: 'node --test test/other.test.mjs', bar: 'node bench/planted-clamp.mjs', verdict: 'bench/verdicts/planted-clamp.json' }, g);
  assert.equal(out.ceiling, true);
  assert.match(out.reason, /outside the owned set/);
  assert.equal(validatePlan({ files: ['planted/clamp.mjs'], test: 'node --test test/planted-clamp.test.mjs', bar: 'node bench/planted-clamp.mjs', verdict: 'bench/verdicts/planted-clamp.json' }, g).ok, true);
  const dir = tmp('brain-brief-schema-');
  assert.match(validateFile('planted/x.mjs', 'export const a = 1;', { copyDir: dir }).reason, /no fenced code block/);
  assert.match(validateFile('test/x.test.mjs', "```js\nimport { test, expect } from 'node:test';\n```", { copyDir: dir }).reason, /no expect/);
  assert.match(validateFile('planted/x.mjs', "```js\nimport _ from 'lodash';\n```", { copyDir: dir }).reason, /no dependencies/);
  const dyn = 'import' + "('os')"; // spelled in two pieces so the gate's import scan does not read this test's own text as an import
  const bare = validateFile('planted/x.mjs', "```js\nimport path from 'path';\nimport { readFile } from \"fs/promises\";\nexport const f = () => " + dyn + ";\n```", { copyDir: dir });
  assert.equal(bare.ok, true, bare.reason);
  assert.equal(bare.builtinRewrites, 3);
  assert.match(bare.content, /from 'node:path'/);
  assert.match(bare.content, /from "node:fs\/promises"/);
  assert.match(bare.content, /import\('node:os'\)/);
  assert.match(validateFile('planted/x.mjs', "```js\nimport { y } from './missing.mjs';\n```", { copyDir: dir }).reason, /neither on the copy nor in the plan/);
  assert.match(validateFile('planted/x.mjs', '```js\nexport function f( {\n```', { copyDir: dir }).reason, /node --check/);
  const em = validateFile('notes/x.md', '```\na ' + String.fromCharCode(0x2014) + ' b\n```');
  assert.equal(em.ok, true);
  assert.equal(em.emDashes, 1);
  assert.ok(!em.content.includes(String.fromCharCode(0x2014)));
  assert.match(failureLines('BUDGET x\nok 1\nnot ok 2 - boom\n  at y'), /^not ok 2 - boom/);
  assert.equal(repairTarget('FILE: test/planted-clamp.test.mjs\n```js\n```', { 'test/planted-clamp.test.mjs': '' }).file, 'test/planted-clamp.test.mjs');
});

test('a KEPT run end to end with the author mocked: plan exact, code region model+exact, a failing test repaired, the bar and the gate, a patch set by the organism; the real tree is unchanged; the replay asks no model', async () => {
  const root = tree();
  const stateRoot = tmp('brain-brief-state-');
  const before = hashTree(root, { skip: ['.git'] });
  const mock = mockAuthor();
  const r = await run(clampGap(), { root, stateRoot, cell: mock });
  assert.equal(r.kept, true, r.reason);
  assert.equal(r.wall, null);
  assert.equal(r.patchSet.author, BRIEF_AUTHOR);
  assert.deepEqual(r.patchSet.files.map((f) => f.file).sort(), ['bench/planted-clamp.mjs', 'planted/clamp.mjs', 'test/planted-clamp.test.mjs']);
  assert.ok(r.patchSet.patch.includes('--- /dev/null\n+++ b/planted/clamp.mjs'));
  assert.equal(r.patchSet.files.find((f) => f.file === 'test/planted-clamp.test.mjs').content, CLAMP_TEST, 'the kept test file is the repaired one');
  const prov = Object.fromEntries(r.steps.filter((s) => s.kind === 'ask').map((s) => [s.step + ':' + (s.file || ''), s.provenance]));
  assert.equal(prov['plan:'], 'exact');
  assert.equal(prov['write:planted/clamp.mjs'], 'model+exact');
  assert.equal(prov['write:test/planted-clamp.test.mjs'], 'model');
  assert.equal(r.steps.filter((s) => s.step === 'repair').length, 1);
  assert.equal(r.verdict.isTheBar, true);
  assert.equal(r.verdict.barMet, true);
  assert.equal(r.modelCalls, mock.calls.length);
  assert.ok(r.calls.every((c) => typeof c.seconds === 'number'), 'every call records its seconds');
  assert.ok(r.steps.filter((s) => s.kind === 'ask').every((s) => typeof s.stepUs === 'number' && typeof s.askUs === 'number'));
  assert.equal(hashTree(root, { skip: ['.git'] }).hash, before.hash, 'the real tree is byte-identical after the run');
  assert.equal(existsSync(path.join(root, 'planted')), false);
  assert.equal(existsSync(r.copy.dir), false, 'the copy is deleted');
  const rec = lines(r.recordFile);
  assert.equal(rec.filter((l) => l.kind === 'decision' && l.runId === r.runId && l.decision === 'kept').length, 1);
  assert.ok(rec.filter((l) => l.runId === r.runId && l.kind === 'ask').every((l) => typeof l.provenance === 'string' || l.ok === false));
  // library learning: the same brief again is answered by the direct table, with no model call
  const mock2 = mockAuthor();
  const r2 = await run(clampGap(), { root, stateRoot, cell: mock2, runId: 'replay' });
  assert.equal(r2.kept, true, r2.reason);
  assert.equal(r2.modelCalls, 0);
  assert.equal(mock2.calls.length, 0);
  assert.ok(r2.steps.filter((s) => s.kind === 'ask').every((s) => s.provenance === 'direct'));
  assert.equal(r2.share.share, 1);
  const sh = provenanceShare(r2.steps);
  assert.ok(sh.byClass.direct.meanLookupNs > 0);
  // the control: the same brief with the table off goes back down the chain
  const r3 = await run(clampGap(), { root, stateRoot, cell: mockAuthor(), direct: false, modelCalls: 0 });
  assert.equal(r3.kept, false);
  assert.equal(r3.wall, 'budget');
  assert.equal(r3.steps[0].provenance, 'exact');
});

test('the schema gate inside the chain: a malformed bench answer is re-asked once with its reason and the run still keeps', async () => {
  const mock = mockAuthor({ malformedBench: true });
  const r = await run(clampGap(), { root: tree(), stateRoot: tmp('brain-brief-state-'), cell: mock, direct: false });
  assert.equal(r.kept, true, r.reason);
  const bench = r.steps.find((s) => s.step === 'write' && s.file === 'bench/planted-clamp.mjs');
  assert.equal(bench.attempts.filter((a) => a.tier === 'model').length, 2);
  assert.match(bench.attempts.find((a) => a.tier === 'model' && !a.ok).reason, /no fenced code block/);
  assert.ok(mock.calls.some((c) => c.phase === 'schema re-ask'));
});

test('a model call with no answer inside its wall is asked again, with a shorter-thinking note, and the run still keeps', async () => {
  const mock = mockAuthor({ silentBench: true });
  const r = await run(clampGap(), { root: tree(), stateRoot: tmp('brain-brief-state-'), cell: mock, direct: false });
  assert.equal(r.kept, true, r.reason);
  const bench = r.steps.find((s) => s.step === 'write' && s.file === 'bench/planted-clamp.mjs');
  assert.deepEqual(bench.attempts.filter((a) => a.tier === 'model').map((a) => a.ok), [false, true]);
  assert.ok(mock.calls.some((c) => c.phase === 're-ask after no answer'));
});

test('the ceiling: paths outside the tree, under the ceiling or outside the owned set are refused, and a plan with nothing left stops at the ceiling wall', async () => {
  const owned = ['planted/a.mjs'];
  assert.equal(briefCeiling('planted/a.mjs', owned).ok, true);
  for (const bad of ['../x.mjs', 'C:/x.mjs', 'MANUAL.md', 'self/brief.mjs', 'docs/a.md', 'bench/gate.mjs', 'bench/ladder.mjs', 'bench/verdicts/x.json', 'state/x', 'organism/x', 'planted/b.mjs']) {
    assert.equal(briefCeiling(bad, owned).ok, false, bad);
  }
  const gap = { id: 'board-planted:ceiling', kind: 'board item', board: 'planted', key: 'ceiling', owns: 'self/x.mjs (new), docs/y.md (new)', brief: 'ITEM ceiling. BUILD self/x.mjs.', verdictFile: null, files: ['self/x.mjs', 'docs/y.md'], minutes: 1 };
  const plan = { files: ['self/x.mjs', 'docs/y.md'], test: 'node --test self/x.mjs', bar: 'node self/x.mjs', verdict: 'bench/verdicts/x.json' };
  const root = tree();
  const before = hashTree(root, { skip: ['.git'] });
  const r = await run(gap, { root, stateRoot: tmp('brain-brief-state-'), cell: mockAuthor({ plan }) });
  assert.equal(r.kept, false);
  assert.equal(r.wall, 'ceiling');
  assert.match(r.reason, /under the brief ceiling/);
  assert.equal(r.copy, null, 'no copy is made for a refused plan');
  assert.equal(hashTree(root, { skip: ['.git'] }).hash, before.hash);
  assert.ok(WALLS.includes(r.wall));
});

test('the repair loop stops at 4 rounds and the run stops at the test wall', async () => {
  const mock = mockAuthor({ repairFixes: false });
  const r = await run(clampGap(), { root: tree(), stateRoot: tmp('brain-brief-state-'), cell: mock, direct: false });
  assert.equal(r.kept, false);
  assert.equal(r.wall, 'test');
  assert.equal(REPAIR_ROUNDS, 4);
  assert.equal(r.steps.filter((s) => s.step === 'repair').length, 4);
  assert.equal(r.steps.filter((s) => s.step === 'test').length, 5);
  assert.match(r.reason, /after 4 repair round/);
});

test('the budget stops the run: the model cell is refused once the calls are spent, and a closed model is refused before any call', async () => {
  const r = await run(clampGap(), { root: tree(), stateRoot: tmp('brain-brief-state-'), cell: mockAuthor(), direct: false, modelCalls: 2 });
  assert.equal(r.kept, false);
  assert.equal(r.wall, 'budget');
  assert.equal(r.modelCalls, 2);
  assert.match(r.reason, /budget of 2 model call/);
  const c = await run(clampGap(), { root: tree(), stateRoot: tmp('brain-brief-state-'), model: 'claude-opus-4', base: 'http://127.0.0.1:9', direct: false });
  assert.equal(c.kept, false);
  assert.equal(c.modelCalls, 0);
  assert.equal(c.calls.length, 0);
  assert.match(c.reason, /open weights only/);
});

test('the record line is written before the copy is deleted', async () => {
  let seen = null;
  const r = await run(clampGap(), {
    root: tree(), stateRoot: tmp('brain-brief-state-'), cell: mockAuthor(), direct: false,
    hooks: { beforeDelete: ({ copy, recordFile, runId }) => { seen = { copyAlive: existsSync(copy), decision: lines(recordFile).filter((l) => l.runId === runId && l.kind === 'decision') }; } },
  });
  assert.equal(r.kept, true, r.reason);
  assert.equal(seen.copyAlive, true, 'the copy still exists when the hook runs');
  assert.equal(seen.decision.length, 1, 'the decision line is on disk before the delete');
  assert.equal(seen.decision[0].copyExists, true);
  assert.equal(existsSync(r.copy.dir), false);
});

test('the gate base: a gate RED on files no item touches refuses at the gate wall, the item adds no new red, and its answers are learned as tested (no patch set); a new red is not', async () => {
  const root = plantBriefTree({ gate: FAKE_GATE_RED });
  temps.push(root);
  const before = hashTree(root, { skip: ['.git'] });
  const base = await gateBaseline({ root, tmpRoot: tmp('brain-brief-base-'), gateKit: false });
  assert.equal(base.green, false);
  assert.deepEqual(base.red, ['test/other.test.mjs']);
  assert.equal(base.badImports, 0);
  assert.equal(base.deleted, true);
  const stateRoot = tmp('brain-brief-state-');
  const directFile = path.join(tmp('brain-brief-lib-'), 'direct.bin');
  const r = await run(clampGap(), { root, stateRoot, cell: mockAuthor(), directFile, gateBase: base });
  assert.equal(r.kept, false);
  assert.equal(r.wall, 'gate');
  assert.equal(r.patchSet, null);
  assert.equal(r.gateDelta.noNewRed, true);
  assert.deepEqual(r.gateDelta.newRed, []);
  assert.match(r.reason, /adds no new red/);
  assert.equal(r.learned, 4, 'the plan and the three files');
  const again = await run(clampGap(), { root, stateRoot, cell: mockAuthor(), directFile, gateBase: base });
  assert.equal(again.modelCalls, 0, 'the tested answers replay with no model call');
  assert.ok(again.steps.filter((s) => s.kind === 'ask').every((s) => s.provenance === 'direct'));
  const noBase = await run(clampGap(), { root, stateRoot, cell: mockAuthor(), directFile: path.join(tmp('brain-brief-lib-'), 'direct.bin') });
  assert.equal(noBase.wall, 'gate');
  assert.equal(noBase.gateDelta, null);
  assert.equal(noBase.learned, 1, 'with no base only the plan (the exact grammar) is learned');
  assert.equal(gateDeltaOf(base, ['test/other.test.mjs', 'test/planted-clamp.test.mjs'], 'GATE RED: em-dash files 0, bad imports 0').noNewRed, false);
  assert.equal(gateDeltaOf(base, ['test/other.test.mjs'], 'GATE RED: em-dash files 0, bad imports 1').noNewRed, false);
  assert.equal(gateDeltaOf({ ...base, green: true }, [], 'GATE RED: em-dash files 0, bad imports 0').noNewRed, false, 'a GREEN base leaves no room for a red item');
  assert.deepEqual(hashTree(root, { skip: ['.git'] }), before);
});

test('the thinking budget: a call still thinking at thinkMs is closed after its own thinking and answers inside the same wall (a fake local server, never Ollama)', async () => {
  const seen = { raw: null, chat: 0, generate: 0 };
  let mode = 'think-forever';
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (d) => { body += d; });
    req.on('end', () => {
      const j = JSON.parse(body);
      if (req.url === '/api/chat') {
        seen.chat++;
        res.writeHead(200, { 'content-type': 'application/x-ndjson' });
        if (mode === 'answer') {
          res.write(JSON.stringify({ message: { thinking: 'short. ' } }) + '\n');
          res.end(JSON.stringify({ message: { content: 'ANSWERED' }, done: true, eval_count: 3 }) + '\n');
          return;
        }
        let n = 0;
        const t = setInterval(() => { n++; res.write(JSON.stringify({ message: { thinking: 'step ' + n + '. ' } }) + '\n'); }, 20);
        res.on('close', () => clearInterval(t));
        return;
      }
      seen.generate++;
      seen.raw = j.prompt;
      seen.rawFlag = j.raw;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ response: 'FORCED', eval_count: 5 }));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    const f = await thinkBudgetCall({ base, model: 'qwen3:30b-a3b', system: 'SYS', prompt: 'ASK', timeoutMs: 5000, thinkMs: 300 });
    assert.equal(f.ok, true, f.reason);
    assert.equal(f.forced, true);
    assert.equal(f.requests, 2);
    assert.equal(f.text, 'FORCED');
    assert.ok(f.thinkChars > 0);
    assert.equal(seen.rawFlag, true);
    assert.match(seen.raw, /^<\|im_start\|>system\nSYS<\|im_end\|>\n<\|im_start\|>user\nASK<\|im_end\|>\n<\|im_start\|>assistant\n<think>\nstep 1\. /);
    assert.match(seen.raw, /\n<\/think>\n\n$/);
    assert.ok(f.thinkSeconds >= 0.3 && f.thinkSeconds < 5, 'closed near thinkMs: ' + f.thinkSeconds);
    mode = 'answer';
    const a = await thinkBudgetCall({ base, model: 'qwen3:30b-a3b', system: 'SYS', prompt: 'ASK', timeoutMs: 5000, thinkMs: 300 });
    assert.equal(a.ok, true, a.reason);
    assert.equal(a.forced, false);
    assert.equal(a.requests, 1);
    assert.equal(a.text, 'ANSWERED');
    assert.equal(seen.generate, 1, 'an answer in time asks no forced request');
    let sockets = 0;
    const far = await thinkBudgetCall({ base: 'http://10.0.0.5:11434', model: 'qwen3:30b-a3b', system: 'S', prompt: 'P', timeoutMs: 1000, fetchFn: async () => { sockets++; throw new Error('no'); } });
    assert.equal(far.ok, false);
    assert.equal(far.refused, true);
    assert.equal(sockets, 0, 'a non-local base opens no socket');
  } finally { server.closeAllConnections(); server.close(); }
});

test('the operators registry carries brief, and the author asks the organism first: a learned answer is a direct lookup with no model call', async () => {
  assert.ok(OPERATOR_NAMES.includes('brief'));
  const gen = OPERATORS.brief({ id: 'x', kind: 'planted', files: [] }, tree(), makeBudget());
  const first = await gen.next();
  assert.equal(first.value.refused, true);
  assert.match(first.value.reason, /board item/);
  const root = plantTree({ gate: 'fake' }); temps.push(root);
  const gap = plantGaps().tune;
  const table = new DirectTable({ capacity: 16 });
  const good = mockDiffAuthor(AUTHOR_DIFF_GOOD);
  const bud = makeBudget({ modelCalls: 1, author: good });
  bud.table = table; bud.learn = true;
  const g1 = author(gap, root, bud);
  const c1 = await g1.next();
  assert.equal(c1.value.refused, false);
  assert.equal(c1.value.provenance, 'model');
  assert.equal(bud.model.calls[0].provenance, 'model');
  await g1.next({ after: 96, toward: 32, noise: 1 });
  assert.equal(table.n, 1, 'the verified answer is learned');
  const never = mockDiffAuthor(AUTHOR_DIFF_GOOD);
  const bud2 = makeBudget({ modelCalls: 0, author: never });
  bud2.table = table;
  const c2 = await author(gap, root, bud2).next();
  assert.equal(c2.value.refused, false, c2.value.reason);
  assert.equal(c2.value.provenance, 'direct');
  assert.equal(never.asked.length, 0);
  assert.equal(bud2.model.used, 0);
  assert.equal(bud2.model.asks[0].provenance, 'direct');
  assert.ok(bud2.model.asks[0].lookupNs >= 0);
});
