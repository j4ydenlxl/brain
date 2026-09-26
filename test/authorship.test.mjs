// test/authorship.test.mjs: the denominator of the authored share (tools/authorship.mjs and
// docs/BOARDS.json, Board 14, item schedule). The share arithmetic itself is tested in
// test/autopilot.test.mjs (17); this file tests what the denominator is made of.
//
//   1. the real docs/BOARDS.json parses, names boards 8 to 12 launched and 13 not, and every file
//      it lists exists in the tree or in a checkpoint commit its entry names; each derived entry
//      re-derives to the same files and the same "at" from its commits and docs/LOG.md (read only)
//   2. zonedToUtc and landedFromLog: a LANDED line is read in the log's zone (EDT and EST), with
//      its run id, and a LAUNCHED line is not a landing
//   3. boardsLandedInSubject: ranges, one board among others, never a "not landed"
//   4. fillBoards derives a board whose LANDED line and commit exist, carries its skipped items,
//      and leaves the others with their reason; the CLI --fill writes nothing without
//      --write-boards
//   5. the plain run prints a stale entry (launched false, LOG says LANDED) as a gap, and the
//      verdict carries it
//   6. the real tree, read only: the share prints over launched boards 8 to 12, per board, per
//      week and the days since the last board
//
// No test writes the real tree: the real files are read, the planted trees live under the temp
// directory and are deleted after, and git is only ever asked to show or log.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  main, deriveBoard, itemsFromBoardSource, landedFromLog, zonedToUtc, boardsLandedInSubject,
  checkpointCommitsFor, fillBoards, staleBoards, upsertBoard, readBoards, LOG_ZONE,
} from '../tools/authorship.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOW = new Date('2026-09-24T18:00:00.000Z');

const planted = [];
function plant(files = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'authorship-'));
  planted.push(dir);
  for (const [rel, body] of Object.entries(files)) {
    const f = path.join(dir, ...rel.split('/'));
    mkdirSync(path.dirname(f), { recursive: true });
    writeFileSync(f, body);
  }
  return dir;
}
test.after(() => { for (const d of planted) rmSync(d, { recursive: true, force: true }); });

/** The files a commit carries, or null when this tree has no git to ask (a trial copy). */
const commitFiles = new Map();
function filesOf(sha) {
  if (commitFiles.has(sha)) return commitFiles.get(sha);
  const r = spawnSync('git', ['-C', ROOT, 'show', '--name-only', '--format=', '--no-renames', sha], { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  const files = r.status === 0 ? new Set(r.stdout.split('\n').map((l) => l.trim()).filter(Boolean)) : null;
  commitFiles.set(sha, files);
  return files;
}
const HAS_GIT = existsSync(path.join(ROOT, '.git'));

test('1. docs/BOARDS.json: boards 8 to 12 launched, 13 not, every file in the tree or in a named commit, derived entries re-derive', (t) => {
  const boards = JSON.parse(readFileSync(path.join(ROOT, 'docs', 'BOARDS.json'), 'utf8'));
  assert.ok(Array.isArray(boards));
  const nums = boards.map((b) => b.board);
  assert.deepEqual(nums, [...nums].sort((a, b) => a - b), 'sorted by board');
  for (const n of [8, 9, 10, 11, 12]) {
    const b = boards.find((x) => x.board === n);
    assert.ok(b && b.launched !== false && b.files.length > 0, 'board ' + n + ' is launched with files');
    assert.ok(Number.isFinite(Date.parse(b.at)), 'board ' + n + ' has a landing time');
    assert.ok(Array.isArray(b.commits) && b.commits.length > 0, 'board ' + n + ' names its checkpoint commits');
  }
  const b13 = boards.find((x) => x.board === 13);
  assert.ok(b13, 'board 13 has an entry');
  if (b13.launched === false) assert.deepEqual(b13.files, [], 'a board not yet launched lists no files');

  let checked = 0, fromTree = 0, fromCommit = 0;
  const unverifiable = [];
  // bench/fixtures/ and state/ are never committed (docs/CLOUD-SESSION.md: "never state/, never bench/fixtures/"),
  // so a fixture or a runtime file a board lists can only be checked on the machine that holds it; on a fresh
  // clone it is counted here, not asserted. Found by the $250 cloud session's gate on 2026-09-26 (board 9 lists
  // bench/fixtures/wiki/SOURCES.md, board 14 lists state/self/gaps.jsonl).
  const neverCommitted = [];
  for (const b of boards) {
    for (const f of b.files) {
      checked++;
      if (existsSync(path.join(ROOT, ...f.split('/')))) { fromTree++; continue; }
      if (f.startsWith('bench/fixtures/') || f.startsWith('state/')) { neverCommitted.push('board ' + b.board + ': ' + f); continue; }
      const sets = (b.commits || []).map(filesOf);
      if (sets.some((s) => s === null) || !HAS_GIT) { unverifiable.push('board ' + b.board + ': ' + f); continue; }
      const inCommit = sets.some((s) => s.has(f) || (f.endsWith('/') && [...s].some((x) => x.startsWith(f))));
      assert.ok(inCommit, 'board ' + b.board + ' lists ' + f + ', which is neither in the tree nor in its commits ' + (b.commits || []).join(', '));
      fromCommit++;
    }
  }
  t.diagnostic(checked + ' files: ' + fromTree + ' in the tree, ' + fromCommit + ' only in a named commit, ' + neverCommitted.length + ' under bench/fixtures/ (never committed, not checked here), ' + unverifiable.length + ' unverifiable here');
  if (HAS_GIT) {
    // the commit path, whether or not any listed file needed it today: it finds what a commit
    // carries and misses what it does not
    const b10 = boards.find((x) => x.board === 10);
    const s = filesOf(b10.commits[0]);
    assert.ok(s && s.has(b10.files[0]), 'control: the commit lookup finds ' + b10.files[0] + ' in ' + b10.commits[0]);
    assert.equal(s.has('no/such/file.mjs'), false, 'control: and misses a path the commit does not carry');
  }
  if (HAS_GIT) assert.deepEqual(unverifiable, [], 'with git present every file is checked');
  else if (unverifiable.length) t.diagnostic('no .git in this tree (a trial copy): ' + unverifiable.length + ' files absent from it could not be looked up in their commits');

  // the derived entries: the items are the board source's, and the files and "at" re-derive
  for (const b of boards.filter((x) => typeof x.source === 'string' && x.launched !== false)) {
    const src = path.join(ROOT, ...b.source.split('/'));
    if (!existsSync(src)) continue;
    assert.deepEqual(b.items, itemsFromBoardSource(readFileSync(src, 'utf8')).map((i) => i.key), 'board ' + b.board + ' lists its source\'s items');
    if (!HAS_GIT || b.commits.map(filesOf).some((s) => s === null)) continue;
    const again = deriveBoard({ root: ROOT, board: b.board, commits: b.commits, runId: b.runId, skip: b.skipped || [] });
    assert.deepEqual(again.files, b.files, 'board ' + b.board + ' re-derives to the same files');
    if (/^docs\/LOG\.md:/.test(b.atSource || '') && existsSync(path.join(ROOT, 'docs', 'LOG.md'))) assert.equal(again.at, b.at, 'board ' + b.board + ' re-derives to the same landing time');
  }
});

test('2. zonedToUtc and landedFromLog: the LANDED line in the log zone, its run id, and a LAUNCHED line is no landing', () => {
  assert.equal(LOG_ZONE, 'America/New_York');
  assert.equal(zonedToUtc(2026, 9, 24, 4, 12), '2026-09-24T08:12:00Z', 'EDT is 4 hours behind UTC');
  assert.equal(zonedToUtc(2026, 12, 1, 10, 0), '2026-12-01T15:00:00Z', 'EST is 5 hours behind UTC');
  assert.equal(zonedToUtc(2026, 9, 24, 0, 5), '2026-09-24T04:05:00Z', 'midnight hour');
  assert.equal(zonedToUtc(2026, 9, 24, 4, 12, 'UTC'), '2026-09-24T04:12:00Z');
  assert.equal(zonedToUtc(2026, 9, 24, 4, 12, 'Not/AZone'), null);

  const root = plant({
    'docs/LOG.md': [
      '# log', '',
      '- 2026-09-18 10:20 BOARD 21 LAUNCHED (wf_aaaa1111-bbb, at 2026-09-18 10:20 EDT): three builders',
      '- 2026-09-24 04:12 BOARD 21 LANDED (wf_4bda6fd7-0fd, 22 agents): kept',
      '- 2026-09-24 12:20 BOARD 22 SELF LANDED (wf_c7dc2042-7ce; multiply verified)',
      '- 2026-12-01 10:00 BOARD 23 LANDED (no run id here)',
      '- 2026-12-02 10:00 BOARD 21 LANDED again, a later line quoting it',
      '',
    ].join('\n'),
  });
  const l21 = landedFromLog(root, 21);
  assert.deepEqual([l21.at, l21.runId, l21.lineNo, l21.source, l21.local], ['2026-09-24T08:12:00Z', 'wf_4bda6fd7-0fd', 4, 'docs/LOG.md:4', '2026-09-24 04:12 America/New_York']);
  assert.deepEqual([landedFromLog(root, 22).at, landedFromLog(root, 22).runId], ['2026-09-24T16:20:00Z', 'wf_c7dc2042-7ce']);
  assert.deepEqual([landedFromLog(root, 23).at, landedFromLog(root, 23).runId], ['2026-12-01T15:00:00Z', null]);
  assert.equal(landedFromLog(root, 24), null, 'no line, no landing');
  assert.equal(landedFromLog(plant({}), 21), null, 'no log, no landing');
});

test('3. boardsLandedInSubject: a range, one board among others, never a "not landed"', () => {
  assert.deepEqual(boardsLandedInSubject('Boards 8 to 11 landed; gate GREEN 78/78 test files'), [8, 9, 10, 11]);
  assert.deepEqual(boardsLandedInSubject('Checkpoint 09:40: Board 11 landed, Board 12 running, Board 13 authored'), [11]);
  assert.deepEqual(boardsLandedInSubject('checkpoint: Board 12 landed, the chain paused on his order, Board 14 AUTONOMY authored'), [12]);
  assert.deepEqual(boardsLandedInSubject('BOARD 12 SELF LANDED'), [12]);
  assert.deepEqual(boardsLandedInSubject('Board 13 not landed yet'), []);
  assert.deepEqual(boardsLandedInSubject('board 14: his 14:25 order (magnitude bar)'), []);
  const log = ['cccccccc\tcheckpoint: Board 12 landed', 'bbbbbbbb\tCheckpoint 09:40: Board 11 landed, Board 12 running', 'aaaaaaaa\tBoards 8 to 11 landed', 'not a row'].join('\n');
  assert.deepEqual(checkpointCommitsFor('/nowhere', 11, { logFn: () => log }), ['aaaaaaaa', 'bbbbbbbb'], 'oldest first');
  assert.deepEqual(checkpointCommitsFor('/nowhere', 12, { logFn: () => log }), ['cccccccc']);
  assert.deepEqual(checkpointCommitsFor('/nowhere', 13, { logFn: () => log }), []);
});

const SOURCE = [
  'const ITEMS = [',
  "  { key: 'alpha', owns: 'lib/alpha.mjs (new), test/alpha.test.mjs (new), notes/alpha.md' },",
  "  { key: 'beta', owns: 'lib/beta.mjs (new); read only: lib/alpha.mjs' },",
  ']',
  '',
].join('\n');

test('4. fillBoards derives a landed board from its LOG line and commit, carries its skips, and leaves the rest with a reason', () => {
  const root = plant({
    'docs/boards/board-30.js': SOURCE, 'docs/boards/board-31.js': SOURCE, 'docs/boards/board-32.js': SOURCE, 'docs/boards/board-33.js': SOURCE,
    'docs/LOG.md': '- 2026-09-25 06:30 BOARD 30 LANDED (wf_30303030-aaa, 3 agents)\n- 2026-09-25 07:00 BOARD 32 LANDED (wf_32323232-bbb)\n- 2026-09-25 08:00 BOARD 33 LANDED\n',
  });
  const boards = [
    { board: 30, at: null, launched: false, skipped: ['beta'], files: [] },
    { board: 33, at: '2026-09-25T12:00:00Z', launched: true, files: ['lib/alpha.mjs'] },
  ];
  const log = ['2222222222\tcheckpoint: Board 30 landed, Board 32 running', '1111111111\tBoards 29 to 30 landed'].join('\n');
  const carried = { 1111111111: ['lib/alpha.mjs', 'lib/beta.mjs', 'README.md'], 2222222222: ['test/alpha.test.mjs', 'notes/alpha.md'] };
  const readCommitFn = (_root, sha) => ({ sha, at: '2026-09-25T11:00:00Z', subject: 's' + sha.slice(0, 2), root: false, files: carried[sha] });
  const rows = fillBoards({ root, boards, readCommitFn, logFn: () => log });
  assert.deepEqual(rows.map((r) => [r.board, r.action]), [[30, 'derive'], [31, 'none'], [32, 'none']], 'a launched entry (33) is left alone');
  const e = rows[0].entry;
  assert.deepEqual(e.commits, ['1111111111', '2222222222']);
  assert.deepEqual(e.files, ['lib/alpha.mjs', 'notes/alpha.md', 'test/alpha.test.mjs'], 'beta was skipped, so lib/beta.mjs is not counted');
  assert.deepEqual(e.skipped, ['beta']);
  assert.equal(e.at, '2026-09-25T10:30:00Z', 'at is the LANDED line, not the commit date');
  assert.match(e.atSource, /^docs\/LOG\.md:1 \(2026-09-25 06:30 America\/New_York\)$/);
  assert.equal(e.runId, 'wf_30303030-aaa', 'the run id comes from the LANDED line when the entry had none');
  assert.deepEqual(e.commitsAt, ['2026-09-25T11:00:00Z', '2026-09-25T11:00:00Z']);
  assert.match(rows[1].why, /it has no entry and docs\/LOG\.md has no "BOARD 31 \.\.\. LANDED" line: not landed yet/);
  assert.match(rows[2].why, /LANDED at docs\/LOG\.md:2, and no commit subject says board 32 landed: the checkpoint is not committed yet/);

  // the write, then nothing left to fill for 30
  const file = path.join(root, 'docs', 'BOARDS.json');
  writeFileSync(file, JSON.stringify(boards));
  const arr = upsertBoard(file, e);
  assert.deepEqual(arr.map((b) => [b.board, b.launched]), [[30, true], [33, true]]);
  const again = fillBoards({ root, boards: readBoards(file).boards, readCommitFn, logFn: () => log });
  assert.deepEqual(again.map((r) => r.board), [31, 32]);

  // with --at given, the LOG line does not override it
  const given = deriveBoard({ root, board: 30, commits: ['1111111111'], at: '2026-01-01T00:00:00Z', readCommitFn });
  assert.deepEqual([given.at, given.atSource], ['2026-01-01T00:00:00Z', 'given (--at)']);
  // no LANDED line: the latest commit date, and it says so
  const noLog = deriveBoard({ root, board: 31, commits: ['1111111111'], readCommitFn });
  assert.equal(noLog.at, '2026-09-25T11:00:00Z');
  assert.match(noLog.atSource, /latest checkpoint commit/);

  // the CLI on a planted tree: prints, and writes nothing without --write-boards
  const before = readFileSync(file, 'utf8');
  const cli = main(['--root', root, '--fill'], NOW);
  assert.match(cli.text, /^fill: docs\/BOARDS\.json holds 2 entries; board sources with no entry or launched false: 2/);
  assert.equal(readFileSync(file, 'utf8'), before);
});

test('5. the plain run prints a stale entry (launched false while the LOG says LANDED) as a gap', () => {
  const boards = [
    { board: 8, at: '2026-09-23T21:40:00Z', files: ['a.mjs', 'b.mjs'] },
    { board: 13, at: null, launched: false, files: [] },
  ];
  const root = plant({ 'docs/BOARDS.json': JSON.stringify(boards), 'docs/LOG.md': '- 2026-09-25 09:00 BOARD 13 LANDED (wf_13131313-ccc)\n', 'docs/boards/board-13.js': SOURCE, 'docs/boards/board-14.js': SOURCE });
  assert.deepEqual(staleBoards(root, boards).map((s) => [s.board, s.landed.source]), [[13, 'docs/LOG.md:1']]);
  const r = main(['--root', root, '--no-write'], NOW);
  assert.equal(r.out, null);
  assert.match(r.text, /STALE: board 13 says launched false and docs\/LOG\.md:1 says it LANDED: node tools\/authorship\.mjs --fill --write-boards/);
  assert.match(r.text, /NOT IN THE DENOMINATOR: board 14 \(docs\/boards\/board-14\.js\) has a source and no entry/);
  assert.match(r.text, /board 13 NOT LAUNCHED \(authored, counts nothing\)/);
  assert.match(r.text, /denominator 2 \(0 kept patches \+ 2 board files\) = 0\/2 = 0\.0000/);
  assert.deepEqual(r.verdict.staleBoards, [{ board: 13, landed: 'docs/LOG.md:1', at: '2026-09-25T13:00:00Z' }]);
  assert.match(r.verdict.statement, /Entries that say launched false while docs\/LOG\.md says the board LANDED: 13 \(docs\/LOG\.md:1\)/);
  assert.equal(existsSync(path.join(root, 'bench')), false, '--no-write writes nothing');
});

test('6. the real tree, read only: the share over launched boards 8 to 12, per board, per week, days since the last board', () => {
  const r = main(['--no-write'], new Date()) // the real tree needs the real clock: a fixed NOW older than the newest board printed a negative day count;
  assert.equal(r.out, null);
  const launched = r.verdict.boards.filter((b) => b.launched !== false).map((b) => b.board);
  for (const n of [8, 9, 10, 11, 12]) {
    assert.ok(launched.includes(n), 'board ' + n + ' is in the denominator');
    assert.match(r.text, new RegExp('\\n    board ' + n + ' at \\S+ \\(\\d{4}-W\\d{2}\\): \\d+ files'));
  }
  const v = r.verdict;
  assert.equal(v.denominator, v.kept + v.boardFiles);
  assert.equal(v.boardFiles, v.boards.reduce((s, b) => s + b.files, 0));
  assert.match(r.text, /\n  week \d{4}-W\d{2}  organism \d+  kept \d+  board files \d+  share /);
  assert.match(r.text, /\n  days since the last board: \d+\.\d{2} \(board \d+ at /);
  const share = r.text.split('\n').find((l) => l.startsWith('SHARE (cumulative): '));
  assert.ok(share && share.includes('denominator ' + v.denominator + ' ('), share);
});
