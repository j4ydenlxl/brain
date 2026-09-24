// test/gate.test.mjs: the three rows bench/gate.mjs added on Board 10 (BUDGET, COMPRESS, HIS
// DATA), graded on hand written inputs whose right answer is known before the code runs.
//
//   (a) HIS DATA on a temp fixture tree: a file named on a SOURCES.md line with a licence is
//       covered, a line with no licence covers nothing, "same licence" inherits the licence the
//       SOURCES.md names elsewhere, a directory line covers the files under it, notice files are
//       not data, and a line about humaneval/HumanEval.jsonl does NOT cover humaneval-js.jsonl
//       (the prefix trap the first census fell into). Then the missing lines are written and
//       the row turns GREEN with "bytes of his data 0".
//   (b) COMPRESS: red only when bytes per score point rose while the score did not.
//   (c) BUDGET from rows: green only when every file exited under the budget.
//   (d) BUDGET live: one passing test file under tools/budget.mjs exits with its RSS and the
//       bytes it left in its own TEMP measured; a planted child that allocates past the RAM cap
//       is killed by the budget, and the row goes RED naming it.
//   (e) importing bench/gate.mjs runs no gate: a fresh process that imports it exits at once
//       and prints nothing, where a gate would print its free RAM line and run for minutes.
//   (f) bench/gate.mjs copied alone into a tree (as test/autopilot.test.mjs does) still runs
//       every test file, unbudgeted, writes gate.json with each exit, and its BUDGET row is red.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { fixtureCoverage, hisDataRow, mentionsFile, mentionsDir, compressRow, budgetRow, runTestFile, GATE_CAPS } = await import('../bench/gate.mjs');

function tmp() { return mkdtempSync(path.join(tmpdir(), 'gate-test-')); }
function put(root, rel, text) {
  const p = path.join(root, ...rel.split('/'));
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text);
  return Buffer.byteLength(text);
}

test('(a) HIS DATA: covered, uncovered, same licence, directories, notices and the prefix trap', () => {
  const root = tmp();
  try {
    put(root, 'public/SOURCES.md', [
      '# sources',
      '| humaneval/HumanEval.jsonl | openai/human-eval | MIT |',
      '| gsm8k/ | openai/grade-school-math | Apache 2.0 |',
      '| loose.json | somewhere on the web | no licence named |',
      '| wiki/ | the same licence as the dump above |',
    ].join('\n'));
    const b = {
      he: put(root, 'public/humaneval/HumanEval.jsonl', 'x'.repeat(10)),
      js: put(root, 'public/humaneval/humaneval-js.jsonl', 'y'.repeat(20)),
      gsm: put(root, 'public/gsm8k/test.jsonl', 'z'.repeat(30)),
      loose: put(root, 'public/loose.json', 'w'.repeat(40)),
      wiki: put(root, 'public/wiki/page.txt', 'v'.repeat(50)),
      lic: put(root, 'public/LICENSE', 'licence text'),
      top: put(root, 'answer-questions.json', '{}'),
    };
    const cov = fixtureCoverage(root);
    const by = Object.fromEntries(cov.list.map((x) => [x.file, x]));
    assert.equal(by['public/humaneval/HumanEval.jsonl'].by.licence, 'MIT');
    assert.equal(by['public/humaneval/humaneval-js.jsonl'].covered, false, 'a line about HumanEval.jsonl is not a line about humaneval-js.jsonl');
    assert.equal(by['public/gsm8k/test.jsonl'].by.licence, 'Apache 2.0');
    assert.equal(by['public/gsm8k/test.jsonl'].by.named, 'gsm8k');
    assert.equal(by['public/loose.json'].covered, false, 'named, but no licence on its line');
    assert.equal(by['public/wiki/page.txt'].by.licence, 'MIT', 'same licence inherits the first licence the file names');
    assert.equal(by['public/wiki/page.txt'].by.inherited, true);
    assert.equal(by['answer-questions.json'].covered, false, 'no SOURCES.md above it');
    assert.deepEqual(cov.notice.map((n) => n.file).sort(), ['public/LICENSE', 'public/SOURCES.md']);
    assert.equal(cov.files, 6);
    assert.equal(cov.covered, 3);
    assert.equal(cov.uncoveredBytes, b.js + b.loose + b.top);
    assert.deepEqual(cov.byLicence, { MIT: 2, 'Apache 2.0': 1 });

    const red = hisDataRow(cov, 'fixtures');
    assert.equal(red.ok, false);
    assert.match(red.line, /^HIS DATA RED: 3 of 6 data files under fixtures/);
    assert.match(red.line, /uncovered 3 files, 62 bytes/);
    assert.match(red.line, /cannot be ruled 0/);

    // write the missing lines: every file now has a licence on a line that names it
    put(root, 'public/SOURCES.md', [
      '| humaneval/HumanEval.jsonl | openai/human-eval | MIT |',
      '| humaneval/humaneval-js.jsonl | MultiPL-E | BSD 3-Clause |',
      '| gsm8k/ | openai/grade-school-math | Apache 2.0 |',
      '| loose.json | written in this tree | CC0-1.0 |',
      '| wiki/ | the same licence as above |',
    ].join('\n'));
    put(root, 'SOURCES.md', '| answer-questions.json | authored in this tree | CC0-1.0 |\n');
    const green = hisDataRow(fixtureCoverage(root), 'fixtures');
    assert.equal(green.ok, true);
    assert.match(green.line, /^HIS DATA GREEN: 6 of 6 data files/);
    assert.match(green.line, /bytes of his data 0$/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('(a) a file or directory is named only when it stands alone', () => {
  assert.equal(mentionsFile('| humaneval/HumanEval.jsonl | MIT |', 'humaneval/HumanEval.jsonl'), true);
  assert.equal(mentionsFile('| humaneval/HumanEval.jsonl.bak | MIT |', 'humaneval/HumanEval.jsonl'), false);
  assert.equal(mentionsDir('| humaneval/HumanEval.jsonl | MIT |', 'humaneval'), false);
  assert.equal(mentionsDir('`humaneval/` MIT', 'humaneval'), true);
  assert.equal(mentionsDir('| humaneval | MIT |', 'humaneval'), true);
  assert.equal(mentionsDir('| my-humaneval | MIT |', 'humaneval'), false);
});

test('(b) COMPRESS is red only when bytes per point rose and the score did not', () => {
  const rec = (at, bpp, score) => ({ at, where: 'w' + at, score, of: 30, bytes: bpp * score, bytesPerScorePoint: bpp });
  assert.equal(compressRow([]).ok, true);
  assert.match(compressRow([]).line, /no checkpoint header/);
  assert.equal(compressRow([rec(1, 100, 30)]).ok, true);
  const roseHeld = compressRow([rec(1, 100, 30), rec(2, 150, 30)]);
  assert.equal(roseHeld.ok, false);
  assert.match(roseHeld.line, /^COMPRESS RED: .*rose 50 percent, score held: the checkpoint grew per point while the score did not$/);
  assert.equal(compressRow([rec(1, 100, 20), rec(2, 150, 30)]).ok, true, 'rose, but the score rose with it');
  assert.equal(compressRow([rec(1, 100, 30), rec(2, 150, 25)]).ok, false, 'rose while the score fell');
  const fell = compressRow([rec(1, 100, 30), rec(2, 40, 30)]);
  assert.equal(fell.ok, true);
  assert.match(fell.line, /fell 60 percent, score held$/);
  assert.match(compressRow([rec(1, 100, 30), rec(2, 100, 30)]).line, /: held, score held$/);
  assert.equal(compressRow([rec(1, 100, 30), rec(2, 150, 30), rec(3, 90, 30)]).ok, true, 'only the newest against the one before it');
});

test('(c) BUDGET from rows: any kill, refusal or error is red, and an empty run is red', () => {
  const row = (file, outcome, extra = {}) => ({ file, budget: { outcome, killed: null, error: null, peakRssMb: 10, peakDirBytes: 0, leftBytes: 0, ...extra } });
  const green = budgetRow([row('a', 'exit', { peakRssMb: 50, peakDirBytes: 7 }), row('b', 'exit', { peakRssMb: 80, leftBytes: 3 })]);
  assert.equal(green.ok, true);
  assert.deepEqual(green.peakRss, { mb: 80, file: 'b' });
  assert.deepEqual(green.peakDir, { bytes: 7, file: 'a' });
  assert.deepEqual(green.left, { bytes: 3, files: ['b'] });
  assert.match(green.line, /^BUDGET GREEN: 2 of 2 test files ran under tools\/budget\.mjs/);
  const killed = budgetRow([row('a', 'exit'), row('b', 'killed', { killed: 'ram' })]);
  assert.equal(killed.ok, false);
  assert.match(killed.line, /1 killed, refused or aborted \(b killed ram\)/);
  const refused = budgetRow([row('a', 'refused')]);
  assert.equal(refused.ok, false);
  assert.deepEqual(refused.notRun, ['a']);
  assert.equal(budgetRow([{ file: 'x' }]).ok, false, 'a row with no budget record did not run under the budget');
  assert.equal(budgetRow([]).ok, false, 'no test files is not a green budget');
});

test('(d) BUDGET live: a test file exits under the caps, and a planted child past the RAM cap is killed', { timeout: 110_000 }, async () => {
  const dir = tmp();
  try {
    // leaves 1000 bytes in its own TEMP, which the gate measures before removing the directory,
    // and lives 2.5 s so a sample catches its tree (a file gone before any sample has no RSS)
    const ok = path.join(dir, 'ok.test.mjs');
    writeFileSync(ok, [
      "import { test } from 'node:test';",
      "import { writeFileSync } from 'node:fs';",
      "import { tmpdir } from 'node:os';",
      "import path from 'node:path';",
      "test('one', async () => { writeFileSync(path.join(tmpdir(), 'left.bin'), Buffer.alloc(1000, 1)); await new Promise((r) => setTimeout(r, 2500)); });",
    ].join('\n'));
    // allocates and touches 1200 MB, then waits: past a 300 MB cap it must be killed, never exit
    const hog = path.join(dir, 'hog.test.mjs');
    writeFileSync(hog, [
      "import { test } from 'node:test';",
      "test('hog', async () => {",
      "  const keep = [];",
      "  for (let i = 0; i < 24; i++) keep.push(Buffer.alloc(50 * 1024 * 1024, i + 1));",
      "  await new Promise((r) => setTimeout(r, 60_000));",
      "  keep.length = 0;",
      "});",
    ].join('\n'));
    const caps = { ...GATE_CAPS, ramMb: 300, heapMb: 2000, intervalMs: 250, timeoutMs: 90_000, waitFreeRamMb: 1024, waitMaxS: 60 };

    const a = await runTestFile(ok, { root: dir, caps });
    console.log('(d) ok:', JSON.stringify(a.row));
    assert.equal(a.row.exit, 0);
    assert.equal(a.row.pass, 1);
    assert.equal(a.row.budget.outcome, 'exit');
    assert.ok(a.row.budget.maxProcs > 0, 'a sample caught the tree alive (the file lives 2.5 s)');
    assert.ok(a.row.budget.peakRssMb > 0, 'so its RSS was measured');
    assert.equal(a.row.budget.leftBytes, 1000, 'the child TEMP was the watched directory');

    const t0 = Date.now();
    const h = await runTestFile(hog, { root: dir, caps });
    console.log('(d) hog:', JSON.stringify(h.row), 'in', Date.now() - t0, 'ms');
    assert.equal(h.row.budget.outcome, 'killed');
    assert.equal(h.row.budget.killed, 'ram');
    assert.notEqual(h.row.exit, 0);
    assert.ok(h.row.budget.peakRssMb >= caps.ramMb, 'killed at or past the cap it was held to');
    assert.ok(Date.now() - t0 < 60_000, 'killed, not waited out');

    const row = budgetRow([a.row, h.row], caps);
    console.log('(d) ' + row.line);
    assert.equal(row.ok, false);
    assert.match(row.line, /^BUDGET RED: 2 of 2 test files ran under tools\/budget\.mjs .* 1 killed, refused or aborted \(hog\.test\.mjs killed ram\)/);
    assert.match(row.line, /RSS sampled on 2 of 2 files/);
    const unsampled = budgetRow([{ ...a.row, budget: { ...a.row.budget, maxProcs: 0, peakRssMb: 0 } }], caps);
    assert.equal(unsampled.ok, true, 'an unsampled file that exited is not a kill');
    assert.match(unsampled.line, /RSS sampled on 0 of 1 files/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(e) importing bench/gate.mjs runs no gate', () => {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', "const g = await import('./bench/gate.mjs'); console.log('exports ' + Object.keys(g).length);"], { cwd: ROOT, encoding: 'utf8', timeout: 30_000 });
  console.log('(e) ' + JSON.stringify({ status: r.status, stdout: r.stdout.trim(), ms: Date.now() - t0 }));
  assert.equal(r.status, 0);
  assert.match(r.stdout.trim(), /^exports \d+$/, 'the import printed only what the probe printed');
  assert.equal(r.stdout.includes('gate:'), false);
});

test('(f) bench/gate.mjs copied ALONE into a tree still runs every test file and writes gate.json', { timeout: 110_000 }, () => {
  // test/autopilot.test.mjs grades the real gate this way: a fixture tree with no tools/ and no
  // core/. Without tools/budget.mjs each file runs unbudgeted and the BUDGET row is red and says so.
  const root = tmp();
  try {
    mkdirSync(path.join(root, 'bench'), { recursive: true });
    writeFileSync(path.join(root, 'bench', 'gate.mjs'), readFileSync(path.join(ROOT, 'bench', 'gate.mjs')));
    put(root, 'test/ok.test.mjs', "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\ntest('ok', () => assert.equal(1 + 1, 2));\n");
    put(root, 'test/bad.test.mjs', "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\ntest('bad', () => assert.equal(1 + 1, 3));\n");
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT'));
    const t0 = Date.now();
    const r = spawnSync(process.execPath, ['--max-old-space-size=2000', 'bench/gate.mjs'], { cwd: root, env, encoding: 'utf8', timeout: 100_000 });
    const out = (r.stdout || '') + (r.stderr || '');
    const budgetLine = out.split('\n').find((l) => l.startsWith('BUDGET ')) || '';
    console.log('(f) ' + JSON.stringify({ status: r.status, ms: Date.now() - t0, budgetLine: budgetLine.slice(0, 160) }));
    assert.equal(r.status, 1, 'a failing file makes the gate red');
    const gj = JSON.parse(readFileSync(path.join(root, 'bench', 'verdicts', 'gate.json'), 'utf8'));
    // the start is recorded beside the end, so a reader can tell what a run could have seen
    assert.ok(Date.parse(gj.startedAt) <= Date.parse(gj.at), 'startedAt ' + gj.startedAt + ' is not at or before at ' + gj.at);
    const exitOf = (f) => gj.tests.find((t) => t.file === f).exit;
    assert.equal(exitOf('test/ok.test.mjs'), 0);
    assert.notEqual(exitOf('test/bad.test.mjs'), 0);
    assert.ok(budgetLine.startsWith('BUDGET RED: 0 of 2 test files ran under tools/budget.mjs'), budgetLine);
    assert.ok(budgetLine.includes('2 ran with no budget at all (tools/budget.mjs could not be loaded'), budgetLine);
    assert.ok(out.includes('rss unsampled'), 'an unbudgeted file has no RSS, not 0 MB');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
