// test/autopilot-flake.test.mjs: the parse and the pass rule of bench/autopilot-flake.mjs (board 26,
// item autopilot-flake), on every kind of run the runner can see: all green, a failing case inside a
// suite, a run killed before its tally, a cancelled case, a count that moved between runs; and the
// temp count (verify plane, 2026-09-27): an entry a NEIGHBOUR process makes in the shared temp dir
// during a run is not charged to the test file, while every entry the file leaves is.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseTap, runPassed, parseArgs, oneRun, commandLine, carryForward } from '../bench/autopilot-flake.mjs';

const NL = String.fromCharCode(10);
const GREEN = ['TAP version 13', '# Subtest: a', 'ok 1 - a', '  ---', '  duration_ms: 1.5', "  type: 'test'", '  ...', '1..1',
  '# tests 1', '# suites 0', '# pass 1', '# fail 0', '# cancelled 0', '# skipped 0', '# todo 0', '# duration_ms 12.5'].join(NL);
const RED = ['TAP version 13', '# Subtest: top', 'ok 1 - top', '  ---', '  duration_ms: 1', '  ...',
  '# Subtest: the suite', '    # Subtest: slow case', '    not ok 1 - slow case', '      ---', '      duration_ms: 3.9',
  "      failureType: 'testCodeFailure'", '      error: |-', '        evidence: not faster enough: 1593 ms before, 1586 ms after', "      code: 'ERR_ASSERTION'", '      ...',
  '    # Subtest: fine case', '    ok 2 - fine case', '      ---', '      duration_ms: 2', '      ...', '    1..2',
  'not ok 2 - the suite', '  ---', "  failureType: 'subtestsFailed'", '  ...', '1..2',
  '# tests 3', '# suites 1', '# pass 2', '# fail 1', '# cancelled 0', '# skipped 0', '# todo 0', '# duration_ms 7680.5'].join(NL);

test('parseTap: a green run has its tally and no failure', () => {
  const p = parseTap(GREEN);
  assert.deepEqual(p.tally, { tests: 1, suites: 0, pass: 1, fail: 0, cancelled: 0, skipped: 0, todo: 0, duration_ms: 12.5 });
  assert.deepEqual(p.failures, []);
  assert.equal(runPassed({ exit: 0, tally: p.tally }, 1), true);
});

test('parseTap: a failing case inside a suite is named by its suite path with its diagnostic; the suite itself is marked subtestsFailed', () => {
  const p = parseTap(RED);
  assert.equal(p.tally.fail, 1);
  assert.equal(p.failures.length, 2);
  const [leaf, suite] = p.failures;
  assert.equal(leaf.path, 'the suite > slow case');
  assert.equal(leaf.depth, 1);
  assert.equal(leaf.failureType, 'testCodeFailure');
  assert.match(leaf.diagnostic, /1593 ms before, 1586 ms after/);
  assert.deepEqual([suite.path, suite.failureType], ['the suite', 'subtestsFailed']);
  assert.equal(runPassed({ exit: 1, tally: p.tally }, 3), false);
});

test('runPassed: each way a run can miss is a miss, and only the clean run passes', () => {
  const t = { tests: 35, pass: 35, fail: 0, cancelled: 0 };
  assert.equal(runPassed({ exit: 0, tally: t }, 35), true, 'the clean run');
  assert.equal(runPassed({ exit: 1, tally: t }, 35), false, 'a nonzero exit with a clean tally');
  assert.equal(runPassed({ exit: null, tally: {} }, 35), false, 'killed before any tally');
  assert.equal(runPassed({ exit: 0, tally: { ...t, cancelled: 1, pass: 34 } }, 35), false, 'a cancelled case');
  assert.equal(runPassed({ exit: 0, tally: { ...t, tests: 34, pass: 34 } }, 35), false, 'a test count that moved');
  assert.equal(runPassed({ exit: 0, tally: { tests: 0, pass: 0, fail: 0, cancelled: 0 } }, null), false, 'no test ran');
});

test('parseArgs: the defaults, every flag, and an unknown flag refused', () => {
  assert.deepEqual(parseArgs([]), { n: 10, file: 'test/autopilot.test.mjs', tmp: null, logDir: null, timeoutMs: 300000, label: null, write: true });
  const o = parseArgs(['--n', '3', '--file', 'test/x.test.mjs', '--tmp', 'T', '--log-dir', 'L', '--timeout-ms', '5', '--label', 'after-fix', '--no-write']);
  assert.deepEqual(o, { n: 3, file: 'test/x.test.mjs', tmp: 'T', logDir: 'L', timeoutMs: 5, label: 'after-fix', write: false });
  assert.throws(() => parseArgs(['--bogus']), /unknown option --bogus/);
  assert.throws(() => parseArgs(['--n', '0']), /positive integer/);
});

// A fake test file: its first case leaves what it is told to in ITS OWN temp dir (os.tmpdir() in the
// child), its second stands for another process on the machine that makes a brain-autopilot- entry in
// the SHARED temp dir while the run is going (the path is written into the file, not taken from TEMP).
function fakeFile(dir, { leave, neighbour }) {
  const f = path.join(dir, 'fake-' + Math.random().toString(36).slice(2, 8) + '.test.mjs');
  writeFileSync(f, [
    "import test from 'node:test';",
    "import { mkdirSync, writeFileSync } from 'node:fs';",
    "import os from 'node:os';",
    "import path from 'node:path';",
    'const LEAVE = ' + JSON.stringify(leave) + ';',
    "test('leaves what it is told to in its own temp dir', () => { for (const n of LEAVE) { if (n.endsWith('.txt')) writeFileSync(path.join(os.tmpdir(), n), 'x'); else mkdirSync(path.join(os.tmpdir(), n)); } });",
    "test('a neighbour writes into the shared temp dir', () => { " + (neighbour ? 'mkdirSync(path.join(' + JSON.stringify(dir) + ', ' + JSON.stringify(neighbour) + '));' : '') + ' });',
  ].join(NL) + NL);
  return f;
}
const OLD_LEAK_RE = /^(brain-autopilot-test-|brain-autopilot-|brain-soak-|brain-operators-|brain-census-)/;

test('oneRun: a neighbour entry in the shared temp dir is not charged to the file (the old shared-dir diff charged it); every entry the file leaves is, whatever its name', () => {
  const shared = mkdtempSync(path.join(os.tmpdir(), 'afk-shared-'));
  try {
    const f = fakeFile(shared, { leave: ['brain-autopilot-left', 'stray.txt'], neighbour: 'brain-autopilot-neighbour' });
    const pre = readdirSync(shared).filter((n) => OLD_LEAK_RE.test(n));
    const r = oneRun({ file: f, tmp: shared, timeoutMs: 60000 }, 1);
    assert.equal(runPassed(r, 2), true, 'the fake file ran green: ' + JSON.stringify(r.tally));
    const oldCount = readdirSync(shared).filter((n) => OLD_LEAK_RE.test(n) && !pre.includes(n));
    assert.deepEqual(oldCount, ['brain-autopilot-neighbour'], 'the control: the shared-dir diff sees the neighbour and charges it');
    assert.equal(r.leftInTmp, 2);
    assert.deepEqual(r.leftNames, ['brain-autopilot-left', 'stray.txt'], 'a name outside the old pattern is counted too');
    assert.equal(r.tmpRemoved, true);
    assert.deepEqual(readdirSync(shared).filter((n) => n.startsWith('afk-')), [], 'the run own temp dir is removed after it is counted');
  } finally { rmSync(shared, { recursive: true, force: true }); }
});

test('oneRun: a file that leaves nothing reads 0 even while a neighbour writes into the shared temp dir', () => {
  const shared = mkdtempSync(path.join(os.tmpdir(), 'afk-shared-'));
  try {
    const f = fakeFile(shared, { leave: [], neighbour: 'brain-census-neighbour' });
    const r = oneRun({ file: f, tmp: shared, timeoutMs: 60000 }, 1);
    assert.equal(runPassed(r, 2), true, 'the fake file ran green: ' + JSON.stringify(r.tally));
    assert.equal(readdirSync(shared).includes('brain-census-neighbour'), true, 'the neighbour did write during the run');
    assert.equal(r.leftInTmp, 0);
    assert.deepEqual(r.leftNames, []);
    assert.equal(r.tmpRemoved, true);
  } finally { rmSync(shared, { recursive: true, force: true }); }
});

test('commandLine: an absolute --tmp or --log-dir is recorded by placeholder, never as a machine path; a relative one as typed', () => {
  const base = 'node bench/autopilot-flake.mjs';
  assert.equal(commandLine(['--n', '10', '--log-dir', path.join(os.tmpdir(), 'logs4'), '--label', 'after-fix']), base + ' --n 10 --log-dir <log-dir> --label after-fix');
  assert.equal(commandLine(['--tmp', 'C:/Users/x/T', '--n', '3']), base + ' --tmp <tmp> --n 3');
  assert.equal(commandLine(['--tmp', '/c/Users/x']), base + ' --tmp <tmp>');
  assert.equal(commandLine(['--tmp', 'rel/t']), base + ' --tmp rel/t');
  assert.equal(commandLine([]), base);
  assert.doesNotMatch(commandLine(['--log-dir', os.tmpdir()]), /Users|Temp/);
});

test('carryForward: the control is the newest miss, carried whole on every kind of previous file, and a machine path in its command is not carried', () => {
  const abs = path.join(os.tmpdir(), 'scratch', 'logs2');
  const miss = { at: 'A', label: 'before-fix', barMet: false, line: '6 of 10', command: 'node bench/autopilot-flake.mjs --n 10 --log-dir ' + abs + ' --label before-fix', runs: [{ run: 1 }] };
  const base = 'node bench/autopilot-flake.mjs --n 10 --log-dir <log-dir> --label before-fix';
  assert.deepEqual(carryForward(null), { control: null, replaced: null }, 'no previous file');
  const one = carryForward(miss);
  assert.equal(one.control.command, base, 'the previous file missed: it is the control');
  assert.deepEqual(one.control.runs, [{ run: 1 }]);
  assert.deepEqual(one.replaced, { at: 'A', label: 'before-fix', barMet: false, line: '6 of 10' });
  const met = { at: 'B', label: 'after-fix', barMet: true, line: '10 of 10', command: 'node bench/autopilot-flake.mjs --n 10', control: { ...miss }, replaced: { at: 'A' } };
  const two = carryForward(met);
  assert.equal(two.control.command, base, 'a met file carries its control forward, redacted');
  assert.equal(two.control.at, 'A');
  assert.equal('control' in two.control || 'replaced' in two.control, false, 'never nests');
  const old = { at: 'C', barMet: true, line: '10 of 10', replaced: { ...miss } };
  assert.equal(carryForward(old).control.command, base, 'an older file with the miss under replaced');
  assert.equal(carryForward({ at: 'D', barMet: true, line: 'x' }).control, null, 'a met file with no control carries none');
  assert.doesNotMatch(JSON.stringify(carryForward(met)), /Users|Temp|scratch/);
});
