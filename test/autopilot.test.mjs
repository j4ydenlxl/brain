// test/autopilot.test.mjs: self-code with no human (self/autopilot.mjs), held to its walls.
//
//   1. the ceiling refuses MANUAL.md, manual/, docs/, self/, the gate, verdicts and every test
//      file, in any letter case, before anything is copied or run
//   2. no patch is refused and the verifier is never called
//   3. a verified patch with a green gate is KEPT, snapshotted, and ledgered with both hashes
//   4. a verified patch with a red gate is REVERTED byte for byte (BOM and CRLF survive)
//   5. a red tree keeps a patch only when the gate's own per-file breakdown shows it fixed a
//      red file and turned nothing red (runs the real bench/gate.mjs on a fixture)
//   6. --dry writes nothing; a live lock refuses a second run; a dead lock is taken over
//   7. a snapshot the gate never ruled on is restored by the next run
//   8. a file that moves during verification, and a patch that makes its test run fewer
//      tests, are refused
//   9. the CLI: brain self-code --auto [--dry] reaches all of it
//
// Board 10 (sources, the author, the record):
//  10. each source (gate, notes, imagine, census, slow, mutants) yields a candidate on a planted
//      tree (test/autopilot-plant.mjs), and every candidate carries its source
//  11. the OPEN: grammar and Open sections are read, never inside a code fence
//  12. state/self/authored.jsonl grows only on a KEPT patch: never on a revert, a refusal or --dry
//  13. a census prune is written by the autopilot and kept on "every test stays green"; a seed
//      whose manifest pins its hash is refused
//  14. an OPEN line reaches the author only while its test fails; a stale one never reaches it
//  15. a slow test is kept only when the patch keeps it green AND makes it 20 percent faster
//  16. the author is refused for a Claude or Anthropic model or endpoint before any socket opens;
//      a model answer is reduced to one applicable diff, never one aimed at the test
//  17. the share arithmetic of tools/authorship.mjs, per ISO week and cumulative
//  18. the CLI dry run on a planted tree prints candidates per source and writes nothing
//
// No test here asks a real model: the author is a function, and a fake one stands in for the
// model cell. bench/autopilot.mjs asks the real one.
//
// Every run is against a FIXTURE root, never the brain tree, so nothing here can write a
// source file of the brain.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, cpSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ROOT, verifyPatch, applyUnifiedPatch } from '../self/code.mjs';
import {
  allowTarget, splitCommand, gateDecision, runAutopilot, runGate, acquireLock, releaseLock,
  recoverOrphans, hashBytes, renderRun, LOCK_NAME,
  SOURCE_ORDER, AUTHORED_REL, collectCandidates, parseOpenLines, prunePatch, extractDiff, authorConfig,
  makeModelAuthor, normalizeImagined,
} from '../self/autopilot.mjs';
import { computeShare, isoWeek, main as authorshipMain } from '../tools/authorship.mjs';
import * as P from './autopilot-plant.mjs';

const TMP = mkdtempSync(path.join(tmpdir(), 'brain-autopilot-test-'));
test.after(() => { try { rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS will get it */ } });

function fixture(files) {
  const dir = mkdtempSync(path.join(TMP, 'fx-'));
  for (const [rel, text] of Object.entries(files)) {
    const f = path.join(dir, rel);
    mkdirSync(path.dirname(f), { recursive: true });
    writeFileSync(f, text);
  }
  return dir;
}
const HEAD = "import test from 'node:test';\nimport assert from 'node:assert/strict';\n";
const SUM_BUGGY = 'export function add(a, b) { return a - b; }\n';
const SUM_TEST = HEAD + "import { add } from '../lib/sum.mjs';\ntest('add adds', () => { assert.equal(add(2, 3), 5); });\n";
const PATCH_ADD = '--- a/lib/sum.mjs\n+++ b/lib/sum.mjs\n@@ -1 +1 @@\n-export function add(a, b) { return a - b; }\n+export function add(a, b) { return a + b; }\n';
const ADD = { key: 'fx:add', file: 'lib/sum.mjs', test: 'test/sum.test.mjs', patch: PATCH_ADD };
// BOM + CRLF: a revert through text could lose either; the revert here writes the bytes back
const SCALE = '\uFEFF' + ['export const FACTOR = 5;', 'export function scale(x) { return x * FACTOR; }', 'export function area(x) { return x * FACTOR; }', ''].join('\r\n');
const AREA_TEST = HEAD + "import { area } from '../lib/scale.mjs';\ntest('area of 2 is 10', () => { assert.equal(area(2), 10); });\n";
const SCALE_TEST = HEAD + "import { scale } from '../lib/scale.mjs';\ntest('scale of 2 is 20', () => { assert.equal(scale(2), 20); });\n";
const PATCH_TEN = '--- a/lib/scale.mjs\n+++ b/lib/scale.mjs\n@@ -1,2 +1,2 @@\n-\uFEFFexport const FACTOR = 5;\n+\uFEFFexport const FACTOR = 10;\n export function scale(x) { return x * FACTOR; }\n';
const TEN = { key: 'fx:ten', file: 'lib/scale.mjs', test: 'test/scale.test.mjs', patch: PATCH_TEN };
const GATE_ALL = 'node --test test/sum.test.mjs test/area.test.mjs test/scale.test.mjs';
const readLedger = (root) => {
  const dir = path.join(root, 'bench', 'verdicts', 'autopilot');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => readFileSync(path.join(dir, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)));
};
const spy = () => { const calls = []; const fn = (a) => { calls.push(a); return verifyPatch(a); }; fn.calls = calls; return fn; };

test('the ceiling refuses his text, docs, self, the gate, verdicts and tests in any case, before anything runs', () => {
  const root = fixture({
    'MANUAL.md': 'his\n', 'manual/a.md': 'his\n', 'docs/a.md': 'd\n', 'self/x.mjs': 'x\n', 'bench/gate.mjs': 'g\n',
    'bench/verdicts/v.json': '{}\n', 'bench/other.mjs': 'o\n', 'test/a.test.mjs': 't\n', 'lib/b.test.mjs': 't\n', 'lib/ok.mjs': 'ok\n', 'state/s.mjs': 's\n',
  });
  for (const f of ['MANUAL.md', 'manual.md', 'Manual/a.md', 'docs/a.md', 'DOCS/a.md', 'self/x.mjs', 'SELF/x.mjs', 'bench/gate.mjs', 'Bench/Gate.mjs',
    'bench/verdicts/v.json', 'test/a.test.mjs', 'TEST/a.test.mjs', 'lib/b.test.mjs', 'lib/B.TEST.MJS', 'state/s.mjs', '../x.mjs', 'C:/x.mjs', '/etc/x', 'lib/missing.mjs']) {
    const r = allowTarget(f, 'test/a.test.mjs', { root });
    assert.equal(r.ok, false, f + ' must be refused');
    assert.ok(r.reason, f + ' carries a reason');
  }
  assert.equal(allowTarget('lib/ok.mjs', 'test/a.test.mjs', { root }).ok, true);
  assert.equal(allowTarget('bench/other.mjs', 'test/a.test.mjs', { root }).ok, true, 'only the gate itself is walled off in bench/');
  assert.equal(allowTarget('lib/ok.mjs', 'LIB/ok.mjs', { root }).ok, false, 'a patch to the file that grades it is refused');

  const v = spy();
  const r = runAutopilot({ root, dry: true, verify: v, candidates: [
    { key: 'a', file: 'self/x.mjs', test: 'test/a.test.mjs', patch: '@@ -1 +1 @@\n-x\n+y\n' },
    { key: 'b', file: 'MANUAL.md', test: 'test/a.test.mjs', patch: '@@ -1 +1 @@\n-his\n+mine\n' },
    { key: 'c', file: 'lib/ok.mjs', test: 'test/a.test.mjs', patch: null },
  ] });
  assert.deepEqual(r.decisions.map((d) => [d.key, d.decision, d.wall]), [['a', 'refused', 'ceiling'], ['b', 'refused', 'ceiling'], ['c', 'refused', 'patch']]);
  assert.equal(v.calls.length, 0, 'nothing refused at a wall was ever verified');
  assert.equal(readFileSync(path.join(root, 'MANUAL.md'), 'utf8'), 'his\n');
});

test('splitCommand groups quotes and never needs a shell', () => {
  assert.deepEqual(splitCommand('node --test "a b.mjs" c'), ['node', '--test', 'a b.mjs', 'c']);
  assert.deepEqual(splitCommand('  node   bench/gate.mjs  '), ['node', 'bench/gate.mjs']);
  assert.deepEqual(splitCommand(''), []);
  assert.deepEqual(splitCommand('x ""'), ['x', '']);
});

test('gateDecision: green keeps, a regression reverts, a red tree keeps only a fix with no regression', () => {
  const g = (files, exit = Object.values(files).every(Boolean) ? 0 : 1, checks = { emDash: 0, badImports: 0 }) => ({ exit, files, checks, red: Object.keys(files).filter((f) => !files[f]) });
  assert.equal(gateDecision(null, { exit: 0 }).keep, true);
  assert.equal(gateDecision(null, { exit: 0 }).gate, 'GREEN');
  assert.equal(gateDecision(null, { exit: 1, files: null }).keep, false, 'red with no breakdown reverts');
  assert.equal(gateDecision(g({ a: true }), { exit: 1, files: null }).keep, false);
  assert.equal(gateDecision(g({ a: true }), { exit: null, timedOut: true }).gate, 'TIMEOUT');
  const reg = gateDecision(g({ a: true, b: true }), g({ a: true, b: false }));
  assert.deepEqual([reg.keep, reg.gate, reg.regressions], [false, 'RED', ['b']]);
  const fix = gateDecision(g({ a: false, b: false }), g({ a: true, b: false }));
  assert.deepEqual([fix.keep, fix.gate, fix.fixed], [true, 'RED-NO-REGRESSION', ['a']]);
  assert.equal(gateDecision(g({ a: false, b: true }), g({ a: true, b: false })).keep, false, 'a fix that breaks another reverts');
  assert.equal(gateDecision(g({ a: false }), g({ a: false })).keep, false, 'no fix, no keep');
  assert.equal(gateDecision(g({ a: false }), g({ a: true, n: false })).keep, false, 'a new failing file is a regression');
  assert.equal(gateDecision(g({ a: false, b: false }), g({ a: true, b: false }, 1, { emDash: 1, badImports: 0 })).keep, false, 'a new em-dash reverts');
});

test('a verified patch with a green gate is KEPT, snapshotted and ledgered with both hashes', () => {
  const root = fixture({ 'lib/sum.mjs': SUM_BUGGY, 'test/sum.test.mjs': SUM_TEST });
  const before = readFileSync(path.join(root, 'lib/sum.mjs'));
  const r = runAutopilot({ root, candidates: [ADD], gateCmd: 'node --test test/sum.test.mjs' });
  const d = r.decisions[0];
  assert.equal(d.decision, 'kept', d.reason);
  assert.equal(d.gate.verdict, 'GREEN');
  assert.equal(r.baseline.exit, 1, 'the gate was red before the patch');
  assert.equal(d.verification.failsBefore, true);
  assert.equal(d.verification.passesAfter, true);
  assert.equal(hashBytes(readFileSync(path.join(root, 'lib/sum.mjs'))), d.hashAfter);
  assert.equal(d.hashBefore, hashBytes(before));
  const snap = path.join(root, 'state', 'self-code', d.id);
  assert.ok(readFileSync(path.join(snap, 'before.bin')).equals(before), 'the snapshot holds the pre-patch bytes');
  const meta = JSON.parse(readFileSync(path.join(snap, 'meta.json'), 'utf8'));
  assert.deepEqual([meta.hashBefore, meta.hashAfter], [d.hashBefore, d.hashAfter]);
  assert.equal(JSON.parse(readFileSync(path.join(snap, 'outcome.json'), 'utf8')).decision, 'kept');
  const led = readLedger(root);
  assert.equal(led.length, 1);
  assert.deepEqual([led[0].decision, led[0].hashBefore, led[0].hashAfter], ['kept', d.hashBefore, d.hashAfter]);
  assert.equal(existsSync(path.join(root, 'state', 'self-code', LOCK_NAME)), false, 'the lock is released');
  assert.match(renderRun(r), /KEPT fx:add/);
});

test('a verified patch that breaks another test is REVERTED byte for byte (BOM and CRLF survive)', () => {
  const root = fixture({ 'lib/scale.mjs': SCALE, 'test/area.test.mjs': AREA_TEST, 'test/scale.test.mjs': SCALE_TEST, 'lib/sum.mjs': SUM_BUGGY.replace('-', '+'), 'test/sum.test.mjs': SUM_TEST });
  const before = readFileSync(path.join(root, 'lib/scale.mjs'));
  const r = runAutopilot({ root, candidates: [TEN], gateCmd: GATE_ALL });
  const d = r.decisions[0];
  assert.equal(d.verification.failsBefore, true, 'its own test failed before');
  assert.equal(d.verification.passesAfter, true, 'and passed after');
  assert.equal(d.decision, 'reverted', d.reason);
  assert.equal(d.gate.verdict, 'RED');
  assert.notEqual(d.hashAfter, d.hashBefore);
  assert.equal(d.hashRestored, d.hashBefore);
  const now = readFileSync(path.join(root, 'lib/scale.mjs'));
  assert.ok(now.equals(before), 'byte for byte');
  assert.equal(now[0], 0xef, 'the BOM is still there');
  assert.ok(now.includes('\r\n'), 'the CRLF is still there');
  const led = readLedger(root);
  assert.deepEqual([led[0].decision, led[0].hashBefore, led[0].hashAfter, led[0].hashRestored], ['reverted', d.hashBefore, d.hashAfter, d.hashBefore]);
  assert.equal(JSON.parse(readFileSync(path.join(root, 'state', 'self-code', d.id, 'outcome.json'), 'utf8')).decision, 'reverted');
});

test('the real gate program: a red tree keeps a fix with no regression, reverts one with a regression, and gate.json is restored', () => {
  const root = fixture({
    'lib/sum.mjs': SUM_BUGGY, 'test/sum.test.mjs': SUM_TEST,
    'lib/scale.mjs': SCALE, 'test/area.test.mjs': AREA_TEST, 'test/scale.test.mjs': SCALE_TEST,
  });
  cpSync(path.join(ROOT, 'bench', 'gate.mjs'), path.join(root, 'bench', 'gate.mjs'));
  const base = runGate({ root });
  assert.equal(base.exit, 1);
  assert.deepEqual(base.red.sort(), ['test/scale.test.mjs', 'test/sum.test.mjs']);
  const r = runAutopilot({ root, candidates: [TEN] });
  const [ten] = r.decisions;
  assert.equal(ten.decision, 'reverted', ten.reason);
  assert.deepEqual(ten.gate.regressions, ['test/area.test.mjs']);
  assert.equal(ten.gateJsonRestored, true);
  // read before any later gate run can rewrite it: it must be this run's baseline, the tree
  // as it now is, not the reverted patch and not absent
  const gjFile = path.join(root, 'bench', 'verdicts', 'gate.json');
  assert.ok(existsSync(gjFile), 'gate.json is restored, not deleted');
  const gj = JSON.parse(readFileSync(gjFile, 'utf8'));
  const exitOf = (f) => gj.tests.find((t) => t.file === f).exit;
  assert.deepEqual([exitOf('test/area.test.mjs') === 0, exitOf('test/scale.test.mjs') === 0, exitOf('test/sum.test.mjs') === 0], [true, false, false]);
  const r2 = runAutopilot({ root, candidates: [ADD] });
  const [add] = r2.decisions;
  assert.equal(add.decision, 'kept', add.reason);
  assert.equal(add.gate.verdict, 'RED-NO-REGRESSION');
  assert.deepEqual(add.gate.fixed, ['test/sum.test.mjs']);
});

test('--dry verifies and writes nothing: no snapshot, no ledger, no lock, the file unchanged', () => {
  const root = fixture({ 'lib/sum.mjs': SUM_BUGGY, 'test/sum.test.mjs': SUM_TEST });
  const r = runAutopilot({ root, dry: true, candidates: [ADD], gateCmd: 'node --test test/sum.test.mjs' });
  assert.equal(r.decisions[0].decision, 'would-apply');
  assert.equal(r.counts.wouldApply, 1);
  assert.equal(r.ledgerFile, null);
  assert.equal(readFileSync(path.join(root, 'lib/sum.mjs'), 'utf8'), SUM_BUGGY);
  assert.equal(existsSync(path.join(root, 'state')), false);
  assert.equal(existsSync(path.join(root, 'bench')), false);
});

test('a live lock refuses a second autopilot; a dead one is taken over', () => {
  const root = fixture({ 'lib/sum.mjs': SUM_BUGGY, 'test/sum.test.mjs': SUM_TEST });
  const dir = path.join(root, 'state', 'self-code');
  const held = acquireLock(dir);
  assert.equal(held.ok, true);
  const r = runAutopilot({ root, candidates: [ADD], gateCmd: 'node --test test/sum.test.mjs' });
  assert.equal(r.ok, false);
  assert.match(r.reason, /another autopilot/);
  assert.equal(readFileSync(path.join(root, 'lib/sum.mjs'), 'utf8'), SUM_BUGGY, 'refused before any write');
  releaseLock(held);
  const dead = spawnSync(process.execPath, ['-e', '0']).pid;
  writeFileSync(path.join(dir, LOCK_NAME), JSON.stringify({ pid: dead, at: 'then' }));
  const r2 = runAutopilot({ root, candidates: [ADD], gateCmd: 'node --test test/sum.test.mjs' });
  assert.equal(r2.ok, true, r2.reason);
  assert.equal(r2.lockTakenOver.pid, dead);
  assert.equal(r2.decisions[0].decision, 'kept');
});

test('a snapshot the gate never ruled on is restored by the next run', () => {
  const root = fixture({ 'lib/sum.mjs': SUM_BUGGY.replace('-', '+'), 'test/sum.test.mjs': SUM_TEST });
  const patched = readFileSync(path.join(root, 'lib/sum.mjs'));
  const original = Buffer.from(SUM_BUGGY);
  const snap = path.join(root, 'state', 'self-code', '20260101T000000000Z-deadbeef');
  mkdirSync(snap, { recursive: true });
  writeFileSync(path.join(snap, 'before.bin'), original);
  writeFileSync(path.join(snap, 'meta.json'), JSON.stringify({ key: 'crashed', file: 'lib/sum.mjs', hashBefore: hashBytes(original), hashAfter: hashBytes(patched) }));
  const dry = recoverOrphans({ root, dry: true });
  assert.equal(dry[0].decision, 'would-recover');
  assert.ok(readFileSync(path.join(root, 'lib/sum.mjs')).equals(patched), 'dry changed nothing');
  const r = runAutopilot({ root, candidates: [] });
  assert.equal(r.decisions[0].decision, 'recovered');
  assert.ok(readFileSync(path.join(root, 'lib/sum.mjs')).equals(original));
  assert.equal(JSON.parse(readFileSync(path.join(snap, 'outcome.json'), 'utf8')).decision, 'recovered');
  assert.equal(recoverOrphans({ root }).length, 0, 'recovered once, not twice');
});

test('a file that moves during verification, and a patch that makes its test run fewer tests, are refused', () => {
  const root = fixture({ 'lib/sum.mjs': SUM_BUGGY, 'test/sum.test.mjs': SUM_TEST });
  const moving = (a) => { const v = verifyPatch(a); writeFileSync(path.join(root, 'lib/sum.mjs'), SUM_BUGGY + '// moved\n'); return v; };
  const r = runAutopilot({ root, candidates: [ADD], verify: moving, gateCmd: 'node --test test/sum.test.mjs' });
  assert.deepEqual([r.decisions[0].decision, r.decisions[0].wall], ['refused', 'moved']);

  const root2 = fixture({
    'lib/f.mjs': 'export const v = 1;\nexport const skip = false;\n',
    'test/f.test.mjs': HEAD + "import * as m from '../lib/f.mjs';\ntest('v is 2', () => { assert.equal(m.v, 2); });\nif (!m.skip) test('never', () => { assert.ok(false); });\n",
  });
  const PATCH = '--- a/lib/f.mjs\n+++ b/lib/f.mjs\n@@ -1,2 +1,2 @@\n-export const v = 1;\n-export const skip = false;\n+export const v = 2;\n+export const skip = true;\n';
  const r2 = runAutopilot({ root: root2, candidates: [{ key: 'fx:skip', file: 'lib/f.mjs', test: 'test/f.test.mjs', patch: PATCH }], gateCmd: 'node --test test/f.test.mjs' });
  assert.equal(r2.decisions[0].decision, 'refused');
  assert.match(r2.decisions[0].reason, /fewer tests \(2 -> 1\)/);
  assert.equal(readFileSync(path.join(root2, 'lib/f.mjs'), 'utf8'), 'export const v = 1;\nexport const skip = false;\n');
});

test('the CLI: brain self-code --auto --dry and --auto reach the autopilot', () => {
  const root = fixture({ 'lib/sum.mjs': SUM_BUGGY, 'test/sum.test.mjs': SUM_TEST });
  const cand = path.join(root, '..', path.basename(root) + '-candidates.json');
  writeFileSync(cand, JSON.stringify([ADD]));
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v;
  const cli = (...args) => spawnSync(process.execPath, [path.join(ROOT, 'bin', 'brain.mjs'), 'self-code', ...args], { cwd: ROOT, encoding: 'utf8', timeout: 90_000, env });
  const common = ['--root', root, '--candidates', cand, '--gate-cmd', 'node --test test/sum.test.mjs'];
  const dry = cli('--auto', '--dry', '--json', ...common);
  assert.equal(dry.status, 0, dry.stderr);
  const dj = JSON.parse(dry.stdout);
  assert.deepEqual([dj.auto, dj.dry, dj.counts.wouldApply], [true, true, 1]);
  assert.equal(readFileSync(path.join(root, 'lib/sum.mjs'), 'utf8'), SUM_BUGGY);
  const live = cli('--auto', '--no-color', ...common);
  assert.equal(live.status, 0, live.stderr);
  assert.match(live.stdout, /KEPT fx:add/);
  assert.match(live.stdout, /gate GREEN/);
  assert.notEqual(readFileSync(path.join(root, 'lib/sum.mjs'), 'utf8'), SUM_BUGGY);
});

// ================================================================ Board 10: sources, the author, the record
const plant = (fn, name) => { const d = mkdtempSync(path.join(TMP, name + '-')); fn(d); return d; };
const authoredLines = (root) => {
  const f = path.join(root, ...AUTHORED_REL.split('/'));
  return existsSync(f) ? readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
};
const fakeAuthor = (patch, file, model = 'fake-open-weights') => {
  const calls = [];
  const fn = (c, ctx) => { calls.push({ key: c.key, mode: ctx.mode, failing: ctx.failing }); return { called: true, ok: true, patch, file, ms: 7, model }; };
  fn.calls = calls;
  return fn;
};
const HEX64 = /^[0-9a-f]{64}$/;

test('each source yields a candidate on a planted tree, and every candidate carries its source', () => {
  const root = plant(P.plantAllSources, 'all');
  const r = collectCandidates({ root, run: false });
  const by = {};
  for (const c of r.candidates) (by[c.source] ||= []).push(c);
  for (const s of SOURCE_ORDER) assert.ok((by[s] || []).length >= 1, s + ' yields a candidate');
  assert.ok(r.candidates.every((c) => SOURCE_ORDER.includes(c.source) && c.where), 'every candidate names its source and where it was read');
  assert.deepEqual(r.candidates.map((c) => c.source), [...r.candidates.map((c) => c.source)].sort((a, b) => SOURCE_ORDER.indexOf(a) - SOURCE_ORDER.indexOf(b)), 'candidates come in SOURCE_ORDER');
  assert.deepEqual(by.notes.map((c) => [c.grammar, c.file, c.test]), [['OPEN:', 'lib/mean.mjs', 'test/mean.test.mjs'], ['section', null, 'test/mean.test.mjs']]);
  assert.equal(by.imagine[0].patch, P.CLAMP_PATCH);
  assert.deepEqual([by.census[0].file, by.census[0].test, by.census[0].prune.lines, by.census[0].evidence], ['seed/gen-p/edges-000.mjs', 'test/net.test.mjs', P.SEED_DEAD_LINES, 'preserve']);
  assert.deepEqual([by.slow[0].test, by.slow[0].evidence], ['test/slow.test.mjs', 'faster']);
  assert.deepEqual([by.gate[0].test, by.gate[0].file, by.gate[0].evidence], ['test/mean.test.mjs', null, 'fix']);
  assert.equal(r.sources.census.deadEdges, 2);
  // a seed that moved since the census is not read against a stale bitset
  writeFileSync(path.join(root, 'seed/gen-p/edges-000.mjs'), P.SEED_EDGES.replace('}\n', 'e("q","r",1);\n}\n'));
  const moved = collectCandidates({ root, run: false, sources: ['census'] });
  assert.equal(moved.candidates.length, 0);
  assert.match(moved.sources.census.reason, /the seed moved since the census: 6 edge declarations on disk, 5 in the verdict/);
});

test('parseOpenLines reads the OPEN: grammar and the bullets of Open sections, never inside a fence', () => {
  const text = '# x\nOPEN: a b\n```\nOPEN: inside a fence\n```\n## Open questions\n- one\n  two\n- three\n## Done\n- not open\nOPEN:   \n';
  assert.deepEqual(parseOpenLines(text), [
    { line: 2, grammar: 'OPEN:', text: 'a b' },
    { line: 7, grammar: 'section', text: 'one two' },
    { line: 9, grammar: 'section', text: 'three' },
  ]);
});

test('authored.jsonl grows only on a KEPT patch: never on a revert, a refusal or a dry run', () => {
  const root = fixture({ 'lib/sum.mjs': SUM_BUGGY, 'test/sum.test.mjs': SUM_TEST, 'lib/scale.mjs': SCALE, 'test/area.test.mjs': AREA_TEST, 'test/scale.test.mjs': SCALE_TEST });
  runAutopilot({ root, dry: true, candidates: [ADD], gateCmd: 'node --test test/sum.test.mjs' });
  assert.equal(authoredLines(root).length, 0, 'a dry run appends nothing');
  const r1 = runAutopilot({ root, candidates: [TEN, { key: 'fx:none', file: 'lib/sum.mjs', test: 'test/sum.test.mjs', patch: null }], gateCmd: 'node --test test/area.test.mjs test/scale.test.mjs' });
  assert.deepEqual(r1.decisions.map((d) => d.decision), ['reverted', 'refused']);
  assert.equal(authoredLines(root).length, 0, 'a revert and a refusal append nothing');
  const r2 = runAutopilot({ root, candidates: [ADD], gateCmd: 'node --test test/sum.test.mjs' });
  assert.equal(r2.decisions[0].decision, 'kept');
  const lines = authoredLines(root);
  assert.equal(lines.length, 1, 'one kept patch, one line');
  const l = lines[0];
  assert.deepEqual([l.files, l.source, l.author, l.organism, l.key], [['lib/sum.mjs'], 'given', 'given', false, 'fx:add']);
  assert.ok(HEX64.test(l.gateHashBefore) && HEX64.test(l.gateHashAfter) && l.gateHashBefore !== l.gateHashAfter, 'the gate hash before and after');
  assert.ok(HEX64.test(l.hashBefore) && l.hashAfter === r2.decisions[0].hashAfter);
  assert.ok(Number.isFinite(Date.parse(l.at)));
  assert.equal(r2.authoredLines, 1);
});

test('a census prune is written by the autopilot itself and KEPT when every test stays green; a pinned seed is refused', () => {
  const root = fixture({ 'seed/gen-p/index.mjs': P.SEED_INDEX, 'seed/gen-p/edges-000.mjs': P.SEED_EDGES, 'lib/net.mjs': P.NET, 'test/net.test.mjs': P.NET_TEST, 'bench/verdicts/census.json': P.CENSUS });
  const pinned = fixture({ 'seed/gen-p/index.mjs': P.SEED_INDEX, 'seed/gen-p/edges-000.mjs': P.SEED_EDGES, 'seed/gen-p/manifest.json': '{"hash":"' + 'a'.repeat(64) + '"}\n', 'lib/net.mjs': P.NET, 'test/net.test.mjs': P.NET_TEST, 'bench/verdicts/census.json': P.CENSUS });
  const rp = runAutopilot({ root: pinned, sources: ['census'], gateCmd: 'node --test test/net.test.mjs' });
  assert.deepEqual([rp.decisions[0].decision, rp.decisions[0].wall], ['refused', 'patch']);
  assert.match(rp.decisions[0].reason, /genome\/emit\.mjs --prune/);
  assert.equal(readFileSync(path.join(pinned, 'seed/gen-p/edges-000.mjs'), 'utf8'), P.SEED_EDGES);

  const r = runAutopilot({ root, sources: ['census'], gateCmd: 'node --test test/net.test.mjs' });
  const d = r.decisions[0];
  assert.deepEqual([d.decision, d.source, d.author, d.evidence, d.gate.verdict], ['kept', 'census', 'deterministic:census-prune', 'preserve', 'GREEN']);
  assert.deepEqual([d.verification.passesBefore, d.verification.passesAfter], [true, true]);
  const after = readFileSync(path.join(root, 'seed/gen-p/edges-000.mjs'), 'utf8');
  assert.ok(!after.includes('e("x"') && !after.includes('e("y"') && after.includes('e("c","d",3);'), 'the dead declarations are gone, the live ones stay');
  const l = authoredLines(root);
  assert.deepEqual([l.length, l[0].source, l[0].organism, l[0].files[0]], [1, 'census', true, 'seed/gen-p/edges-000.mjs']);
  assert.equal(prunePatch('a\nb\n', [9], 'x'), null, 'a line outside the file is no prune');
});

test('an OPEN line goes to the author only while its test fails: authored, gated, KEPT; a stale one never reaches the model', () => {
  const root = fixture({ 'lib/mean.mjs': P.MEAN_BUGGY, 'test/mean.test.mjs': P.MEAN_TEST, 'notes/mean.md': P.MEAN_NOTE });
  const author = fakeAuthor(P.MEAN_PATCH, 'lib/mean.mjs');
  const r = runAutopilot({ root, sources: ['notes'], author, gateCmd: 'node --test test/mean.test.mjs' });
  assert.deepEqual(r.decisions.map((d) => [d.key, d.decision, d.wall ?? null]), [['notes:notes/mean.md:5', 'kept', null], ['notes:notes/mean.md:9', 'refused', 'stale']]);
  assert.equal(author.calls.length, 1, 'the model is asked once: the second OPEN line was stale by then');
  assert.equal(author.calls[0].mode, 'fix');
  assert.ok(author.calls[0].failing.length >= 1, 'the author is told the failing assertion');
  const k = r.decisions[0];
  assert.deepEqual([k.author, k.file, k.model.ms, k.gate.verdict], ['model:fake-open-weights', 'lib/mean.mjs', 7, 'GREEN']);
  const l = authoredLines(root);
  assert.deepEqual([l.length, l[0].source, l[0].organism, l[0].model, l[0].modelMs], [1, 'notes', true, 'fake-open-weights', 7]);
  assert.deepEqual(r.bySource.notes, { candidates: 2, proposed: 1, kept: 1, reverted: 0, refused: 1, wouldApply: 0, modelCalls: 1, modelProposed: 1, modelKept: 1, modelMs: [7] });
  assert.match(renderRun(r), /notes {4}candidates 2 {2}proposed 1 {2}kept 1 .*model: calls 1 proposed 1 kept 1 {2}ms per patch 7 ms/);

  const fixed = fixture({ 'lib/mean.mjs': P.MEAN_BUGGY.replace('let i = 1', 'let i = 0'), 'test/mean.test.mjs': P.MEAN_TEST, 'notes/mean.md': P.MEAN_NOTE });
  const idle = fakeAuthor(P.MEAN_PATCH, 'lib/mean.mjs');
  const r2 = runAutopilot({ root: fixed, sources: ['notes'], author: idle, gateCmd: 'node --test test/mean.test.mjs' });
  assert.deepEqual(r2.decisions.map((d) => d.wall), ['stale', 'stale']);
  assert.equal(idle.calls.length, 0, 'no model call for a test that already passes');
  assert.equal(authoredLines(fixed).length, 0);
  const off = runAutopilot({ root: fixed, dry: true, sources: ['notes'] });
  assert.match(off.decisions[0].reason, /patch author is off/);
});

test('several OPEN lines naming one test run it once per tree state, never once per line', () => {
  // the test file logs each run to runs.log; three stale OPEN lines on one test must log one run
  const COUNT_TEST = P.HEAD + "import { appendFileSync } from 'node:fs';\nappendFileSync(new URL('../runs.log', import.meta.url), 'run\\n');\ntest('passes', () => { assert.ok(true); });\n";
  const note = '# count\n\nOPEN: lib/c.mjs test/count.test.mjs one\nOPEN: lib/c.mjs test/count.test.mjs two\nOPEN: lib/c.mjs test/count.test.mjs three\n';
  const root = fixture({ 'lib/c.mjs': 'export const c = 1;\n', 'test/count.test.mjs': COUNT_TEST, 'notes/count.md': note });
  const idle = fakeAuthor(P.MEAN_PATCH, 'lib/c.mjs');
  const r = runAutopilot({ root, sources: ['notes'], author: idle, gateCmd: 'node --test test/count.test.mjs' });
  assert.deepEqual(r.decisions.map((d) => [d.key, d.wall]), [['notes:notes/count.md:3', 'stale'], ['notes:notes/count.md:4', 'stale'], ['notes:notes/count.md:5', 'stale']]);
  assert.equal(idle.calls.length, 0, 'no model call for a test that already passes');
  const runs = readFileSync(path.join(root, 'runs.log'), 'utf8').split('\n').filter(Boolean).length;
  assert.equal(runs, 1, 'test/count.test.mjs ran ' + runs + ' times for 3 OPEN lines on one unchanged tree');
});

test('a slow green test is KEPT only when the patch keeps it green AND makes it at least 20 percent faster', () => {
  const files = { 'lib/slow.mjs': P.SLOW_LIB, 'test/slow.test.mjs': P.SLOW_TEST, 'bench/verdicts/gate.json': P.gateJson([{ file: 'test/slow.test.mjs', pass: 1, fail: 0, total: 1, exit: 0, ms: 20_000 }]) };
  const root = fixture(files);
  const r = runAutopilot({ root, sources: ['slow'], author: fakeAuthor(P.SLOW_PATCH, 'lib/slow.mjs'), gateCmd: 'node --test test/slow.test.mjs' });
  const d = r.decisions[0];
  assert.deepEqual([d.decision, d.source, d.evidence, d.verification.mode], ['kept', 'slow', 'faster', 'faster']);
  assert.ok(d.verification.afterMs <= 0.8 * d.verification.beforeMs, d.verification.beforeMs + ' ms -> ' + d.verification.afterMs + ' ms');
  const same = fixture(files);
  const NOOP = '--- a/lib/slow.mjs\n+++ b/lib/slow.mjs\n@@ -1 +1 @@\n-export const DELAY = 1500;\n+export const DELAY = 1500 + 0;\n';
  const r2 = runAutopilot({ root: same, sources: ['slow'], author: fakeAuthor(NOOP, 'lib/slow.mjs'), gateCmd: 'node --test test/slow.test.mjs' });
  assert.deepEqual([r2.decisions[0].decision, r2.decisions[0].wall], ['refused', 'evidence']);
  assert.match(r2.decisions[0].reason, /not faster enough/);
  assert.equal(readFileSync(path.join(same, 'lib/slow.mjs'), 'utf8'), P.SLOW_LIB);
});

test('the patch author runs on open weights only: a Claude or Anthropic model or endpoint is refused before any socket opens', () => {
  for (const o of [{ model: 'claude-sonnet-4' }, { model: 'qwen3:30b-a3b', base: 'https://api.anthropic.com' }, { model: 'CLAUDE' }]) {
    const c = authorConfig(o);
    assert.equal(c.ok, false, JSON.stringify(o));
    assert.match(c.reason, /open weights only/);
  }
  const def = authorConfig({});
  assert.equal(def.model, process.env.BRAIN_AUTHOR_MODEL || 'qwen3:30b-a3b');
  assert.equal(def.provider, 'ollama');
  const fn = makeModelAuthor({ model: 'claude-x' });
  const a = fn({ key: 'k', test: 'test/sum.test.mjs' }, { root: fixture({ 'lib/sum.mjs': SUM_BUGGY, 'test/sum.test.mjs': SUM_TEST }) });
  assert.deepEqual([a.ok, a.ms, a.patch], [false, 0, null]);
  assert.equal(fn.config.ok, false);
  const src = readFileSync(path.join(ROOT, 'self', 'autopilot.mjs'), 'utf8');
  assert.doesNotMatch(src, /api\.anthropic\.com|@anthropic-ai|x-api-key/i, 'no closed endpoint is named in the autopilot');
});

test('extractDiff pulls one applicable diff out of a model answer, and never one aimed at the test', () => {
  const root = fixture({ 'lib/mean.mjs': P.MEAN_BUGGY, 'test/mean.test.mjs': P.MEAN_TEST });
  const opts = { root, targets: ['lib/mean.mjs'], test: 'test/mean.test.mjs' };
  const fenced = extractDiff('<think>the loop starts at 1</think>\nHere is the fix:\n```diff\n' + P.MEAN_PATCH + '```\nDone.', opts);
  assert.equal(fenced.file, 'lib/mean.mjs');
  const a = applyUnifiedPatch(P.MEAN_BUGGY, fenced.patch);
  assert.ok(a.ok && a.text.includes('let i = 0'), a.reason);
  const loose = extractDiff('--- lib/mean.mjs\n+++ lib/mean.mjs\n@@ @@\n-  for (let i = 1; i < xs.length; i++) s += xs[i];\n+  for (let i = 0; i < xs.length; i++) s += xs[i];\n', opts);
  const b = applyUnifiedPatch(P.MEAN_BUGGY, loose.patch);
  assert.ok(b.ok && b.text.includes('let i = 0'), 'a hunk header with no numbers is repaired and found by its content: ' + b.reason);
  const toTest = extractDiff('--- a/test/mean.test.mjs\n+++ b/test/mean.test.mjs\n@@ -1 +1 @@\n-x\n+y\n', opts);
  assert.equal(toTest.patch, null);
  assert.match(toTest.reason, /none of which the author was given/);
  assert.equal(extractDiff('I would change the loop.', opts).patch, null);
  const imagined = normalizeImagined({ type: 'patch', target: 'lib/mean.mjs', test: 'test/mean.test.mjs', key: 'k', anchor: '  let s = 0;', insert: '  // imagined' }, root);
  assert.ok(applyUnifiedPatch(P.MEAN_BUGGY, imagined.patch).text.includes('  let s = 0;\n  // imagined\n'), 'the anchor-insert shape of patchFor becomes a diff');
});

test('the share: organism kept patches over all kept patches plus files landed by boards, per ISO week and cumulative', () => {
  const authored = [
    { at: '2026-09-22T10:00:00Z', author: 'model:qwen3:30b-a3b', organism: true },
    { at: '2026-09-23T10:00:00Z', author: 'given', organism: false },
    { at: '2026-09-29T10:00:00Z', author: 'deterministic:census-prune', organism: true },
    { at: '2026-09-30T10:00:00Z', author: 'imagine', organism: true },
  ];
  const boards = [{ board: 8, at: '2026-09-23T21:38:00Z', files: ['a', 'b', 'b', 'c'] }, { board: 9, at: '2026-09-30T00:00:00Z', files: ['a', 'd'] }];
  const s = computeShare({ authored, boards });
  assert.deepEqual([s.numerator, s.denominator, s.organism, s.given, s.kept, s.boardFiles], [3, 9, 3, 1, 4, 5]);
  assert.equal(s.share, 3 / 9);
  assert.deepEqual(s.weeks.map((w) => [w.week, w.numerator, w.denominator, w.cumulative.numerator, w.cumulative.denominator]), [['2026-W39', 1, 5, 1, 5], ['2026-W40', 2, 4, 3, 9]]);
  const z = computeShare({});
  assert.deepEqual([z.numerator, z.denominator, z.share], [0, 0, null], 'nothing over nothing is n/a, never 0 and never NaN');
  assert.deepEqual(['2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z', '2024-12-30T00:00:00Z', 'nope'].map(isoWeek), ['2026-W01', '2026-W53', '2025-W01', null]);

  const root = fixture({ 'state/self/authored.jsonl': authored.map((l) => JSON.stringify(l)).join('\n') + '\nnot json\n', 'docs/BOARDS.json': JSON.stringify(boards) });
  const quiet = authorshipMain(['--root', root, '--no-write']);
  assert.equal(quiet.out, null);
  assert.equal(existsSync(path.join(root, 'bench/verdicts/authorship.json')), false);
  const r = authorshipMain(['--root', root]);
  assert.match(r.text, /numerator 3 organism-authored kept patches, denominator 9 \(4 kept patches \+ 5 board files\) = 3\/9 = 0\.3333/);
  assert.match(r.text, /1 unreadable lines/);
  const v = JSON.parse(readFileSync(path.join(root, 'bench/verdicts/authorship.json'), 'utf8'));
  assert.deepEqual([v.isTheBar, v.numerator, v.denominator, typeof v.statement, typeof v.command, typeof v.node], [true, 3, 9, 'string', 'string', 'string']);
  assert.ok(Number.isFinite(Date.parse(v.at)));
});

test('the CLI dry run on a planted tree prints candidates per source and writes nothing', () => {
  const root = plant(P.plantAllSources, 'cli-all');
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v;
  const r = spawnSync(process.execPath, ['--max-old-space-size=1024', path.join(ROOT, 'bin', 'brain.mjs'), 'self-code', '--auto', '--dry', '--json', '--root', root], { cwd: ROOT, encoding: 'utf8', timeout: 90_000, env });
  assert.equal(r.status, 0, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.equal(j.author.on, false, 'the model author is off in a dry run');
  assert.deepEqual(Object.keys(j.bySource).sort(), [...SOURCE_ORDER].sort());
  assert.deepEqual([j.bySource.imagine.wouldApply, j.bySource.census.wouldApply, j.bySource.notes.refused, j.bySource.mutants.refused], [1, 1, 2, 1]);
  assert.equal(existsSync(path.join(root, 'state')), false, 'no snapshot, no lock, no authored line');
  assert.equal(readFileSync(path.join(root, 'lib/clamp.mjs'), 'utf8'), P.CLAMP_BUGGY);
});
