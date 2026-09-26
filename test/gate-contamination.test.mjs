// test/gate-contamination.test.mjs: the CONTAMINATION row of bench/gate.mjs (Board 13).
//
// The rule it grades: every bar file (a bench/verdicts/*.json with isTheBar true) carries a split
// object naming what was development and what was held out, and a contaminated one says so in its
// statement. Each claim has a control:
//   (a) planted verdicts: a split object on every bar file is GREEN, and a file that is not a bar
//       (isTheBar false, or no isTheBar) is never graded, split or not.
//   (b) each RED cause alone: no split, a string split, a contaminated file whose statement does
//       not say so (marked at the top level and marked deep inside the split); the same files
//       fixed are GREEN again, so the row turns on the defect and nothing else.
//   (c) a labelled contamination is counted and is not a cause; an unread file is counted as
//       unread, never as clean; an empty directory grades nothing and says so; a missing one too.
//   (d) the referee: a live autopilot lock prints the row in full and it does not rule.
//   (e) the real tree: the row's counts against an independent census written here, and a real
//       no-split bar file copied into a temp directory is named, then passes once it has a split.
//   (f) the CLI and the gate: node bench/gate.mjs --contamination prints the in-process line with
//       the exit the row rules, and bench/gate.mjs copied alone into a fixture tree prints the
//       CONTAMINATION line, puts it in the GATE line and keeps the row in gate.json.
// No model is called and no socket is opened.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { contaminationRecords, contaminationRow, splitShapeOf, refereeOf, CONTAMINATION_WORD } from '../bench/gate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
function tmp() { return mkdtempSync(path.join(tmpdir(), 'gate-contam-')); }
function put(dir, name, obj) { mkdirSync(dir, { recursive: true }); writeFileSync(path.join(dir, name), typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)); }
const SPLIT = { development: 'the planted development records', heldOut: 'the planted held-out records' };
const rowOf = (dir, opts) => contaminationRow(contaminationRecords(dir), opts);
const envNoTest = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT'));

test('(a) a split object on every bar file is GREEN, and a file that is not a bar is never graded', () => {
  const dir = tmp();
  try {
    put(dir, 'a.json', { at: 'x', isTheBar: true, split: SPLIT, statement: 'A bar.' });
    put(dir, 'b.json', { at: 'x', isTheBar: true, split: { ...SPLIT, contaminated: false }, statement: 'Another bar.' });
    put(dir, 'c-partial.json', { at: 'x', isTheBar: false, statement: 'A partial run with no split.' });
    put(dir, 'd.json', { at: 'x', statement: 'No isTheBar field at all.' });
    put(dir, 'e.json', '[1, 2, 3]');
    put(dir, 'notes.txt', 'not a verdict');
    const r = rowOf(dir);
    assert.equal(r.ok, true, r.line);
    assert.equal(r.rules, true);
    assert.deepEqual(r.counts, { files: 5, unread: 0, bar: 2, withSplit: 2, noSplit: 0, splitNotObject: 0, contaminated: 0, labelled: 0, unlabelled: 0 });
    assert.equal(r.line, 'CONTAMINATION GREEN: bar files (isTheBar true) 2 of 5 verdict files, with a split object 2, contaminated and labelled 0, contaminated and unlabelled 0, with no split 0, split not an object 0');
    assert.deepEqual(r.causes, []);
    assert.equal(splitShapeOf({ split: null }), 'none');
    assert.equal(splitShapeOf({ split: ['a'] }), 'array');
    assert.equal(splitShapeOf({ split: 'evaluation' }), 'string');
    assert.equal(splitShapeOf({ split: {} }), 'object');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(b) each cause alone turns the row RED, and the same file fixed turns it GREEN', () => {
  const dir = tmp();
  try {
    put(dir, 'ok.json', { isTheBar: true, split: SPLIT, statement: 'Fine.' });
    // no split
    put(dir, 'bare.json', { isTheBar: true, statement: 'A bar with no split.' });
    let r = rowOf(dir);
    assert.equal(r.ok, false);
    assert.deepEqual(r.noSplit, ['bare.json']);
    assert.deepEqual(r.causes, ['1 bar file(s) with no split: bare.json']);
    assert.ok(r.line.startsWith('CONTAMINATION RED: bar files (isTheBar true) 2 of 2 verdict files, with a split object 1, '), r.line);
    assert.ok(r.line.endsWith('; CAUSES (1): 1 bar file(s) with no split: bare.json'), r.line);
    put(dir, 'bare.json', { isTheBar: true, split: SPLIT, statement: 'A bar with no split.' });
    assert.equal(rowOf(dir).ok, true, 'fixed: GREEN');

    // a string split names the dataset split, not development against held out
    put(dir, 'named.json', { isTheBar: true, split: 'evaluation', statement: 'Solved on the evaluation split.' });
    r = rowOf(dir);
    assert.equal(r.ok, false);
    assert.deepEqual(r.splitNotObject, [{ file: 'named.json', split: 'string', value: 'evaluation' }]);
    assert.deepEqual(r.causes, ['1 bar file(s) whose split is not an object: named.json (string "evaluation")']);
    put(dir, 'named.json', { isTheBar: true, split: ['evaluation'], statement: 'x' });
    assert.deepEqual(rowOf(dir).causes, ['1 bar file(s) whose split is not an object: named.json (array)']);
    put(dir, 'named.json', { isTheBar: true, split: { development: 'none', heldOut: 'evaluation' }, statement: 'x' });
    assert.equal(rowOf(dir).ok, true);

    // contaminated at the top level, statement silent
    put(dir, 'top.json', { isTheBar: true, contaminated: true, split: SPLIT, statement: 'A clean-looking claim.' });
    r = rowOf(dir);
    assert.equal(r.ok, false);
    assert.deepEqual(r.unlabelled, ['top.json']);
    assert.deepEqual(r.causes, ['1 bar file(s) contaminated with a statement that does not say so: top.json']);
    // contaminated deep inside the split, statement silent
    put(dir, 'top.json', { isTheBar: true, split: SPLIT, statement: 'x' });
    put(dir, 'deep.json', { isTheBar: true, split: { development: 'GSM8K test', heldOut: { records: 'GSM8K test', contaminated: true, reason: 'developed on them' } }, statement: 'Held out 90 percent.' });
    r = rowOf(dir);
    assert.deepEqual(r.unlabelled, ['deep.json']);
    assert.equal(r.counts.contaminated, 1);
    // the statement says so: counted, and no longer a cause
    put(dir, 'deep.json', { isTheBar: true, split: { development: 'GSM8K test', heldOut: { records: 'GSM8K test', contaminated: true, reason: 'developed on them' } }, statement: 'Held out 90 percent, CONTAMINATED: developed on the same records.' });
    r = rowOf(dir);
    assert.equal(r.ok, true, r.line);
    assert.deepEqual(r.labelled, ['deep.json']);
    assert.equal(r.counts.labelled, 1);
    assert.equal(r.counts.unlabelled, 0);
    assert.ok(r.line.includes('contaminated and labelled 1 (deep.json), contaminated and unlabelled 0'), r.line);
    // the word is the rule: any spelling that begins contaminat, any case
    for (const s of ['contaminated', 'Contamination', 'CONTAMINATES']) assert.equal(CONTAMINATION_WORD.test(s), true, s);
    assert.equal(CONTAMINATION_WORD.test('clean'), false);
    // a false mark is not a contamination
    put(dir, 'deep.json', { isTheBar: true, split: { development: 'a', heldOut: 'b', contaminated: false }, statement: 'x' });
    assert.equal(rowOf(dir).counts.contaminated, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(c) an unread file is counted as unread, an empty directory grades nothing, and a missing one says so', () => {
  const dir = tmp();
  try {
    let r = rowOf(dir);
    assert.equal(r.ok, true);
    assert.equal(r.counts.bar, 0);
    assert.equal(r.line, 'CONTAMINATION GREEN: bar files (isTheBar true) 0 of 0 verdict files, so nothing was graded, with a split object 0, contaminated and labelled 0, contaminated and unlabelled 0, with no split 0, split not an object 0');
    put(dir, 'broken.json', '{"isTheBar": true, "split": ');
    put(dir, 'ok.json', { isTheBar: true, split: SPLIT, statement: 'x' });
    r = rowOf(dir);
    assert.deepEqual(r.unread, ['broken.json']);
    assert.equal(r.counts.unread, 1);
    assert.equal(r.counts.bar, 1, 'an unread file is not counted as a clean bar file');
    assert.ok(r.line.endsWith(', unread 1 (broken.json, counted as unread, not clean)'), r.line);
    const gone = path.join(dir, 'no-such-dir');
    r = rowOf(gone);
    assert.equal(r.counts.files, 0);
    assert.ok(r.line.includes('0 of no bench/verdicts directory, so nothing was graded'), r.line);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(d) a live autopilot lock makes the row a referee: printed in full, not ruling', () => {
  const dir = tmp();
  try {
    put(dir, 'bare.json', { isTheBar: true, statement: 'x' });
    const ref = { referee: true, why: 'a live autopilot holds state/self-code/autopilot.lock (pid 4242)' };
    const r = rowOf(dir, { referee: ref });
    assert.equal(r.ok, false);
    assert.equal(r.rules, false);
    assert.ok(r.line.startsWith('CONTAMINATION RED (REFEREE, not ruling: a live autopilot holds state/self-code/autopilot.lock (pid 4242)): bar files'), r.line);
    assert.ok(r.line.includes('CAUSES (1): 1 bar file(s) with no split: bare.json'), 'the causes are printed in full');
    const ruling = rowOf(dir, { referee: { referee: false, why: 'no lock' } });
    assert.equal(ruling.rules, true);
    assert.ok(ruling.line.startsWith('CONTAMINATION RED: '), ruling.line);
    // the same lock test the gate uses: a lock whose pid is alive is a referee, a dead one is not
    const root = tmp();
    try {
      put(path.join(root, 'state', 'self-code'), 'autopilot.lock', JSON.stringify({ pid: 4242, at: new Date().toISOString() }));
      assert.equal(refereeOf(root, { alive: () => true }).referee, true);
      assert.equal(refereeOf(root, { alive: () => false }).referee, false);
    } finally { rmSync(root, { recursive: true, force: true }); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(e) the real tree: the counts equal an independent census, and a real no-split bar file is caught and then passes', () => {
  const census = contaminationRecords(VERDICTS);
  const r = contaminationRow(census);
  // the independent census: its own parse, its own shape test, and a text count as a floor
  let bar = 0, obj = 0, none = 0, other = 0, unread = 0, files = 0, textBars = 0;
  const barNames = [];
  for (const name of readdirSync(VERDICTS).filter((n) => /\.json$/.test(n))) {
    files++;
    const text = readFileSync(path.join(VERDICTS, name), 'utf8');
    if (/"isTheBar"\s*:\s*true/.test(text)) textBars++;
    let v; try { v = JSON.parse(text); } catch { unread++; continue; }
    if (!v || Array.isArray(v) || v.isTheBar !== true) continue;
    bar++; barNames.push(name);
    const s = v.split;
    if (s === undefined || s === null) none++;
    else if (typeof s === 'object' && !Array.isArray(s)) obj++;
    else other++;
  }
  console.log('(e) ' + JSON.stringify({ files, bar, obj, none, other, unread, textBars, row: r.counts }));
  assert.equal(r.counts.files, files);
  assert.equal(r.counts.unread, unread);
  assert.equal(r.counts.bar, bar);
  assert.equal(r.counts.withSplit, obj);
  assert.equal(r.counts.noSplit, none);
  assert.equal(r.counts.splitNotObject, other);
  assert.equal(r.counts.withSplit + r.counts.noSplit + r.counts.splitNotObject, r.counts.bar, 'every bar file lands in exactly one shape');
  assert.ok(textBars >= bar, 'the text count is a floor: every parsed bar file spells isTheBar true');
  assert.equal(r.ok, r.causes.length === 0);
  for (const f of r.noSplit) assert.ok(r.line.includes(f), f + ' named on the line');
  for (const f of r.splitNotObject) assert.ok(r.line.includes(f.file), f.file + ' named on the line');
  // a real no-split bar file, copied, is caught; given a split, it passes (the row turns on the defect)
  if (r.noSplit.length) {
    const dir = tmp();
    try {
      const name = r.noSplit[0];
      const v = JSON.parse(readFileSync(path.join(VERDICTS, name), 'utf8'));
      put(dir, name, v);
      const caught = rowOf(dir);
      assert.equal(caught.ok, false);
      assert.deepEqual(caught.noSplit, [name]);
      put(dir, name, { ...v, split: SPLIT });
      assert.equal(rowOf(dir).ok, true, 'the same real file with a split passes');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
});

test('(f) the CLI prints the in-process line with the row\'s exit, and the gate in a fixture prints and keeps the row', { timeout: 110_000 }, () => {
  // the CLI on the real tree: no test run, no gate.json; its line is the in-process one (read before
  // and after, since another builder may write a verdict between the two reads)
  const before = contaminationRow(contaminationRecords(VERDICTS), { referee: refereeOf(ROOT) }).line;
  const gateJson = path.join(VERDICTS, 'gate.json');
  const gateBefore = (() => { try { return readFileSync(gateJson, 'utf8'); } catch { return null; } })();
  const c = spawnSync(process.execPath, ['bench/gate.mjs', '--contamination'], { cwd: ROOT, env: envNoTest(), encoding: 'utf8', timeout: 60_000 });
  const after = contaminationRow(contaminationRecords(VERDICTS), { referee: refereeOf(ROOT) });
  const cliLine = String(c.stdout).trim().split('\n').pop();
  assert.ok(cliLine === before || cliLine === after.line, 'the CLI line is the in-process line: ' + cliLine.slice(0, 200));
  assert.equal(c.status, after.ok || !after.rules ? 0 : 1, 'the exit is the row: 1 only when it is red and rules');
  assert.equal((() => { try { return readFileSync(gateJson, 'utf8'); } catch { return null; } })(), gateBefore, '--contamination writes no gate.json');

  // the whole gate, copied alone into a fixture tree with one bar file lacking a split
  const root = tmp();
  try {
    mkdirSync(path.join(root, 'bench'), { recursive: true });
    writeFileSync(path.join(root, 'bench', 'gate.mjs'), readFileSync(path.join(ROOT, 'bench', 'gate.mjs')));
    put(path.join(root, 'test'), 'ok.test.mjs', "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\ntest('ok', () => assert.equal(1 + 1, 2));\n");
    const vd = path.join(root, 'bench', 'verdicts');
    put(vd, 'planted.json', { at: '2026-09-26T00:00:00.000Z', command: 'x', node: 'v24', isTheBar: true, statement: 'A planted bar with no split.' });
    put(vd, 'clean.json', { at: '2026-09-26T00:00:00.000Z', command: 'x', node: 'v24', isTheBar: true, split: SPLIT, statement: 'A planted bar with a split.' });
    const r = spawnSync(process.execPath, ['--max-old-space-size=2000', 'bench/gate.mjs'], { cwd: root, env: envNoTest(), encoding: 'utf8', timeout: 100_000 });
    const out = (r.stdout || '') + (r.stderr || '');
    const line = out.split('\n').find((l) => l.startsWith('CONTAMINATION ')) || '';
    const gateLine = out.split('\n').find((l) => l.startsWith('GATE ')) || '';
    console.log('(f) ' + JSON.stringify({ status: r.status, line: line.slice(0, 200), gateLine: gateLine.slice(0, 300) }));
    assert.ok(line.startsWith('CONTAMINATION RED: bar files (isTheBar true) 2 of 2 verdict files, with a split object 1'), line);
    assert.ok(line.endsWith('; CAUSES (1): 1 bar file(s) with no split: planted.json'), line);
    assert.ok(gateLine.includes('contamination RED'), gateLine);
    assert.equal(r.status, 1);
    const gj = JSON.parse(readFileSync(path.join(vd, 'gate.json'), 'utf8'));
    assert.equal(gj.rows.contamination.ok, false);
    assert.deepEqual(gj.rows.contamination.noSplit, ['planted.json']);
    assert.equal(gj.rows.contamination.line, line.replace(/\r$/, ''));
    // the control: the planted file given a split, the row alone is GREEN and exits 0
    put(vd, 'planted.json', { at: '2026-09-26T00:00:00.000Z', command: 'x', node: 'v24', isTheBar: true, split: SPLIT, statement: 'A planted bar, now with a split.' });
    const g = spawnSync(process.execPath, ['bench/gate.mjs', '--contamination'], { cwd: root, env: envNoTest(), encoding: 'utf8', timeout: 60_000 });
    const gl = String(g.stdout).trim().split('\n').pop();
    assert.equal(g.status, 0, gl);
    assert.ok(gl.startsWith('CONTAMINATION GREEN: bar files (isTheBar true) 2 of 3 verdict files, with a split object 2'), gl);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
