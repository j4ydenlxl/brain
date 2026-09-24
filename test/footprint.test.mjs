// test/footprint.test.mjs: the 12 majors row of bench/footprint.mjs actually measures what
// it claims to.
//   (a) importing bench/footprint.mjs for its POCKET_* constants runs neither the sweep nor
//       a child row (no side effects on import)
//   (b) the declared pocket budgets are exported as plain numbers, not measurements
//   (c) `node bench/footprint.mjs --child-row --majors 12` builds, ticks, checkpoints and
//       restores the 12 majors row and prints exactly one JSON line with every measured
//       figure as a numeric leaf
//   (d) the checkpoint file and the state/footprint-<label> scratch dir are gone once the
//       child exits (cleaned up on the happy path)
//   (e) a killed-by-timeout child row is reported honestly, not silently dropped
//   (f) no em dashes in the new files
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BENCH = path.join(ROOT, 'bench', 'footprint.mjs');

test('(a) importing bench/footprint.mjs has no side effects', async () => {
  const before = existsSync(path.join(ROOT, 'bench', 'verdicts', 'footprint.json'))
    ? readFileSync(path.join(ROOT, 'bench', 'verdicts', 'footprint.json'), 'utf8') : null;
  const mod = await import('../bench/footprint.mjs');
  assert.ok(mod.POCKET_RSS_MB, 'the module namespace carries POCKET_RSS_MB');
  for (const label of ['12', '100', '1000']) {
    assert.ok(!existsSync(path.join(ROOT, 'state', 'footprint-' + label)), 'import alone must not build state/footprint-' + label);
  }
  const after = existsSync(path.join(ROOT, 'bench', 'verdicts', 'footprint.json'))
    ? readFileSync(path.join(ROOT, 'bench', 'verdicts', 'footprint.json'), 'utf8') : null;
  assert.equal(before, after, 'import alone must not rewrite bench/verdicts/footprint.json');
});

test('(b) the declared pocket budgets are plain numbers, not measurements', async () => {
  const { POCKET_RSS_MB, POCKET_CHECKPOINT_MB, POCKET_TICKS_PER_SEC, POCKET_BUDGETS } = await import('../bench/footprint.mjs');
  for (const v of [POCKET_RSS_MB, POCKET_CHECKPOINT_MB, POCKET_TICKS_PER_SEC]) assert.equal(typeof v, 'number');
  for (const key of ['rssMB', 'checkpointMB', 'ticksPerSec']) {
    assert.equal(POCKET_BUDGETS[key].declared, true, key + ' must be marked declared');
    assert.equal(typeof POCKET_BUDGETS[key].value, 'number');
  }
});

test('(c) the 12 majors row builds, ticks, checkpoints and restores, printing one numeric-leaf JSON line', () => {
  const label = 'test12-' + process.pid;
  const dir = path.join(ROOT, 'state', 'footprint-' + label);
  try {
    const res = spawnSync(process.execPath, [BENCH, '--child-row', '--majors', '12', '--units', '256', '--ticks', '200', '--label', label], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
    assert.equal(res.status, 0, 'child row exits 0: stderr ' + (res.stderr || '').slice(-1000));
    const lines = res.stdout.trim().split('\n').filter(Boolean);
    assert.equal(lines.length, 1, 'exactly one line of stdout');
    const row = JSON.parse(lines[0]);
    assert.equal(row.ok, true);
    assert.equal(row.majors, 12);
    assert.equal(row.substrateUnits, 256);
    assert.equal(row.ticks, 200);
    for (const key of ['buildMs', 'tickMs', 'ticksPerSec', 'checkpointBytes', 'checkpointMB', 'restoreMs', 'rowMs']) {
      assert.equal(typeof row[key], 'number', key + ' must be a numeric leaf');
      assert.ok(Number.isFinite(row[key]), key + ' must be finite');
    }
    for (const key of ['rssBefore', 'rssBuilt', 'rssAfter', 'heapBuilt', 'heapAfter', 'arrayBuffersBuilt', 'arrayBuffersAfter']) {
      assert.equal(typeof row.memoryMB[key], 'number', 'memoryMB.' + key + ' must be a numeric leaf');
    }
    assert.ok(row.checkpointBytes > 0, 'the checkpoint actually wrote bytes');
    assert.ok(row.ticksPerSec > 0, 'the brain actually ticked');
    assert.ok(row.buildMs > 0 && row.restoreMs >= 0);
    for (const key of ['rssMB', 'checkpointMB', 'ticksPerSec']) assert.equal(typeof row.fitsPocketBudget[key], 'boolean');
  } finally {
    assert.ok(!existsSync(dir), 'the row must remove its own state/footprint-' + label + ' scratch dir');
  }
});

test('(d) a killed-by-timeout row is reported, not silently dropped', () => {
  // a 1 ms timeout cannot possibly let a whole-brain build finish: spawnSync must report the
  // timeout rather than this test hanging or a caller mistaking silence for success
  const label = 'timeouttest-' + process.pid;
  const dir = path.join(ROOT, 'state', 'footprint-' + label);
  try {
    const res = spawnSync(process.execPath, [BENCH, '--child-row', '--majors', '1000', '--units', '256', '--ticks', '200', '--label', label], { cwd: ROOT, encoding: 'utf8', timeout: 1 });
    assert.notEqual(res.status, 0, 'a 1 ms budget cannot let the child finish and print status 0');
    assert.equal(res.error && res.error.code, 'ETIMEDOUT', 'spawnSync must report the timeout, not a plain non-zero exit');
  } finally {
    rmSync(dir, { recursive: true, force: true }); // defensive: a killed child may not have reached its own cleanup
  }
});

test('(e) no em dashes in the new files', () => {
  for (const f of ['bench/footprint.mjs', 'test/footprint.test.mjs', 'notes/footprint.md']) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    assert.ok(!readFileSync(p, 'utf8').includes(String.fromCharCode(0x2014)), f + ' has no em dash');
  }
});
