// test/grow-evolve.test.mjs: NATIVE EVOLVE (grow/evolve.mjs, contract c6), proved end to end against a FAKE engine: a
// small script written into a temp directory that answers `status` with its features and `grow` with a printed line
// whose held-out score is best for one known gene value (maxCost = FAKE_TARGET), whose speed follows FAKE_SPEED, and
// which crashes, hangs or prints nothing on FAKE_MODE. Every rule of the brief has a test that fails when the rule is
// dropped: the step keeps a better genome within a few eras, reverts a worse one, keeps a faster one only when two runs
// agree, survives a crash and a hang, never leaves a scratch root, never writes outside neo/, never opens a held-out
// file, skips a kind the engine cannot load with its reason, mines and trials a macro, retires an unused one, and the
// CLI prints one JSON line. Each test builds its own roots in a temp directory and removes it; nothing reads the
// tree's grown/ or neo/.
// Run: node --test --test-reporter=tap test/grow-evolve.test.mjs
// Author: NATIVE EVOLVE builder, 2026-10-01.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  step, status, main, verdictOf, decide, lastJson, writeAtomic, copyRoot, closureOf, sampleTasks, ledgerTasks, masteredTasks, counts,
  readTrials, readMacros, mineMacros, retireMacros, grownCells, genomeCandidate, macroCandidate, sweepStale, runEngine, engineFeatures, Fail,
  KNOBS, TRIALS_FILE, MACROS_FILE,
} from '../grow/evolve.mjs';
import { genomeOf, genomeId, DEFAULTS, readGenomeDoc } from '../grow/genome.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EVOLVE = path.join(HERE, '..', 'grow', 'evolve.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-evolve-'));
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 4, retryDelay: 100 }); } catch { /* gone */ } };
after(cleanup);
process.on('exit', cleanup);

const SECRET_ROW = 'SECRET-HELDOUT-ROW-7f3a';
const SECRET_JUDGE = 'SECRET-JUDGE-ROW-91c2';
const SECRET_CONTROL = 'SECRET-CONTROL-ROW-55d0';
let n = 0;
const fresh = (p) => path.join(TMP, p + '-' + (++n));
const put = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };

// ---------------------------------------------------------------- the fake engine
const FAKE = put(TMP, 'fake-engine.mjs', [
  "import fs from 'node:fs';",
  "import path from 'node:path';",
  'const argv = process.argv.slice(2);',
  "const flag = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };",
  'const E = process.env;',
  "const mode = E.FAKE_MODE || '';",
  "const readJ = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };",
  "const note = (o) => { if (E.FAKE_LOG) fs.appendFileSync(E.FAKE_LOG, JSON.stringify(o) + '\\n'); };",
  "const root = flag('root');",
  "if (argv[0] === 'status') {",
  "  note({ verb: 'status', root });",
  "  if (mode === 'status-crash') { console.error('status broke'); process.exit(3); }",
  "  const features = E.FAKE_FEATURES === undefined ? ['genome', 'macros'] : E.FAKE_FEATURES.split(',').filter(Boolean);",
  '  console.log(JSON.stringify({ ok: true, features }));',
  '  process.exit(0);',
  '}',
  "const task = flag('task');",
  'const arm = path.basename(root);',
  "const mut = arm.startsWith('mut-');",
  "const run = Number(arm.split('-')[1]);",
  "const doc = readJ(path.join(root, 'neo', 'GENOME.json'));",
  'const genes = doc && doc.genes ? doc.genes : {};',
  'const maxCost = Number.isInteger(genes.maxCost) ? genes.maxCost : 7;',
  "const enumShare = typeof genes.enumShare === 'number' ? genes.enumShare : 0.8;",
  "const mdoc = readJ(path.join(root, 'neo', 'MACROS.json'));",
  'const macros = mdoc && Array.isArray(mdoc.macros) ? mdoc.macros : [];',
  "const stage = flag('stage') || null;",
  "note({ verb: 'grow', task, arm, mut, run, root, stage, gen: flag('gen'), maxGenerated: flag('max-generated'), maxMs: flag('max-ms'), maxCost, enumShare, macros: macros.length,",
  "  judgeHeldout: fs.existsSync(path.join(root, 'judge', 'heldout')), control: fs.existsSync(path.join(root, 'judge', 'control.jsonl')), state: fs.existsSync(path.join(root, 'state')),",
  "  taskHeldout: fs.existsSync(path.join(root, 'neo', 'tasks', task, 'heldout.jsonl')), trials: fs.existsSync(path.join(root, 'neo', 'TRIALS.jsonl')) });",
  "if (mode === 'crash' || (mode === 'crash-mut' && mut)) { console.error('engine broke on ' + task); process.exit(1); }",
  "if (mode === 'hang' || (mode === 'hang-mut' && mut)) { setInterval(() => {}, 1000); }",
  "else if (mode === 'noline') { console.log('no json here'); }",
  'else {',
  "  fs.mkdirSync(path.join(root, 'grown', 'neo'), { recursive: true });",
  "  fs.writeFileSync(path.join(root, 'grown', 'neo', task + '.mjs'), '// grown by the fake on ' + arm + '\\n');",
  "  fs.appendFileSync(path.join(root, 'neo', 'tasks', task, 'colony.jsonl'), '{}\\n');",
  "  fs.writeFileSync(path.join(root, 'neo', 'LEDGER.json'), JSON.stringify({ tasks: [{ task, touched: true }] }));",
  '  const target = Number(E.FAKE_TARGET || 7), bonus = Number(E.FAKE_MACRO_BONUS || 0);',
  '  const ok = Math.min(10, Math.max(0, 10 - Math.abs(maxCost - target)) + bonus * macros.length);',
  "  const sp = E.FAKE_SPEED || '';",
  '  let cps = 1000;',
  "  if (sp === 'enum') cps = Math.round(1000 / enumShare);",
  "  if (sp === 'both' && mut) cps = 2000;",
  "  if (sp === 'first-only' && mut && run === 0) cps = 2000;",
  "  if (sp === 'slight' && mut) cps = 1030;",
  "  const generated = Number(flag('max-generated'));",
  "  console.log('fake: growing ' + task);",
  '  const heldout = { ok, n: 10, score: ok / 10 };',
  "  if (stage) { fs.mkdirSync(stage, { recursive: true }); fs.writeFileSync(path.join(stage, task + '.json'), JSON.stringify({ kind: 'neo-stage', task, result: { heldout, generated, cellsPerSecond: cps } })); }",
  '  console.log(JSON.stringify({ ok: true, task, generated, cellsPerSecond: cps, kept: 1, ...(stage && E.FAKE_STAGE_ONLY ? { staged: path.join(stage, task + \'.json\') } : { heldout }) }));',
  '}',
].join('\n') + '\n');
const readLog = (f) => { try { return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };

// ---------------------------------------------------------------- the fixture roots
const moduleOf = (cells) => '// a colony\nconst COLONY = [\n' + cells.map((c) => JSON.stringify(c) + ',').join('\n') + '\n];\nexport default COLONY;\n';
const TOP = ['render.number', ['aggregate.sum', ['sense.numbers']]];
const CELLS = {
  t1: [{ id: 'a1', pyramid: TOP }, { id: 'a2', pyramid: ['memory.lookup', ['sense.text']] }],
  t2: [{ id: 'b1', pyramid: TOP }, { id: 'b2', pyramid: ['memory.lookup', ['sense.text']] }, { id: 'b3', pyramid: ['render.listNums', ['iterate.take', ['sense.numbers'], { lit: 2 }]] }],
  t3: [{ id: 'c1', pyramid: ['render.number', ['aggregate.max', ['sense.numbers']]] }, { id: 'c2', pyramid: ['memory.lookup', ['sense.text']] }, { id: 'c3', pyramid: ['render.listNums', ['iterate.take', ['sense.numbers'], { lit: 3 }]] }],
  t4: [{ id: 'd1', pyramid: TOP }],
};
function fixture({ tasks = ['t1', 't2', 't3', 't4'], mastered = ['t4'], cells = CELLS, macros = null, genome = null } = {}) {
  const r = fresh('root');
  put(r, 'neo/LEDGER.json', JSON.stringify({ tasks: tasks.map((t) => ({ task: t })) }));
  for (const t of tasks) {
    put(r, 'neo/tasks/' + t + '/dev.jsonl', '{"q":"dev of ' + t + '","a":"1"}\n');
    put(r, 'neo/tasks/' + t + '/heldout.jsonl', '{"q":"' + SECRET_ROW + ' ' + t + '","a":"2"}\n');
    put(r, 'neo/tasks/' + t + '/task.json', JSON.stringify({ task: t }));
  }
  put(r, 'neo/know/k.json', '{}');
  put(r, 'judge/dev.jsonl', '{}\n');
  put(r, 'judge/control.jsonl', '{"control":"' + SECRET_CONTROL + '"}\n');
  put(r, 'judge/heldout/secret.jsonl', SECRET_JUDGE + '\n');
  put(r, 'state/x.json', '{"state":1}');
  put(r, 'grow/notes.md', 'a grow data file');
  put(r, 'grow/fixtures/deep/x.json', '{}');
  put(r, 'grown/index.json', JSON.stringify({ cells: tasks.map((t) => ({ tier: 'neo', task: t, file: 'neo/' + t + '.mjs', heldout: { score: mastered.includes(t) ? 1 : 0.5 } })) }));
  for (const t of tasks) put(r, 'grown/neo/' + t + '.mjs', moduleOf(cells[t] || []));
  if (macros) put(r, 'neo/MACROS.json', JSON.stringify(macros));
  if (genome) put(r, 'neo/GENOME.json', JSON.stringify(genome));
  return r;
}
/** Every file under a root with its text (the fixture is small). */
function snapshot(root) {
  const out = {};
  const go = (d, rel) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const r = rel ? rel + '/' + e.name : e.name; if (e.isDirectory()) go(path.join(d, e.name), r); else out[r] = fs.readFileSync(path.join(d, e.name), 'utf8'); } };
  go(root, '');
  return out;
}
const changedFiles = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]).sort();
const scratchDir = () => { const d = fresh('tmp'); fs.mkdirSync(d, { recursive: true }); return d; };
const opts = (tmp, env, more = {}) => ({ engine: FAKE, tmp, env, maxMs: 60000, sample: 2, ...more });
const lastRow = (root) => readTrials(root).at(-1);

// ---------------------------------------------------------------- (d) the verdict and the keep rule
test('verdictOf: more held-out right is better; fewer, or a mastered task lost, is worse; as many and 5 percent faster is faster', () => {
  const b = { heldoutOk: 20, mastered: 1, cps: 1000 };
  assert.equal(verdictOf(b, { heldoutOk: 21, mastered: 0, cps: 1 }), 'better');
  assert.equal(verdictOf(b, { heldoutOk: 19, mastered: 1, cps: 9000 }), 'worse');
  assert.equal(verdictOf(b, { heldoutOk: 20, mastered: 0, cps: 9000 }), 'worse', 'a mastered task lost at equal held-out');
  assert.equal(verdictOf(b, { heldoutOk: 20, mastered: 1, cps: 1050 }), 'faster', 'exactly 5 percent is enough');
  assert.equal(verdictOf(b, { heldoutOk: 20, mastered: 1, cps: 1049 }), 'equal');
  assert.equal(verdictOf(b, { heldoutOk: 20, mastered: 2, cps: 1000 }), 'equal');
  assert.equal(verdictOf({ ...b, cps: 0 }, { heldoutOk: 20, mastered: 1, cps: 50 }), 'equal', 'no speed claim against an arm that printed no rate');
  assert.equal(verdictOf(b, { heldoutOk: 20, mastered: 1, cps: 1500 }, 1.6), 'equal', 'the bar is a parameter');
  assert.equal(KNOBS.faster, 1.05);
});

test('decide: kept only when two runs agree on better or on faster', () => {
  assert.equal(decide([]).kept, false);
  assert.match(decide([]).why, /no run was graded/);
  assert.equal(decide(['worse']).kept, false);
  assert.equal(decide(['equal']).kept, false);
  assert.match(decide(['better']).why, /no second run confirmed it/);
  assert.equal(decide(['faster']).kept, false);
  assert.match(decide(['better', 'faster']).why, /disagree \(better, then faster\)/);
  assert.equal(decide(['faster', 'equal']).kept, false);
  assert.equal(decide(['faster', 'worse']).kept, false);
  assert.equal(decide(['better', 'worse']).kept, false);
  assert.deepEqual(decide(['better', 'better']), { kept: true, why: 'more held-out rows right in both runs' });
  assert.equal(decide(['faster', 'faster']).kept, true);
  assert.match(decide(['faster', 'faster']).why, /5 percent faster in both runs/);
});

test('lastJson takes the last line that is a JSON object; writeAtomic leaves no temp file', () => {
  assert.deepEqual(lastJson('a\n{"x":1}\n{"y":2}\nnoise\n[1,2]\n{broken\n'), { y: 2 });
  assert.equal(lastJson('no json\n[1]\n'), null);
  assert.equal(lastJson(undefined), null);
  assert.deepEqual(lastJson('  {"z":3}  \r\n'), { z: 3 });
  const d = fresh('atomic');
  const f = path.join(d, 'a', 'b.json');
  writeAtomic(f, 'one');
  writeAtomic(f, 'two');
  assert.equal(fs.readFileSync(f, 'utf8'), 'two');
  assert.deepEqual(fs.readdirSync(path.dirname(f)), ['b.json']);
});

test('counts: kept, reverted, skipped, blocked and retired rows are told apart', () => {
  assert.deepEqual(counts([
    { kept: true, change: [] }, { kept: false }, { kept: false, skipped: 'x' }, { kept: false, blocked: 'y' },
    { kept: true, change: { op: 'retire' } }, { kept: false, change: { op: 'add' } },
  ]), { kept: 1, reverted: 2, skipped: 1, blocked: 1, retired: 1 });
});

// ---------------------------------------------------------------- (a) the sample, (b) the copy
test('the sample is deterministic for the era, unmastered tasks first, and the seed moves with the era', () => {
  const root = fixture({ tasks: ['t1', 't2', 't3', 't4', 't5', 't6'], mastered: ['t5', 't6'] });
  assert.deepEqual(ledgerTasks(root), ['t1', 't2', 't3', 't4', 't5', 't6']);
  assert.deepEqual([...masteredTasks(root)].sort(), ['t5', 't6']);
  const seen = new Set();
  for (let era = 0; era < 12; era++) {
    const s = sampleTasks(root, era, 3);
    assert.deepEqual(sampleTasks(root, era, 3), s);
    assert.equal(s.tasks.length, 3);
    assert.equal(s.unmastered, 3);
    assert.ok(s.tasks.every((t) => !['t5', 't6'].includes(t)), 'a mastered task comes only after every unmastered one');
    assert.equal(s.pool, 6);
    seen.add(s.tasks.join(','));
    const all = sampleTasks(root, era, 9);
    assert.deepEqual(all.tasks.slice(4).sort(), ['t5', 't6']);
  }
  assert.ok(seen.size > 2, 'the era seeds the draw: ' + [...seen].join(' | '));
  const r2 = fixture({ tasks: ['t1', 't2'] });
  fs.rmSync(path.join(r2, 'neo', 'tasks', 't2', 'heldout.jsonl'));
  assert.deepEqual(ledgerTasks(r2), ['t1'], 'a task with no held-out set is not sampled');
});

test('copyRoot copies by path: the sampled tasks whole, the others dev and task.json only, never state/, judge/heldout/ or TRIALS.jsonl', () => {
  const root = fixture();
  put(root, 'neo/TRIALS.jsonl', '{"x":1}\n');
  put(root, '.git/HEAD', 'ref');
  const dest = fresh('copy');
  const r = copyRoot(root, dest, { tasks: ['t2'] });
  const got = Object.keys(snapshot(dest));
  assert.equal(r.files, got.length);
  assert.ok(r.bytes > 0);
  for (const want of ['neo/LEDGER.json', 'neo/know/k.json', 'neo/tasks/t2/heldout.jsonl', 'neo/tasks/t2/dev.jsonl', 'neo/tasks/t1/dev.jsonl', 'neo/tasks/t1/task.json', 'judge/dev.jsonl', 'judge/control.jsonl', 'grow/notes.md', 'grown/index.json', 'grown/neo/t1.mjs']) assert.ok(got.includes(want), want);
  for (const not of ['neo/tasks/t1/heldout.jsonl', 'neo/TRIALS.jsonl', 'judge/heldout/secret.jsonl', 'state/x.json', '.git/HEAD', 'grow/fixtures/deep/x.json']) assert.ok(!got.includes(not), not);
  const all = copyRoot(root, fresh('copy'), { allTasks: true });
  assert.ok(all.files > r.files);
  assert.throws(() => copyRoot(root, path.join(root, 'inner')), (e) => e instanceof Fail && /not outside/.test(e.message));
  assert.throws(() => copyRoot(root, path.dirname(root)), (e) => e instanceof Fail && /not outside/.test(e.message));
  assert.throws(() => copyRoot(root, root), Fail);
});

test('closureOf follows static and dynamic relative imports and path.join literals, from the file or from the root, never into state/', () => {
  const root = fresh('code');
  put(root, 'grow/neo.mjs', "import { k } from './neo-kernel.mjs';\nimport './side.mjs';\nconst HERE = 1; const root = 2;\nconst m = await import('../judge/baseline.mjs');\nconst a = path.join(HERE, 'data.json');\nconst b = path.join(root, 'bench', 'small');\nconst c = path.join(root, 'state', 'x.json');\nconst d = path.join(root, 'bench', 'missing.json');\n");
  put(root, 'grow/neo-kernel.mjs', "export * from './deep/k2.mjs';\n");
  put(root, 'grow/deep/k2.mjs', 'export const z = 1;\n');
  put(root, 'grow/side.mjs', '\n');
  put(root, 'grow/data.json', '{}');
  put(root, 'judge/baseline.mjs', '\n');
  put(root, 'bench/small/a.txt', 'a');
  put(root, 'bench/small/b/c.txt', 'c');
  put(root, 'state/x.json', '{}');
  put(root, 'grow/unrelated.mjs', '\n');
  const c = closureOf(root, ['grow/neo.mjs']);
  assert.deepEqual(c.files, ['grow/data.json', 'grow/deep/k2.mjs', 'grow/neo-kernel.mjs', 'grow/neo.mjs', 'grow/side.mjs', 'judge/baseline.mjs']);
  assert.deepEqual(c.dirs, ['bench/small']);
  assert.deepEqual(c.skipped, []);
  const dest = fresh('copy');
  copyRoot(root, dest);
  assert.ok(fs.existsSync(path.join(dest, 'bench', 'small', 'b', 'c.txt')), 'a small named directory is copied whole');
  assert.ok(!fs.existsSync(path.join(dest, 'state')));
});

// ---------------------------------------------------------------- the engine as a child
test('runEngine: a printed line, a crash, a missing line and a hang are each told apart and never throw', () => {
  const root = fixture();
  const arm = path.join(fresh('arm'), 'base-0');
  copyRoot(root, arm, { tasks: ['t1'] });
  const args = ['grow', '--task', 't1', '--gen', '1', '--root', arm, '--max-generated', '5', '--max-ms', '9'];
  const good = runEngine(FAKE, args, { env: { ...process.env } });
  assert.equal(good.ok, true);
  assert.equal(good.line.generated, 5);
  assert.deepEqual(good.line.heldout, { ok: 10, n: 10, score: 1 });
  const bad = runEngine(FAKE, args, { env: { ...process.env, FAKE_MODE: 'crash' } });
  assert.equal(bad.ok, false);
  assert.match(bad.why, /^exited 1: engine broke on t1/);
  const none = runEngine(FAKE, args, { env: { ...process.env, FAKE_MODE: 'noline' } });
  assert.deepEqual([none.ok, none.why], [false, 'printed no JSON line']);
  const t0 = Date.now();
  const hung = runEngine(FAKE, args, { env: { ...process.env, FAKE_MODE: 'hang' }, timeoutMs: 700 });
  assert.equal(hung.ok, false);
  assert.match(hung.why, /timed out/);
  assert.ok(Date.now() - t0 < 10000);
  assert.deepEqual(engineFeatures(FAKE, arm, { env: { ...process.env, FAKE_FEATURES: 'genome,stage' } }), { features: ['genome', 'stage'], why: null });
  const sc = engineFeatures(FAKE, arm, { env: { ...process.env, FAKE_MODE: 'status-crash' } });
  assert.deepEqual(sc.features, []);
  assert.match(sc.why, /^status exited 3: status broke/);
});

// ---------------------------------------------------------------- the loop, end to end on the fake engine
test('the step finds and keeps a better genome within a few eras, under one budget, on arms outside the tree, then stops drawing what was reverted', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const log = fresh('log') + '.jsonl';
  const env = { FAKE_TARGET: '9', FAKE_LOG: log };
  let reachedAt = null;
  for (let era = 1; era <= 4 && reachedAt === null; era++) {
    const line = await step(root, opts(tmp, env, { era, kind: 'genome', genes: ['maxCost'] }));
    assert.equal(line.era, era);
    assert.equal(line.kind, 'genome');
    assert.equal(line.scratchLeft, false);
    assert.deepEqual(fs.readdirSync(tmp), [], 'no scratch root is left after era ' + era);
    if (genomeOf(root).maxCost === 9) reachedAt = era;
  }
  assert.ok(reachedAt !== null, 'maxCost 9 is found within 4 eras');
  const doc = readGenomeDoc(root);
  assert.equal(doc.lineage, 2);
  assert.equal(doc.history.length, 2);
  assert.equal(doc.id, genomeId(genomeOf(root)));
  assert.deepEqual(doc.history.map((h) => h.change[0].to), [8, 9]);
  const rows = readTrials(root);
  assert.equal(rows.filter((r) => r.kept).length, 2);
  const to9 = rows.find((r) => r.kept && r.change[0].to === 9);
  assert.deepEqual([to9.before.mastered, to9.after.mastered, to9.after.heldoutOk], [0, 2, 20], 'a task is mastered when every held-out row is right');
  for (const r of rows) {
    for (const k of ['at', 'era', 'kind', 'change', 'before', 'after', 'kept']) assert.ok(Object.hasOwn(r, k), k);
    for (const k of ['sample', 'budget', 'gen', 'faster', 'verdicts', 'runs', 'seed', 'beforeId', 'afterId', 'lineage', 'why', 'ms']) assert.ok(Object.hasOwn(r, k), 'every number a trial used is in its row: ' + k);
    assert.deepEqual(r.before, { heldoutOk: r.runs[0].base.heldoutOk, n: 20, mastered: r.runs[0].base.mastered, cps: 1000, generated: 40000, ms: r.runs[0].base.ms });
    assert.equal(r.runs[0].base.tasks.length, 2);
    if (r.kept) {
      assert.deepEqual(r.verdicts, ['better', 'better']);
      assert.ok(r.after.heldoutOk > r.before.heldoutOk);
      assert.deepEqual(r.runs.map((x) => x.order), [['base', 'mut'], ['mut', 'base']], 'the second run swaps the arm order');
    } else {
      assert.deepEqual(r.verdicts, ['worse']);
      assert.equal(r.runs.length, 1, 'a worse mutant is reverted after one run');
    }
  }
  const grows = readLog(log).filter((l) => l.verb === 'grow');
  assert.ok(grows.length >= 8);
  for (const g of grows) {
    assert.deepEqual([g.maxGenerated, g.maxMs], ['20000', String(Math.floor(60000 / 8))], 'the SAME budget for every grow of both arms');
    assert.ok(path.resolve(g.root).startsWith(path.resolve(tmp) + path.sep), 'an arm root lies in the scratch directory');
    assert.equal(g.judgeHeldout, false, 'judge/heldout/ is not copied');
    assert.equal(g.state, false, 'state/ is not copied');
    assert.equal(g.trials, false, 'TRIALS.jsonl is not copied');
    assert.equal(g.taskHeldout, true, 'the sampled task held-out file is copied for the engine');
  }
  const byRun = new Map();
  for (const g of grows) { const k = path.dirname(g.root) + '|' + g.run + '|' + g.task; if (!byRun.has(k)) byRun.set(k, {}); byRun.get(k)[g.mut ? 'mut' : 'base'] = g.maxCost; }
  for (const v of byRun.values()) if (v.mut !== undefined && v.base !== undefined) assert.equal(Math.abs(v.mut - v.base), 1, 'the arms differ in the mutated gene only');
  let skippedWhy = null;
  for (let era = 5; era <= 10 && !skippedWhy; era++) {
    const line = await step(root, opts(tmp, env, { era, kind: 'genome', genes: ['maxCost'] }));
    if (line.skipped.length) skippedWhy = line.skipped[0];
  }
  assert.match(skippedWhy, /each of 16 drawn mutants was already tried and reverted/);
  assert.equal(genomeOf(root).maxCost, 9);
  const st = status(root);
  assert.equal(st.lineage, 2);
  assert.equal(st.kept, 2);
  assert.equal(st.skipped, 1);
  assert.deepEqual(st.changed, [{ gene: 'maxCost', from: 7, to: 9 }]);
});

test('a worse mutant is reverted: nothing in the tree changes but one TRIALS row', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const before = snapshot(root);
  const line = await step(root, opts(tmp, { FAKE_TARGET: '7' }, { era: 1, kind: 'genome', genes: ['maxCost'] }));
  assert.equal(line.kept, false);
  assert.deepEqual(line.verdicts, ['worse']);
  assert.match(line.why, /scored worse/);
  assert.deepEqual(line.before.heldoutOk, 20);
  assert.equal(line.after.heldoutOk, 18);
  assert.match(line.change, /^maxCost 7 -> (6|8)$/);
  assert.deepEqual(changedFiles(before, snapshot(root)), ['neo/TRIALS.jsonl']);
  assert.deepEqual(genomeOf(root), DEFAULTS);
  assert.deepEqual(fs.readdirSync(tmp), []);
});

test('speed: kept when at least 5 percent faster in both runs; reverted when only one run was, or when it was 3 percent faster', async () => {
  const run = async (speed) => {
    const root = fixture();
    const tmp = scratchDir();
    const line = await step(root, opts(tmp, { FAKE_SPEED: speed }, { era: 1, kind: 'genome', genes: ['decimals'] }));
    assert.deepEqual(fs.readdirSync(tmp), []);
    return { line, root };
  };
  const both = await run('both');
  assert.equal(both.line.kept, true);
  assert.deepEqual(both.line.verdicts, ['faster', 'faster']);
  assert.equal(both.line.after.cps, 2000);
  assert.notEqual(genomeOf(both.root).decimals, 2);
  const first = await run('first-only');
  assert.equal(first.line.kept, false);
  assert.deepEqual(first.line.verdicts, ['faster', 'equal']);
  assert.match(first.line.why, /the two runs disagree \(faster, then equal\)/);
  assert.equal(readGenomeDoc(first.root), null);
  const slight = await run('slight');
  assert.equal(slight.line.kept, false);
  assert.deepEqual(slight.line.verdicts, ['equal']);
  assert.equal(slight.line.after.cps, 1030);
  const flat = await run('');
  assert.deepEqual([flat.line.kept, flat.line.verdicts], [false, ['equal']], 'a gene the engine ignores ties and is never kept');
});

test('a crashing engine blocks the trial, a crashing mutant is reverted; a blocked candidate is drawn again, a reverted one is not', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const o = (mode, era) => opts(tmp, { FAKE_MODE: mode }, { era, kind: 'genome', genes: ['maxCost'] });
  const a = await step(root, o('crash', 1));
  assert.equal(a.kept, false);
  assert.match(a.why, /^the present engine failed: grow t\d exited 1: engine broke on t\d/);
  const ra = lastRow(root);
  assert.ok(ra.blocked);
  assert.equal(ra.after, null);
  assert.deepEqual(fs.readdirSync(tmp), []);
  assert.equal(genomeCandidate(root, 1, { genes: ['maxCost'] }).seed, ra.seed, 'a blocked trial graded nothing: the same mutant is drawn again');
  const b = await step(root, o('crash-mut', 1));
  assert.equal(b.kept, false);
  assert.match(b.why, /^the mutant made the engine fail: grow t\d exited 1/);
  const rb = lastRow(root);
  assert.equal(rb.blocked, undefined);
  assert.equal(rb.afterId, ra.afterId);
  assert.notEqual(genomeCandidate(root, 1, { genes: ['maxCost'] }).afterId, rb.afterId, 'a mutant that broke the engine is not drawn again');
  const c = await step(root, o('noline', 2));
  assert.match(c.why, /^the present engine failed: grow t\d printed no JSON line/);
  assert.deepEqual(status(root).blocked, 2);
  assert.equal(readGenomeDoc(root), null);
  assert.deepEqual(fs.readdirSync(tmp), []);
});

test('a hanging engine is killed at its budget plus slack, a hanging mutant is reverted, and the step never runs past its clock', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const t0 = Date.now();
  const a = await step(root, opts(tmp, { FAKE_MODE: 'hang' }, { era: 1, kind: 'genome', genes: ['maxCost'], maxMs: 8000, slackMs: 300 }));
  assert.match(a.why, /^the present engine failed: grow t\d timed out after \d+ ms/);
  assert.ok(Date.now() - t0 < 8000, 'killed at budget plus slack, not at the step clock');
  const b = await step(root, opts(tmp, { FAKE_MODE: 'hang-mut' }, { era: 2, kind: 'genome', genes: ['maxCost'], maxMs: 8000, slackMs: 300 }));
  assert.match(b.why, /^the mutant made the engine fail: grow t\d timed out/);
  const t1 = Date.now();
  const c = await step(root, opts(tmp, { FAKE_MODE: 'hang' }, { era: 3, kind: 'genome', genes: ['maxCost'], maxMs: 2500, slackMs: 600000 }));
  assert.equal(c.kept, false);
  assert.match(c.why, /timed out|out of time/);
  assert.ok(Date.now() - t1 < 2500 + 4000, 'the step clock bounds a child: ' + (Date.now() - t1) + ' ms');
  assert.deepEqual(fs.readdirSync(tmp), []);
  assert.equal(readGenomeDoc(root), null);
});

test('the step never opens a held-out file, state/ or judge/control.jsonl, writes only under <root>/neo and its scratch directory, and prints no held-out row', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const NAMES = ['readFileSync', 'openSync', 'writeFileSync', 'appendFileSync', 'renameSync', 'copyFileSync', 'cpSync', 'mkdirSync', 'rmSync', 'mkdtempSync', 'unlinkSync', 'rmdirSync'];
  const saved = Object.fromEntries(NAMES.map((k) => [k, fs[k]]));
  const calls = [];
  const lines = [];
  for (const k of NAMES) fs[k] = function spy(...a) { calls.push([k, ...a.slice(0, 2).map((x) => (typeof x === 'string' || x instanceof URL ? path.resolve(String(x)) : null))]); return saved[k].apply(this, a); };
  try {
    lines.push(await step(root, opts(tmp, { FAKE_SPEED: 'both' }, { era: 1, kind: 'genome', genes: ['decimals'] })));
    lines.push(await step(root, opts(tmp, { FAKE_TARGET: '9', FAKE_MACRO_BONUS: '1' }, { era: 2, kind: 'macro' })));
    lines.push(status(root));
  } finally { for (const k of NAMES) fs[k] = saved[k]; }
  const secretPath = /heldout|[\\/]state([\\/]|$)|control\.jsonl/;
  const opened = calls.filter(([k, p]) => (k === 'readFileSync' || k === 'openSync') && p && secretPath.test(p));
  assert.deepEqual(opened, [], 'opened: ' + JSON.stringify(opened));
  const neo = path.join(path.resolve(root), 'neo');
  const okWrite = (p) => p === null || p === neo || p.startsWith(neo + path.sep) || p === path.resolve(tmp) || p.startsWith(path.resolve(tmp) + path.sep);
  const WRITES = { writeFileSync: [1], appendFileSync: [1], renameSync: [1, 2], copyFileSync: [2], cpSync: [2], mkdirSync: [1], rmSync: [1], mkdtempSync: [1], unlinkSync: [1], rmdirSync: [1] };
  const bad = [];
  for (const c of calls) for (const i of WRITES[c[0]] || []) if (!okWrite(c[i])) bad.push(c);
  assert.deepEqual(bad, [], 'wrote outside neo/ and the scratch directory: ' + JSON.stringify(bad.slice(0, 3)));
  assert.ok(calls.some(([k, , to]) => k === 'copyFileSync' && /heldout\.jsonl$/.test(to || '')), 'the held-out files are copied by path for the engine');
  const printed = JSON.stringify(lines) + fs.readFileSync(path.join(root, ...TRIALS_FILE.split('/')), 'utf8') + fs.readFileSync(path.join(root, ...MACROS_FILE.split('/')), 'utf8');
  for (const s of [SECRET_ROW, SECRET_JUDGE, SECRET_CONTROL]) assert.equal(printed.includes(s), false, s);
  assert.equal(lines[0].kept, true);
  assert.equal(lines[1].kept, true);
});

test('with the stage feature (contract c3) every grow writes its stage file inside the scratch root, and the score is read from it when the line carries none', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const log = fresh('log') + '.jsonl';
  const line = await step(root, opts(tmp, { FAKE_FEATURES: 'genome,stage', FAKE_STAGE_ONLY: '1', FAKE_TARGET: '9', FAKE_LOG: log }, { era: 1, kind: 'genome', genes: ['maxCost'] }));
  assert.equal(line.before.heldoutOk, 16);
  assert.ok([14, 18].includes(line.after.heldoutOk), String(line.after.heldoutOk));
  const grows = readLog(log).filter((l) => l.verb === 'grow');
  assert.ok(grows.length >= 4);
  for (const g of grows) assert.ok(g.stage && path.resolve(g.stage).startsWith(path.resolve(tmp) + path.sep), 'stage ' + g.stage);
  assert.deepEqual(fs.readdirSync(tmp), []);
});

// ---------------------------------------------------------------- skips and the order of kinds
test('a kind the engine cannot load yet is a skipped row with its reason, and the other kind runs', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const a = await step(root, opts(tmp, { FAKE_FEATURES: '' }, { era: 1 }));
  assert.equal(a.kind, null);
  assert.equal(a.kept, false);
  assert.equal(a.skipped.length, 2);
  assert.match(a.skipped[0], /^genome: the engine cannot load a genome yet: its status features \[\] lack "genome"$/);
  assert.match(a.skipped[1], /^macro: the engine cannot load macros yet: its status features \[\] lack "macros"$/);
  const rows = readTrials(root);
  assert.equal(rows.length, 2);
  for (const r of rows) {
    assert.deepEqual(Object.keys(r).sort(), ['after', 'at', 'before', 'change', 'era', 'kept', 'kind', 'skipped']);
    assert.deepEqual([r.change, r.before, r.after, r.kept, r.era], [null, null, null, false, 1]);
  }
  assert.equal(readGenomeDoc(root), null);
  assert.equal(fs.existsSync(path.join(root, 'neo', 'MACROS.json')), false);
  const b = await step(root, opts(tmp, { FAKE_FEATURES: 'genome' }, { era: 2, genes: ['maxCost'] }));
  assert.equal(b.kind, 'genome', 'an even era tries a macro first; the engine cannot load one, so the genome runs');
  assert.equal(b.skipped.length, 1);
  assert.match(b.skipped[0], /^macro: .*lack "macros"/);
  const c = await step(root, opts(tmp, { FAKE_MODE: 'status-crash' }, { era: 3 }));
  assert.equal(c.skipped.length, 2);
  assert.match(c.skipped[0], /\(status exited 3: status broke\)$/);
  const empty = fixture({ tasks: [] });
  const d = await step(empty, opts(tmp, {}, { era: 1 }));
  assert.equal(d.skipped.length, 2);
  assert.match(d.skipped[0], /no opened task with a dev and a held-out set/);
  assert.equal(d.copied, null);
  assert.equal(status(root).skipped, 5);
  assert.deepEqual(fs.readdirSync(tmp), []);
});

test('kinds alternate by era: an odd era runs a genome mutant, an even era a macro candidate; with no era the step runs the next one', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const a = await step(root, opts(tmp, {}, { era: 3 }));
  assert.equal(a.kind, 'genome');
  const b = await step(root, opts(tmp, {}, { era: 4 }));
  assert.equal(b.kind, 'macro');
  assert.match(b.change, /^add macro\./);
  const c = await step(root, opts(tmp, { FAKE_FEATURES: '' }, {}));
  assert.equal(c.era, 5);
  assert.equal(c.skipped.length, 2);
  assert.match(c.skipped[0], /^genome: /, 'era 5 is odd: the genome first');
});

// ---------------------------------------------------------------- macros: mine, trial, retire
test('mining: the sub-pyramid that recurs across the most tasks ranks first, literals become params, memory bodies and one-task bodies are left out', async () => {
  const root = fixture();
  const m = await mineMacros(root);
  assert.equal(m.cells, 9);
  const top = m.candidates[0];
  assert.deepEqual(top.body, TOP);
  assert.deepEqual(top.from, ['t1', 't2', 't4']);
  assert.deepEqual([top.params, top.uses, top.saving, top.size, top.prims], [0, 3, 6, 3, 3]);
  assert.match(top.name, /^macro\.render-number-aggregate-sum[a-z0-9-]*-[0-9a-f]{6}$/);
  assert.ok(m.candidates.every((c) => !JSON.stringify(c.body).includes('memory.')), 'no memory body');
  assert.ok(m.candidates.every((c) => c.from.length >= 2 && c.prims >= 2));
  const take = m.candidates.find((c) => JSON.stringify(c.body) === JSON.stringify(['render.listNums', ['iterate.take', ['sense.numbers'], { param: 0 }]]));
  assert.ok(take, 'a literal becomes a parameter, so lit 2 and lit 3 are one macro');
  assert.deepEqual([take.from, take.params], [['t2', 't3'], 1]);
  const sensed = m.candidates.find((c) => JSON.stringify(c.body) === JSON.stringify(['render.number', ['aggregate.sum', { param: 0 }]]));
  assert.ok(sensed, 'the second variant takes the sensed input as a parameter');
  assert.equal(m.candidates.some((c) => JSON.stringify(c.body).includes('aggregate.max')), false, 'a body of one task is not a macro');
  for (let i = 1; i < m.candidates.length; i++) assert.ok(m.candidates[i - 1].from.length >= m.candidates[i].from.length, 'ranked by tasks');
  assert.equal((await mineMacros(root, { minTasks: 4 })).candidates.length, 0);
  assert.notDeepEqual((await mineMacros(root, { exclude: [top.key] })).candidates[0].body, TOP);
  const twice = ['compare.eq', ['aggregate.sum', ['sense.numbers']], ['aggregate.sum', ['sense.numbers']]];
  const dup = await mineMacros(root, { cells: [{ task: 'x', pyramid: twice }, { task: 'y', pyramid: twice }] });
  const inner = dup.candidates.find((c) => JSON.stringify(c.body) === JSON.stringify(['aggregate.sum', ['sense.numbers']]));
  assert.deepEqual([inner.uses, inner.saving], [2, 2], 'a body counts once per cell, however often the cell holds it');
  assert.equal(dup.candidates[0].uses, 2);
  put(root, 'outside/evil.mjs', moduleOf([{ id: 'e1', pyramid: ['x.y', ['z.w']] }]));
  put(root, 'grown/index.json', JSON.stringify({ cells: [{ tier: 'neo', task: 't1', file: 'neo/t1.mjs' }, { tier: 'old', task: 't2', file: 'neo/t2.mjs' }, { tier: 'neo', task: 'evil', file: '../outside/evil.mjs' }] }));
  put(root, 'grown/neo/t1.mjs', 'const COLONY = [\n{"id":"a1","pyramid":["x.y",["z.w"]]},\nnot json,\n{"id":"a2"},\n];\n');
  assert.deepEqual(grownCells(root), [{ task: 't1', id: 'a1', pyramid: ['x.y', ['z.w']] }], 'one neo row inside grown/, one parsed cell');
});

test('a macro is trialled like a genome: kept when the engine scores it better in both runs, written to MACROS.json, never drawn twice', async () => {
  const root = fixture();
  const tmp = scratchDir();
  const a = await step(root, opts(tmp, { FAKE_TARGET: '9', FAKE_MACRO_BONUS: '1' }, { era: 2, kind: 'macro' }));
  assert.equal(a.kept, true);
  assert.deepEqual(a.verdicts, ['better', 'better']);
  assert.equal(a.macros, 1);
  const doc = readMacros(root);
  assert.equal(doc.macros.length, 1);
  const m = doc.macros[0];
  assert.match(m.name, /^macro\.render-number-aggregate-sum/);
  assert.deepEqual([m.body, m.params, m.from, m.era], [TOP, 0, ['t1', 't2', 't4'], 2]);
  assert.equal(typeof m.at, 'string');
  const row = lastRow(root);
  assert.deepEqual([row.kind, row.change.op, row.change.name, row.mined], ['macro', 'add', m.name, 9]);
  const next = await macroCandidate(root, 3);
  assert.notEqual(next.macro.name, m.name, 'a kept macro is not proposed again');
  const b = await step(root, opts(tmp, { FAKE_TARGET: '9' }, { era: 4, kind: 'macro' }));
  assert.equal(b.kept, false);
  assert.deepEqual(b.verdicts, ['equal']);
  assert.equal(readMacros(root).macros.length, 1, 'a reverted macro changes nothing');
  const after = await macroCandidate(root, 5);
  assert.notEqual(after.macro.name, lastRow(root).change.name, 'a reverted macro is not proposed again');
  assert.deepEqual(fs.readdirSync(tmp), []);
});

test('a macro no kept cell used for 20 eras is retired by a trial row; a used one is marked and stays', async () => {
  const unused = { name: 'macro.old-aaaaaa', body: ['render.number', ['aggregate.min', ['sense.numbers']]], params: 0, from: ['t1', 't2'], at: '2026-10-01T00:00:00.000Z', era: 1 };
  const used = { name: 'macro.used-bbbbbb', body: ['render.number', ['aggregate.mean', ['sense.numbers']]], params: 0, from: ['t3'], at: '2026-10-01T00:00:00.000Z', era: 1 };
  const cells = { ...CELLS, t3: [...CELLS.t3, { id: 'c9', pyramid: ['render.number', ['macro.used-bbbbbb', ['sense.numbers']]] }] };
  const root = fixture({ macros: { macros: [unused, used], note: 'kept' }, cells });
  assert.deepEqual(retireMacros(root, 20), [], '19 eras is under the bar');
  assert.equal(readMacros(root).macros.find((x) => x.name === used.name).used, 20);
  const tmp = scratchDir();
  const line = await step(root, opts(tmp, { FAKE_FEATURES: '' }, { era: 21 }));
  assert.equal(line.retired, 1);
  const doc = readMacros(root);
  assert.deepEqual(doc.macros.map((x) => x.name), [used.name]);
  assert.equal(doc.note, 'kept', 'other keys of MACROS.json are kept');
  const row = readTrials(root).find((r) => r.change && r.change.op === 'retire');
  assert.deepEqual([row.kind, row.kept, row.era, row.change.name, row.before.since, row.after.macros], ['macro', true, 21, unused.name, 1, 1]);
  assert.match(row.why, /no kept cell used it for 20 eras \(the bar is 20\)/);
  assert.equal(status(root).retired, 1);
  const quiet = retireMacros(root, 40, { cells: [] });
  assert.deepEqual(quiet, [], 'the used macro counts its 20 eras from era 21, its last use');
  assert.equal(retireMacros(root, 41, { cells: [] }).length, 1);
  assert.equal(readMacros(root).macros.length, 0);
});

// ---------------------------------------------------------------- status and the CLI
test('status: the counts, the lineage, the genes changed, the macros and the last 5 rows', () => {
  const root = fixture({ genome: { version: 1, genes: { maxCost: 9 }, lineage: 3 }, macros: { macros: [{ name: 'macro.a-111111', body: TOP, params: 0, from: ['t1', 't2'], at: 'x' }] } });
  const rows = [
    { at: 'a', era: 1, kind: 'genome', change: null, before: null, after: null, kept: false, skipped: 'no' },
    { at: 'b', era: 2, kind: 'genome', change: [{ gene: 'maxCost', from: 7, to: 8 }], before: { heldoutOk: 1 }, after: { heldoutOk: 2 }, kept: true, why: 'w' },
    { at: 'c', era: 3, kind: 'genome', change: [{ gene: 'maxCost', from: 8, to: 7 }], before: { heldoutOk: 2 }, after: { heldoutOk: 1 }, kept: false, why: 'worse' },
    { at: 'd', era: 4, kind: 'macro', change: { op: 'add', name: 'macro.a-111111', size: 4, params: 0, from: ['t1', 't2'] }, before: {}, after: {}, kept: true, why: 'w' },
    { at: 'e', era: 5, kind: 'genome', change: [], before: {}, after: null, kept: false, blocked: 'crash', why: 'crash' },
    { at: 'f', era: 6, kind: 'macro', change: { op: 'retire', name: 'macro.b', why: 'old' }, before: {}, after: {}, kept: true, why: 'old' },
    { at: 'g', era: 7, kind: 'genome', change: [{ gene: 'maxCost', from: 8, to: 9 }], before: {}, after: {}, kept: true, why: 'w' },
  ];
  put(root, 'neo/TRIALS.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n{torn\n');
  const s = status(root);
  assert.deepEqual([s.trials, s.kept, s.reverted, s.skipped, s.blocked, s.retired, s.lineage], [7, 3, 1, 1, 1, 1, 3]);
  assert.equal(s.genome, genomeId(genomeOf(root)));
  assert.deepEqual(s.changed, [{ gene: 'maxCost', from: 7, to: 9 }]);
  assert.deepEqual(s.macros, ['macro.a-111111']);
  assert.deepEqual(s.last.map((r) => r.at), ['c', 'd', 'e', 'f', 'g']);
  assert.deepEqual(s.last[0], { at: 'c', era: 3, kind: 'genome', change: 'maxCost 8 -> 7', kept: false, why: 'worse', before: { heldoutOk: 2 }, after: { heldoutOk: 1 } });
  assert.equal(s.last[1].change, 'add macro.a-111111 (4 nodes, 0 params, 2 tasks)');
  const bare = status(fixture());
  assert.deepEqual([bare.trials, bare.kept, bare.lineage, bare.changed, bare.last], [0, 0, 0, [], []]);
});

test('CLI: each verb prints one JSON line and exits 0; a usage error exits 2; no held-out row is printed', () => {
  const root = fixture();
  const tmp = scratchDir();
  const env = { ...process.env, FAKE_TARGET: '9' };
  const cli = (...args) => spawnSync(process.execPath, [EVOLVE, ...args], { encoding: 'utf8', env });
  const s = cli('step', '--root', root, '--era', '1', '--max-ms', '60000', '--sample', '2', '--kind', 'genome', '--genes', 'maxCost', '--engine', FAKE, '--tmp', tmp);
  assert.equal(s.status, 0, s.stderr);
  const lines = s.stdout.trim().split(/\r?\n/);
  assert.equal(lines.length, 1);
  const line = JSON.parse(lines[0]);
  assert.deepEqual([line.era, line.kind, line.sample.length, line.scratchLeft], [1, 'genome', 2, false]);
  assert.deepEqual(fs.readdirSync(tmp), []);
  const st = cli('status', '--root', root);
  assert.equal(st.status, 0);
  assert.equal(st.stdout.trim().split(/\r?\n/).length, 1);
  assert.equal(JSON.parse(st.stdout).trials, 1);
  const mi = cli('mine', '--root', root);
  assert.equal(mi.status, 0);
  const mined = JSON.parse(mi.stdout);
  assert.deepEqual([mined.cells, mined.top[0].tasks], [9, 3]);
  const nx = cli('step', '--root', root, '--engine', FAKE, '--tmp', tmp, '--sample', '1', '--kind', 'genome');
  assert.equal(JSON.parse(nx.stdout).era, 2, 'no --era: one after the last era in TRIALS.jsonl');
  for (const s2 of [s, st, mi, nx]) for (const x of [SECRET_ROW, SECRET_JUDGE, SECRET_CONTROL]) assert.equal((s2.stdout + s2.stderr).includes(x), false);
  for (const bad of [['bogus'], [], ['step', '--era', '-1'], ['step', '--era', 'x'], ['step', '--kind', 'cell'], ['step', '--genes', 'wizard'], ['step', '--nope', '1'], ['step', '--era'], ['status', 'extra'], ['step', '--max-ms', '0']]) {
    const r = cli(...bad, '--root', root);
    assert.equal(r.status, 2, bad.join(' ') + ': ' + r.stdout);
    const last = JSON.parse(r.stdout.trim().split(/\r?\n/).at(-1));
    assert.deepEqual([last.ok, last.code], [false, 2]);
    assert.match(r.stderr, /usage/);
  }
  assert.equal(readTrials(root).length, 2, 'a usage error writes nothing');
});

test('the scratch directory may not lie inside the tree; stale scratch roots of a killed step are swept, others are left', async () => {
  const root = fixture();
  await assert.rejects(step(root, { engine: FAKE, tmp: path.join(root, 'neo', 'x') }), (e) => e instanceof Fail && /inside the tree/.test(e.message));
  const tmp = scratchDir();
  const old = path.join(tmp, 'evolve-old'), young = path.join(tmp, 'evolve-young'), foreign = path.join(tmp, 'evolve-foreign');
  for (const d of [old, young, foreign]) fs.mkdirSync(path.join(d, 'template'), { recursive: true });
  fs.writeFileSync(path.join(old, '.evolve-scratch'), '1');
  fs.writeFileSync(path.join(young, '.evolve-scratch'), '1');
  const past = new Date(Date.now() - 2 * 3600000);
  fs.utimesSync(path.join(old, '.evolve-scratch'), past, past);
  assert.equal(sweepStale(tmp), 1);
  assert.deepEqual(fs.readdirSync(tmp).sort(), ['evolve-foreign', 'evolve-young']);
  assert.equal(sweepStale(path.join(tmp, 'missing')), 0);
});
