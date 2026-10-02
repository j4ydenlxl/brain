// test/grow-pipeline.test.mjs: grow/pipeline.mjs (contract c9) on fixture roots built here and removed after. Offline,
// no model call; never the tree's neo/ or grown/. A rise promotes, a tie does not, one task's regression or the locked
// mean's blocks, a restore is byte exact (added files removed, removed files back, the KEEP files and the ledger's cursor
// kept), a crash between steps leaves the tree at the snapshot, a held-out file is never opened.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as P from '../grow/pipeline.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(HERE, '..', 'grow', 'pipeline.mjs');

const put = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
const get = (root, rel) => fs.readFileSync(path.join(root, ...rel.split('/')), 'utf8');
const has = (root, rel) => fs.existsSync(path.join(root, ...rel.split('/')));
const json = (o) => JSON.stringify(o, null, 2) + '\n';
const cell = (task, ok, n, extra = {}) => ({ id: task + '-neo-g1', tier: 'neo', class: task, heldout: { ok, n, score: n ? ok / n : 0 }, ...extra });
const BASELINE = [
  "import fs from 'node:fs';",
  "const cls = process.argv[2]; const i = process.argv.indexOf('--out');",
  "fs.appendFileSync('work/baseline.log', cls + '\\n');",
  "let s = null; try { s = JSON.parse(fs.readFileSync('grown/locked.json', 'utf8')).score; } catch {}",
  "if (typeof s !== 'number') { console.error('no score'); process.exit(3); }",
  "fs.writeFileSync(process.argv[i + 1], JSON.stringify({ rows: [] }));",
  "console.log(JSON.stringify({ class: cls, score: s }));",
].join('\n') + '\n';

/** A fixture root: two tasks (t1 3 of 5, t2 2 of 4), a cell each, a ledger with a cursor, a locked class scoring 0.5. */
function makeRoot({ locked = 0.5, classes = ['alpha'] } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-pipeline-'));
  put(root, 'grown/index.json', json({ cells: [cell('t1', 3, 5), cell('t2', 2, 4)] }));
  put(root, 'grown/cells/t1-neo-g1.mjs', 'export default 1;\n');
  put(root, 'grown/cells/t2-neo-g1.mjs', 'export default 2;\n');
  if (locked !== null) put(root, 'grown/locked.json', json({ score: locked }));
  put(root, 'neo/LEDGER.json', json({ tasks: [{ task: 't1', cursor: 1 }, { task: 't2', cursor: 7 }], generated: 10 }));
  put(root, 'neo/ERA.json', json({ era: 4, eras: [] }));
  put(root, 'neo/ABSORB.json', json({ pulled: ['a'] }));
  for (const t of ['t1', 't2']) { put(root, 'neo/tasks/' + t + '/dev.jsonl', '{"q":"' + t + '"}\n'); put(root, 'neo/tasks/' + t + '/heldout.jsonl', '{"h":"' + t + '"}\n'); }
  put(root, 'neo/know/INDEX.json', json({ shelves: 1 }));
  fs.mkdirSync(path.join(root, 'judge', 'dev'), { recursive: true });
  for (const c of classes) put(root, 'judge/dev/' + c + '.jsonl', '');
  put(root, 'judge/baseline.mjs', BASELINE);
  fs.mkdirSync(path.join(root, 'work'), { recursive: true });
  return root;
}
const rm = (root) => fs.rmSync(root, { recursive: true, force: true });
/** Every file under neo/ and grown/ (the KEEP files left out unless keep) with its bytes' hash. */
function treeOf(root, { keep = false } = {}) {
  const out = {};
  for (const rel of P.listFiles(root)) if (keep || !P.isKeep(rel)) out[rel] = createHash('sha1').update(fs.readFileSync(path.join(root, ...rel.split('/')))).digest('hex');
  return out;
}
const dirsOf = (root) => {
  const out = [];
  const walk = (rel) => { for (const d of fs.readdirSync(path.join(root, ...rel.split('/')), { withFileTypes: true })) if (d.isDirectory()) { out.push(rel + '/' + d.name); walk(rel + '/' + d.name); } };
  for (const t of P.TOPS) if (has(root, t)) walk(t);
  return out.sort();
};
const setIndex = (root, cells) => put(root, 'grown/index.json', json({ cells }));
const cli = (root, ...args) => {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { cwd: root, encoding: 'utf8', timeout: 60000 });
  const lines = (r.stdout || '').trim().split('\n').filter(Boolean);
  let j = null;
  try { j = JSON.parse(lines[lines.length - 1]); } catch { j = null; }
  return { code: r.status, out: j, stdout: r.stdout, stderr: r.stderr };
};
const baselineRuns = (root) => (has(root, 'work/baseline.log') ? get(root, 'work/baseline.log').split('\n').filter(Boolean).length : 0);

test('a rise of held-out rows right promotes and keeps every generated file', async () => {
  const root = makeRoot();
  try {
    const s = await P.snapshot(root, { era: 5 });
    assert.equal(s.before.heldout.ok, 5);
    assert.equal(s.before.heldout.n, 9);
    assert.equal(s.before.locked.mean, 0.5);
    setIndex(root, [cell('t1', 4, 5), cell('t2', 2, 4)]);
    put(root, 'grown/cells/t1-neo-g2.mjs', 'export default 11;\n');
    const want = treeOf(root, { keep: true });
    const r = await P.promote(root, { era: 5 });
    assert.equal(r.promoted, true);
    assert.deepEqual(r.fell, []);
    assert.match(r.raised[0], /^held-out rows right 5 to 6$/);
    assert.equal(r.after.heldout.ok, 6);
    assert.equal(r.restored, null);
    const got = treeOf(root, { keep: true });
    delete got['neo/PIPELINE.json'];
    assert.deepEqual(got, want);
    assert.equal(has(root, P.PENDING), false);
    const d = P.readDecisions(root);
    assert.equal(d.promotions, 1);
    assert.equal(d.lastPromoted.era, 5);
  } finally { rm(root); }
});

test('a tie is not promoted and the era\'s generated files are restored byte for byte', async () => {
  const root = makeRoot();
  try {
    const before = treeOf(root), dirs = dirsOf(root);
    await P.snapshot(root, { era: 2 });
    put(root, 'grown/cells/t1-neo-g1.mjs', 'export default 99;\n');
    put(root, 'grown/cells/new/deep/x.mjs', 'export default 3;\n');
    fs.rmSync(path.join(root, 'grown', 'cells', 't2-neo-g1.mjs'));
    put(root, 'neo/know/INDEX.json', json({ shelves: 1 }));
    const r = await P.promote(root, { era: 2 });
    assert.equal(r.promoted, false);
    assert.deepEqual(r.raised, []);
    assert.deepEqual(r.fell, []);
    assert.equal(r.why, 'nothing rose (a tie is not promoted)');
    assert.deepEqual(treeOf(root), before);
    assert.deepEqual(dirsOf(root), dirs);
    assert.equal(r.restored.removed, 1);
    assert.equal(r.restored.files, 2);
    assert.equal(P.readDecisions(root).restores, 1);
  } finally { rm(root); }
});

test('one task that regresses blocks a rise of the total, and the tree goes back', async () => {
  const root = makeRoot();
  try {
    const before = treeOf(root);
    await P.snapshot(root, { era: 3 });
    setIndex(root, [cell('t1', 5, 5), cell('t2', 1, 4)]);
    const r = await P.promote(root, { era: 3 });
    assert.equal(r.promoted, false);
    assert.ok(r.raised.some((x) => /^held-out rows right 5 to 6$/.test(x)));
    assert.deepEqual(r.fell, ['task t2 regressed: 2 to 1 held-out rows right']);
    assert.match(r.why, /^fell: task t2 regressed/);
    assert.deepEqual(r.gained, ['t1']);
    assert.deepEqual(r.regressed, ['t2']);
    assert.deepEqual(treeOf(root), before);
  } finally { rm(root); }
});

test('a task that loses its colony blocks', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 3 });
    setIndex(root, [cell('t1', 5, 5)]);
    const r = await P.promote(root, { era: 3 });
    assert.equal(r.promoted, false);
    assert.ok(r.fell.some((x) => x.startsWith('task t2 lost its colony')));
  } finally { rm(root); }
});

test('a fall of the locked classes mean blocks a rise of held-out rows', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 6 });
    setIndex(root, [cell('t1', 4, 5), cell('t2', 2, 4)]);
    put(root, 'grown/locked.json', json({ score: 0.25 }));
    const r = await P.promote(root, { era: 6 });
    assert.equal(r.promoted, false);
    assert.deepEqual(r.fell, ['the locked classes mean 0.5 to 0.25']);
    assert.equal(r.after.locked.mean, 0.25);
    assert.equal(JSON.parse(get(root, 'grown/locked.json')).score, 0.5);
  } finally { rm(root); }
});

test('a locked mean that rises with held-out rows promotes; an equal mean is no fall', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 6 });
    setIndex(root, [cell('t1', 4, 5), cell('t2', 2, 4)]);
    put(root, 'grown/locked.json', json({ score: 0.5, touched: 1 }));
    const r = await P.promote(root, { era: 6 });
    assert.equal(r.promoted, true);
    assert.equal(r.after.locked.mean, 0.5);
  } finally { rm(root); }
});

test('locked classes that cannot be measured after a change to what serves block', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 6 });
    setIndex(root, [cell('t1', 4, 5), cell('t2', 2, 4)]);
    fs.rmSync(path.join(root, 'grown', 'locked.json'));
    const r = await P.promote(root, { era: 6 });
    assert.equal(r.promoted, false);
    assert.ok(r.fell.some((x) => x.startsWith('the locked classes could not be measured')));
    assert.equal(has(root, 'grown/locked.json'), true);
  } finally { rm(root); }
});

test('the locked classes are measured again only when what serves moved, else carried or read from the cache', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 1 });
    assert.equal(baselineRuns(root), 1);
    put(root, 'neo/ABSORB.json', json({ pulled: ['a', 'b'] }));
    const r = await P.promote(root, { era: 1 });
    assert.equal(r.promoted, false);
    assert.equal(baselineRuns(root), 1);
    await P.snapshot(root, { era: 2 });
    assert.equal(baselineRuns(root), 1);
    put(root, 'grown/cells/t1-neo-g1.mjs', 'export default 5;\n');
    await P.promote(root, { era: 2 });
    assert.equal(baselineRuns(root), 2);
  } finally { rm(root); }
});

test('no locked class (judge/dev/ empty): the held-out rows decide alone', async () => {
  const root = makeRoot({ classes: [] });
  try {
    const s = await P.snapshot(root, { era: 1 });
    assert.equal(s.before.locked.mean, null);
    assert.ok(s.blocked.includes('locked: judge/dev/ names no class'));
    setIndex(root, [cell('t1', 4, 5), cell('t2', 2, 4)]);
    put(root, 'grown/locked.json', json({ score: 0 }));
    const r = await P.promote(root, { era: 1 });
    assert.equal(r.promoted, true);
  } finally { rm(root); }
});

test('mastered colonies: one more mastered raises, one fewer falls', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 1 });
    setIndex(root, [cell('t1', 3, 5), cell('t2', 2, 4, { serve: true })]);
    const r = await P.promote(root, { era: 1 });
    assert.equal(r.promoted, true);
    assert.deepEqual(r.raised, ['mastered 0 to 1']);
    await P.snapshot(root, { era: 2 });
    setIndex(root, [cell('t1', 4, 5), cell('t2', 2, 4, { serve: false })]);
    const r2 = await P.promote(root, { era: 2 });
    assert.equal(r2.promoted, false);
    assert.deepEqual(r2.fell, ['mastered 1 to 0']);
  } finally { rm(root); }
});

test('a trial the engine kept in this era raises; one of another era or skipped does not', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 8 });
    put(root, 'neo/GENOME.json', json({ genome: { k: 2 } }));
    put(root, 'neo/TRIALS.jsonl', [JSON.stringify({ era: 7, kind: 'genome', kept: true }), JSON.stringify({ era: 8, kind: 'macro', kept: true, skipped: 'x' }), ''].join('\n'));
    const r = await P.promote(root, { era: 8 });
    assert.equal(r.promoted, false);
    assert.equal(has(root, 'neo/GENOME.json'), false);
    assert.equal(has(root, 'neo/TRIALS.jsonl'), true);
    await P.snapshot(root, { era: 9 });
    put(root, 'neo/GENOME.json', json({ genome: { k: 2 } }));
    fs.appendFileSync(path.join(root, 'neo', 'TRIALS.jsonl'), JSON.stringify({ era: 9, kind: 'genome', kept: true, before: { heldoutOk: 4 }, after: { heldoutOk: 6 } }) + '\n');
    const r2 = await P.promote(root, { era: 9 });
    assert.equal(r2.promoted, true);
    assert.deepEqual(r2.raised, ['trial genome kept by the engine\'s measure (held-out 4 to 6 on its sample)']);
    assert.equal(has(root, 'neo/GENOME.json'), true);
  } finally { rm(root); }
});

test('a restore keeps the KEEP files and merges the ledger: new tasks go, cursors and generated stay', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 4 });
    put(root, 'neo/ERA.json', json({ era: 5, eras: [{ era: 5 }] }));
    put(root, 'neo/LEDGER.json', json({ tasks: [{ task: 't1', cursor: 9 }, { task: 't2', cursor: 7 }, { task: 't3', cursor: 0 }], generated: 25 }));
    put(root, 'neo/tasks/t3/dev.jsonl', '{"q":"t3"}\n');
    put(root, 'neo/tasks/t3/heldout.jsonl', '{"h":"t3"}\n');
    put(root, 'neo/ABSORB.json', json({ pulled: ['a', 'b'] }));
    put(root, 'grown/measure.jsonl', '{"era":5}\n');
    const r = await P.promote(root, { era: 4 });
    assert.equal(r.promoted, false);
    assert.equal(r.restored.ledger, true);
    const led = JSON.parse(get(root, 'neo/LEDGER.json'));
    assert.deepEqual(led.tasks, [{ task: 't1', cursor: 9 }, { task: 't2', cursor: 7 }]);
    assert.equal(led.generated, 25);
    assert.equal(JSON.parse(get(root, 'neo/ERA.json')).era, 5);
    assert.equal(get(root, 'grown/measure.jsonl'), '{"era":5}\n');
    assert.equal(has(root, 'neo/tasks/t3'), false);
    assert.deepEqual(JSON.parse(get(root, 'neo/ABSORB.json')).pulled, ['a', 'b'], 'the search cursor moves on');
  } finally { rm(root); }
});

test('mergeLedger: an unreadable side keeps the snapshot bytes; another task at an index keeps the snapshot row', () => {
  const b = json({ tasks: [{ task: 't1', cursor: 1 }], generated: 3 });
  assert.equal(P.mergeLedger(b, '{not json'), b);
  assert.equal(P.mergeLedger('nope', b), 'nope');
  const m = JSON.parse(P.mergeLedger(b, json({ tasks: [{ task: 'tx', cursor: 5 }], generated: 4, extra: 1 })));
  assert.deepEqual(m.tasks, [{ task: 't1', cursor: 1 }]);
  assert.equal(m.generated, 4);
  assert.equal(m.extra, 1);
});

test('a KEEP file the era deleted and a ledger the era deleted come back from the snapshot', async () => {
  const root = makeRoot();
  try {
    const want = get(root, 'neo/LEDGER.json'), era = get(root, 'neo/ERA.json');
    await P.snapshot(root, { era: 1 });
    fs.rmSync(path.join(root, 'neo', 'LEDGER.json'));
    fs.rmSync(path.join(root, 'neo', 'ERA.json'));
    await P.promote(root, { era: 1 });
    assert.equal(get(root, 'neo/LEDGER.json'), want);
    assert.equal(get(root, 'neo/ERA.json'), era);
  } finally { rm(root); }
});

test('a crash between steps: the next snapshot puts the tree back first; restore does it on demand', async () => {
  const root = makeRoot();
  try {
    const before = treeOf(root), dirs = dirsOf(root);
    const s1 = cli(root, 'snapshot', '--era', '1');
    assert.equal(s1.code, 0, s1.stderr);
    assert.equal(s1.out.snapshot, true);
    assert.equal(s1.out.recovered, null);
    put(root, 'grown/cells/half.mjs', 'export default 0;\n');
    setIndex(root, [cell('t1', 5, 5), cell('t2', 2, 4)]);
    put(root, 'neo/tasks/t1/heldout.jsonl', '{"h":"changed"}\n');
    const s2 = cli(root, 'snapshot', '--era', '2');
    assert.equal(s2.code, 0, s2.stderr);
    assert.deepEqual(s2.out.recovered, { era: 1, restored: 2, removed: 1, missing: 0 });
    assert.deepEqual(treeOf(root), before);
    assert.deepEqual(dirsOf(root), dirs);
    put(root, 'grown/cells/half.mjs', 'export default 0;\n');
    const st = cli(root, 'status');
    assert.equal(st.out.pending.era, 2);
    const rs = cli(root, 'restore');
    assert.equal(rs.code, 0, rs.stderr);
    assert.equal(rs.out.removed, 1);
    assert.deepEqual(treeOf(root), before);
    assert.equal(cli(root, 'status').out.pending, null);
    assert.equal(cli(root, 'restore').out.why, 'no pending snapshot');
  } finally { rm(root); }
});

test('a held-out file is never opened: copied by path, compared by its size and times, restored exact', async () => {
  const root = makeRoot();
  const real = fs.readFileSync, opened = [];
  fs.readFileSync = function (f, ...rest) { if (/heldout\.jsonl$/.test(String(f))) opened.push(String(f)); return real.call(this, f, ...rest); };
  try {
    await P.snapshot(root, { era: 1 });
    put(root, 'neo/tasks/t2/heldout.jsonl', '{"h":"other"}\n');
    put(root, 'neo/tasks/t9/heldout.jsonl', '{"h":"new"}\n');
    const r = await P.promote(root, { era: 1 });
    assert.equal(r.promoted, false);
    fs.readFileSync = real;
    assert.deepEqual(opened, []);
    assert.equal(get(root, 'neo/tasks/t2/heldout.jsonl'), '{"h":"t2"}\n');
    assert.equal(has(root, 'neo/tasks/t9'), false);
  } finally { fs.readFileSync = real; rm(root); }
});

test('an index that is not JSON after the era blocks; before the era it blocks too', async () => {
  const root = makeRoot();
  try {
    await P.snapshot(root, { era: 1 });
    put(root, 'grown/index.json', '{broken');
    const r = await P.promote(root, { era: 1 });
    assert.equal(r.promoted, false);
    assert.ok(r.fell[0].startsWith('the held-out rows could not be counted after'));
    assert.equal(JSON.parse(get(root, 'grown/index.json')).cells.length, 2);
  } finally { rm(root); }
});

test('the store: blobs are reused while a file does not move and the stale ones are collected', async () => {
  const root = makeRoot();
  try {
    const s1 = await P.snapshot(root, { era: 1 });
    assert.ok(s1.copied > 0);
    await P.promote(root, { era: 1 });
    const s2 = await P.snapshot(root, { era: 2 });
    assert.equal(s2.copied, fs.statSync(path.join(root, 'neo', 'PIPELINE.json')).size, 'only the decision record is new');
    put(root, 'grown/cells/t1-neo-g1.mjs', 'export default 77;\n');
    setIndex(root, [cell('t1', 4, 5), cell('t2', 2, 4)]);
    await P.promote(root, { era: 2 });
    const blobs = fs.readdirSync(path.join(root, ...P.BLOBS.split('/')));
    assert.equal(blobs.length, P.listFiles(root).length);
  } finally { rm(root); }
});

test('the CLI: one JSON line, promote without a snapshot exits 1, usage exits 2', () => {
  const root = makeRoot();
  try {
    const p = cli(root, 'promote');
    assert.equal(p.code, 1);
    assert.match(p.stderr, /^pipeline: no pending snapshot/);
    assert.equal(cli(root, 'bogus').code, 2);
    assert.equal(cli(root, 'snapshot', '--era', 'x').code, 2);
    assert.equal(cli(root, 'status', '--era', '3').code, 2);
    assert.equal(cli(root, 'snapshot', '--nope', '1').code, 2);
    const s = cli(root, 'snapshot', '--era', '3', '--max-ms', '60000');
    assert.equal(s.code, 0, s.stderr);
    assert.equal(s.stdout.trim().split('\n').length, 1);
    const pr = cli(root, 'promote');
    assert.equal(pr.code, 0, pr.stderr);
    for (const k of ['promoted', 'why', 'before', 'after', 'raised', 'fell']) assert.ok(Object.hasOwn(pr.out, k), k);
    assert.equal(pr.out.era, 3);
    const h = spawnSync(process.execPath, [SCRIPT, '--help'], { encoding: 'utf8' });
    assert.equal(h.status, 0);
    assert.match(h.stdout, /^usage: node grow\/pipeline\.mjs/);
  } finally { rm(root); }
});

test('decide: the rules on plain measures', () => {
  const m = (ok, mastered, tasks, mean = 0.5, fp = 'a') => ({ heldout: { ok, n: 10 }, mastered, tasks, locked: { mean }, fp });
  assert.equal(P.decide(m(5, 1, { a: [5, 10] }), m(6, 1, { a: [6, 10] })).promoted, true);
  assert.equal(P.decide(m(5, 1, { a: [5, 10] }), m(5, 1, { a: [5, 10] })).promoted, false);
  assert.equal(P.decide(m(5, 1, { a: [5, 10] }), m(4, 2, { a: [4, 10] })).promoted, false);
  assert.equal(P.decide(m(5, 1, { a: [5, 10] }, 0.5, 'a'), m(6, 1, { a: [6, 10] }, 0.4, 'a')).promoted, true, 'the same serving fingerprint carries the mean');
  assert.equal(P.decide(m(5, 1, { a: [5, 10] }, 0.5, 'a'), m(6, 1, { a: [6, 10] }, 0.4, 'b')).promoted, false);
  assert.equal(P.decide({ heldout: null, tasks: null, mastered: null, locked: null }, m(6, 1, {})).promoted, false);
});

test('a pending snapshot taken on another commit is dropped, never restored over what the checkout moved to', async () => {
  const root = makeRoot();
  const A = 'a'.repeat(40), B = 'b'.repeat(40);
  try {
    put(root, '.git/HEAD', 'ref: refs/heads/master\n');
    put(root, '.git/refs/heads/master', A + '\n');
    assert.equal(P.headOf(root), A);
    await P.snapshot(root, { era: 1 });
    assert.equal(JSON.parse(get(root, P.PENDING)).head, A);
    put(root, 'grown/cells/pulled.mjs', 'export default 4;\n');
    put(root, '.git/refs/heads/master', B + '\n');
    const s = await P.snapshot(root, { era: 2 });
    assert.equal(s.recovered.era, 1);
    assert.match(s.recovered.dropped, /moved to another commit/);
    assert.equal(has(root, 'grown/cells/pulled.mjs'), true);
    put(root, 'grown/cells/later.mjs', 'export default 5;\n');
    fs.rmSync(path.join(root, '.git', 'refs', 'heads', 'master'));
    put(root, '.git/packed-refs', '# pack-refs with: peeled\n' + A + ' refs/heads/master\n');
    assert.equal(P.headOf(root), A);
    const r = P.restore(root);
    assert.match(r.why, /moved to another commit/);
    assert.equal(has(root, 'grown/cells/later.mjs'), true);
    assert.equal(has(root, P.PENDING), false);
  } finally { rm(root); }
});

test('the same commit: a pending snapshot is restored (the checkout did not move)', async () => {
  const root = makeRoot();
  try {
    put(root, '.git/HEAD', 'c'.repeat(40) + '\n');
    await P.snapshot(root, { era: 1 });
    put(root, 'grown/cells/half.mjs', 'x\n');
    const s = await P.snapshot(root, { era: 2 });
    assert.equal(s.recovered.removed, 1);
    assert.equal(has(root, 'grown/cells/half.mjs'), false);
  } finally { rm(root); }
});
