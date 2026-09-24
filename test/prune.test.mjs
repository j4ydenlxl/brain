// test/prune.test.mjs: self/prune.mjs, the census wall authored (Board 14). Every run is on a
// planted tree under a temp directory (test/prune-plant.mjs): a tiny organism emitted by the
// planted tree's own emitter, a census whose bitset is planted by a fixed rule no prune code
// computes, and gate stand-ins. No test calls Ollama, none reads or writes the real tree's
// organism/, and each deletes what it planted.
//
//   (a) a planted census bitset prunes to the expected lines, loads as the pruned content, reads
//       its dead share after from a census of that content, and the patch applies to the seed
//   (b) the carried census record is what the gate needs; a red gate refuses; a control runs
//       the same copy with no prune
//   (c) a seed with no census is refused before any copy is made
//   (d) a popcount that disagrees with the count is refused, and the decode is the autopilot's
//   (e) the real tree's hash before equals its hash after, and the hash sees a one byte change
//   (f) gateIncludes and copyTree carry what the authored code reads (fixtures, web/dist, the
//       out-of-tree tape, copied into the trial's own box) and nothing else skipped
//   (g) pruneOnCopy refuses the tree it lives in
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync, cpSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { plantTree, plantSeed, plantCensus, plantVariant, REAL_ROOT } from './prune-plant.mjs';
import { pruneSeed, pickSeed, censusBits, treeHash, gateIncludes, copyTree, unifiedDiff } from '../self/prune.mjs';
import { decodeBits } from '../self/autopilot.mjs';
import { applyUnifiedPatch } from '../self/code.mjs';
import { pruneOnCopy } from '../genome/emit.mjs';

let TMP, PLANT, WORK, C;
const quiet = () => {};
const copiesIn = (dir) => (existsSync(dir) ? readdirSync(dir).filter((n) => n.startsWith('brain-prune-')) : []);
const run = (o) => pruneSeed({ root: PLANT, work: WORK, gateCmd: 'node gate-seeds.mjs', log: quiet, ...o });

before(() => {
  TMP = mkdtempSync(path.join(os.tmpdir(), 'prune-test-'));
  PLANT = plantTree(path.join(TMP, 'plant'));
  WORK = path.join(TMP, 'work');
  plantSeed(PLANT, { name: 'tiny' });
  C = plantCensus(PLANT, 'tiny');
});
after(() => { if (TMP) rmSync(TMP, { recursive: true, force: true }); });

test('(a) a planted census bitset prunes to the expected lines', () => {
  // the expectation is arithmetic on the planted rule, not a number the prune code computed
  assert.equal(C.circuits, C.prunedCircuits, 'the planted rule keeps a cell in every circuit');
  assert.equal(C.regions, C.prunedRegions);
  assert.ok(C.deadCells > 0 && C.deadEdges > 0, 'the plant marks something dead');
  assert.equal(C.linesAfter, C.linesBefore - C.deadCells - C.deadEdges);
  const oldIndex = readFileSync(path.join(PLANT, 'organism', 'tiny', 'index.mjs'), 'utf8');
  const oldManifest = readFileSync(path.join(PLANT, 'organism', 'tiny', 'manifest.json'), 'utf8');
  const r = run({ census: C.census });
  assert.equal(r.decision, 'would apply', r.reason);
  assert.equal(r.seed, 'organism/tiny');
  assert.equal(r.linesBefore, C.linesBefore);
  assert.equal(r.linesAfter, C.linesAfter, 'lines after = lines before - dead cells - dead edges');
  assert.equal(r.prune.cells.after, C.cells.live);
  assert.equal(r.prune.edges.after, C.edges.live);
  assert.equal(r.census.cells.dead, C.deadCells);
  assert.equal(r.census.edges.dead, C.deadEdges);
  // the re-pointed seed loads, verifies, and is the pruned content
  assert.equal(r.load.ok, true, JSON.stringify(r.load));
  assert.equal(r.load.pruned, true);
  assert.equal(r.load.hash, C.prunedHash);
  assert.equal(r.prunedDir, 'organism/tiny-pruned');
  assert.deepEqual(r.prunedOnReal, { dir: 'organism/tiny-pruned', exists: false, hash: null, sameHash: false });
  // dead share before from the census, after from the census of the pruned content
  assert.equal(r.deadShareBefore, C.deadShareBefore);
  assert.equal(r.deadShareAfter, 0);
  assert.equal(r.after.file, 'census-tiny-pruned.json');
  assert.equal(r.after.sameRuler, true);
  assert.ok(r.deadShareAfter < r.deadShareBefore);
  assert.deepEqual(r.carried, { file: 'census-tiny-repointed-partial.json', from: 'census-tiny-pruned.json' });
  // the seed's own test ran on the copy, then the gate
  assert.deepEqual(r.tests.map((t) => [t.file, t.exit, t.pass]), [['test/tiny.test.mjs', 0, 1]]);
  assert.equal(r.gate.verdict, 'GREEN', r.gate.summary);
  assert.match(r.gate.summary, /2 of 2 seeds have a census at their hash/);
  // the patch is two hunks, the seed's index.mjs and manifest.json, and applies to the seed as it is
  const parts = r.patch.split(/(?=^--- a\/)/m);
  assert.deepEqual(parts.map((p) => p.split('\n')[0]), ['--- a/organism/tiny/index.mjs', '--- a/organism/tiny/manifest.json']);
  const ai = applyUnifiedPatch(oldIndex, parts[0]), am = applyUnifiedPatch(oldManifest, parts[1]);
  assert.ok(ai.ok && am.ok);
  assert.match(ai.text, /RE-POINTED by self\/prune\.mjs to organism\/tiny-pruned \(author: organism \(prune\)\)/);
  assert.match(ai.text, /^export \* from "\.\.\/tiny-pruned\/index\.mjs";$/m);
  const m = JSON.parse(am.text);
  assert.equal(m.hash, C.prunedHash);
  assert.equal(m.counts.lines, C.linesAfter);
  assert.ok(m.files.every((f) => f.path.startsWith('../tiny-pruned/')));
  assert.equal(m.repointed.from.hash, C.hash);
  // the copy is gone, organism/ first, and the planted tree is as it was
  assert.equal(r.cleanup.organismDeleted, true);
  assert.equal(r.cleanup.copyDeleted, true);
  assert.equal(path.basename(r.copy.dir), 'brain', 'the copy root keeps the name brain (a gate test reads URLs relative to /brain/)');
  assert.equal(existsSync(r.copy.dir), false);
  assert.deepEqual(copiesIn(WORK), []);
  assert.equal(r.real.same, true);
  assert.equal(readFileSync(path.join(PLANT, 'organism', 'tiny', 'index.mjs'), 'utf8'), oldIndex);
});

test('(b) the carried census is what the gate needs; a red gate refuses; a control prunes nothing', () => {
  const noCarry = run({ census: C.census, carry: false });
  assert.equal(noCarry.decision, 'refused');
  assert.equal(noCarry.wall, 'gate');
  assert.match(noCarry.gate.summary, /^GATE RED: planted, 1 of 2 seeds have no census at their hash: tiny$/);
  assert.equal(noCarry.load.pruned, true, 'the seed loaded; only the gate refused');
  const red = run({ census: C.census, gateCmd: 'node gate-red.mjs' });
  assert.equal(red.decision, 'refused');
  assert.equal(red.wall, 'gate');
  assert.equal(red.reason, 'the gate on the copy is RED');
  const ctl = run({ census: C.census, control: true });
  assert.equal(ctl.decision, 'control');
  assert.equal(ctl.prune, null);
  assert.equal(ctl.patch, null);
  assert.equal(ctl.linesAfter, null);
  assert.equal(ctl.gate.verdict, 'GREEN');
  assert.match(ctl.gate.summary, /1 of 1 seeds have a census at their hash/, 'the control copy holds the unpruned seed alone');
  for (const x of [noCarry, red, ctl]) { assert.equal(x.cleanup.copyDeleted, true); assert.equal(x.real.same, true); }
  assert.deepEqual(copiesIn(WORK), []);
});

test('(c) a seed with no census is refused before any copy is made', () => {
  cpSync(path.join(PLANT, 'organism', 'tiny'), path.join(PLANT, 'organism', 'lonely'), { recursive: true });
  try {
    const a = run({ seed: 'organism/lonely' });
    assert.equal(a.decision, 'refused');
    assert.equal(a.wall, 'census');
    assert.match(a.reason, /^organism\/lonely has no census on disk with liveness bits at its manifest hash$/);
    const b = run({ seed: 'organism/lonely', census: C.census });
    assert.equal(b.decision, 'refused');
    assert.match(b.reason, /is a census of organism\/tiny, not organism\/lonely/);
    const p = pickSeed(PLANT);
    assert.equal(p.pick.seed, 'organism/tiny');
    assert.equal(p.considered.find((x) => x.seed === 'organism/lonely').reason, 'no census on disk names it');
    assert.equal(run({ seed: 'organism/nowhere' }).reason, 'organism/nowhere has no census on disk with liveness bits at its manifest hash');
    assert.deepEqual(copiesIn(WORK), [], 'a refusal at the census wall makes no copy');
  } finally { rmSync(path.join(PLANT, 'organism', 'lonely'), { recursive: true, force: true }); }
});

test('(d) a popcount that disagrees with the count is refused, and the decode is the autopilot\'s', () => {
  const good = C.bits.cells;
  const cb = censusBits(good, 'cell'), ab = decodeBits(good);
  assert.equal(cb.count, ab.count);
  assert.equal(cb.dead, C.deadCells);
  for (let i = 0; i < good.n; i++) assert.equal(cb.bit(i), ab.bit(i), 'bit ' + i);
  const bad = plantVariant(PLANT, C.census, 'bench/verdicts/census-tiny-badcount.json', (v) => { v.live.cells.count += 1; });
  const r = run({ census: bad });
  assert.equal(r.decision, 'refused');
  assert.equal(r.reason, 'the cell liveness popcount ' + C.cells.live + ' disagrees with its recorded count ' + (C.cells.live + 1));
  const badEdges = plantVariant(PLANT, C.census, 'bench/verdicts/census-tiny-badedges.json', (v) => { v.live.edges.count -= 1; });
  assert.equal(run({ census: badEdges }).reason, 'the edge liveness popcount ' + C.edges.live + ' disagrees with its recorded count ' + (C.edges.live - 1));
  const short = plantVariant(PLANT, C.census, 'bench/verdicts/census-tiny-short.json', (v) => { v.live.cells.b64 = Buffer.from(v.live.cells.b64, 'base64').subarray(1).toString('base64'); });
  assert.match(run({ census: short }).reason, /^the cell liveness holds \d+ bytes for 96 bits$/);
  const noCount = plantVariant(PLANT, C.census, 'bench/verdicts/census-tiny-nocount.json', (v) => { delete v.live.cells.count; });
  assert.match(run({ census: noCount }).reason, /records no count/);
  const otherHash = plantVariant(PLANT, C.census, 'bench/verdicts/census-tiny-otherhash.json', (v) => { v.live.manifestHash = 'f'.repeat(64); });
  assert.match(run({ census: otherHash }).reason, /was taken on content hash ffffffffffff, organism\/tiny is /);
  assert.deepEqual(copiesIn(WORK), []);
  for (const f of ['badcount', 'badedges', 'short', 'nocount', 'otherhash']) rmSync(path.join(PLANT, 'bench', 'verdicts', 'census-tiny-' + f + '.json'));
});

test('(e) the real tree\'s hash before equals after, and the hash sees a one byte change', () => {
  const beforeAll = treeHash(PLANT, ['.']);
  const r = run({ census: C.census });
  const afterAll = treeHash(PLANT, ['.']);
  assert.equal(r.decision, 'would apply');
  assert.equal(afterAll.hash, beforeAll.hash, 'the whole planted tree is byte for byte what it was');
  assert.equal(afterAll.files, beforeAll.files);
  assert.equal(r.real.same, true);
  assert.equal(r.real.before, r.real.after);
  // the control on the instrument: one byte written to the seed moves the hash
  const f = path.join(PLANT, 'organism', 'tiny', 'index.mjs');
  const text = readFileSync(f, 'utf8');
  writeFileSync(f, text + ' ');
  try { assert.notEqual(treeHash(PLANT, ['.']).hash, beforeAll.hash); } finally { writeFileSync(f, text); }
  assert.equal(treeHash(PLANT, ['.']).hash, beforeAll.hash);
  // a directory appearing under organism/ is a change the real-tree check sees
  const h0 = treeHash(PLANT, ['organism/tiny-pruned']).hash;
  mkdirSync(path.join(PLANT, 'organism', 'tiny-pruned'));
  writeFileSync(path.join(PLANT, 'organism', 'tiny-pruned', 'x'), 'x');
  try { assert.notEqual(treeHash(PLANT, ['organism/tiny-pruned']).hash, h0); } finally { rmSync(path.join(PLANT, 'organism', 'tiny-pruned'), { recursive: true, force: true }); }
});

test('(f) gateIncludes and copyTree carry what the authored code reads and nothing else a skip covers', () => {
  const root = path.join(TMP, 'inc');
  const put = (rel, text) => { const p = path.join(TMP, ...rel.split('/')); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, text); };
  put('inc/test/a.test.mjs', "const F = path.join(ROOT, 'bench', 'fixtures', 'x.json');\nconst G = 'bench/fixtures/sub/y.jsonl';\nconst H = 'bench/fixtures/missing.json';\n");
  put('inc/test/b.test.mjs', "// names nothing under the skipped roots\n");
  put('inc/lib/reader.mjs', "export const L = 'bench/fixtures/lib-only.json'; // a module a test calls, not the test\n");
  put('inc/bench/tool.mjs', "const P = path.join(HERE, 'fixtures', 'bare.json'); // segments from bench/ itself\n");
  put('inc/web/app.mjs', "const D = path.join(ROOT, 'web', 'dist', 'index.html');\n");
  put('inc/tasks/tape.mjs', "export const DB = path.resolve(HERE, '..', '..', 'sibling', 'data', 'tape.db');\n");
  for (const rel of ['x.json', 'sub/y.jsonl', 'lib-only.json', 'bare.json']) put('inc/bench/fixtures/' + rel, '{}\n');
  put('inc/bench/fixtures/SOURCES.md', 'x.json: CC0-1.0\n');
  put('inc/bench/fixtures/sub/SOURCES.md', 'y.jsonl: MIT\n');
  put('inc/bench/fixtures/other.bin', 'not named by any source');
  put('inc/web/dist/index.html', '<html></html>\n');
  put('inc/web/dist/unnamed.js', 'x');
  put('inc/organism/a/manifest.json', '{}');
  put('inc/organism/b/manifest.json', '{}');
  put('inc/state/big.json', '{}');
  put('sibling/data/tape.db', 'the tape');
  put('sibling/data/tape.db-wal', 'wal bytes');
  put('sibling/data/unnamed.db', 'not named');
  const g = gateIncludes(root);
  assert.deepEqual(g.include, ['bench/fixtures/SOURCES.md', 'bench/fixtures/bare.json', 'bench/fixtures/lib-only.json', 'bench/fixtures/sub/SOURCES.md', 'bench/fixtures/sub/y.jsonl', 'bench/fixtures/x.json', 'web/dist/index.html']);
  assert.deepEqual(g.namedBy, {
    'bench/fixtures/bare.json': ['bench/tool.mjs'], 'bench/fixtures/lib-only.json': ['lib/reader.mjs'],
    'bench/fixtures/sub/y.jsonl': ['test/a.test.mjs'], 'bench/fixtures/x.json': ['test/a.test.mjs'],
    'web/dist/index.html': ['web/app.mjs'], '../sibling/data/tape.db': ['tasks/tape.mjs'],
  });
  assert.deepEqual(g.outside, ['sibling/data/tape.db']);
  assert.deepEqual(g.tooBig, []);
  assert.deepEqual(gateIncludes(root, { maxMb: 0 }).tooBig, ['bench/fixtures/bare.json', 'bench/fixtures/lib-only.json', 'bench/fixtures/sub/y.jsonl', 'bench/fixtures/x.json', 'web/dist/index.html', '../sibling/data/tape.db']);
  // the copy: the included paths, the out-of-tree tape (and its -wal) COPIED into the trial's own box
  const box = path.join(TMP, 'incbox'), dest = path.join(box, 'brain');
  const tapeBefore = treeHash(TMP, ['sibling']).hash;
  const cp = copyTree(root, dest, { seed: 'organism/a', include: g.include, outside: g.outside });
  assert.deepEqual(cp.missing, []);
  assert.deepEqual(cp.outside, ['sibling/data/tape.db']);
  for (const rel of ['organism/a/manifest.json', 'lib/reader.mjs', 'bench/fixtures/x.json', 'bench/fixtures/sub/y.jsonl', 'bench/fixtures/bare.json', 'bench/fixtures/SOURCES.md', 'web/dist/index.html', '../sibling/data/tape.db', '../sibling/data/tape.db-wal']) assert.ok(existsSync(path.join(dest, rel)), rel + ' is carried');
  for (const rel of ['organism/b', 'state', 'bench/fixtures/other.bin', 'web/dist/unnamed.js', '../sibling/data/unnamed.db']) assert.ok(!existsSync(path.join(dest, rel)), rel + ' is left out');
  writeFileSync(path.join(box, 'sibling', 'data', 'tape.db'), 'written on the copy');
  assert.equal(readFileSync(path.join(TMP, 'sibling', 'data', 'tape.db'), 'utf8'), 'the tape', 'a write on the copy never reaches the original: it is a copy, not a link');
  assert.equal(treeHash(TMP, ['sibling']).hash, tapeBefore);
  // a copy whose parent is the real tree's parent would put the tape back on itself: refused
  assert.throws(() => copyTree(root, path.join(TMP, 'inc-sibling'), { seed: 'organism/a', outside: g.outside }), /does not land inside the trial directory/);
  for (const d of [box, path.join(TMP, 'inc-sibling'), root, path.join(TMP, 'sibling')]) rmSync(d, { recursive: true, force: true });
  // the diff helper: an unchanged text is no diff, a changed one applies back
  assert.equal(unifiedDiff('a\nb\n', 'a\nb\n', 'f'), null);
  const d = unifiedDiff('a\nb\nc\n', 'a\nB\nc\n', 'f');
  assert.equal(applyUnifiedPatch('a\nb\nc\n', d).text, 'a\nB\nc\n');
});

test('(g) pruneOnCopy refuses the tree it lives in, before any child starts', () => {
  assert.throws(() => pruneOnCopy(REAL_ROOT, 'organism/gen-0', 'organism/gen-0-pruned', 'bench/verdicts/census.json'), /prunes a copy only/);
  assert.throws(() => pruneOnCopy(PLANT, 'organism/tiny', 'organism/tiny', C.census), /the output directory is the seed itself/);
  assert.throws(() => pruneOnCopy(PLANT, 'organism/tiny', 'elsewhere/tiny-pruned', C.census), /not inside the copy's organism/);
});
